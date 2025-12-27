import { useState, useCallback, useEffect } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import type { SqlValue } from "../db";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../db";
import { json } from "../utils/json";

export async function loader({ request }: LoaderFunctionArgs) {
  const users = await getUsers();
  const tasks = await getAllTasks();
  return { users, tasks };
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const action = formData.get("action");

    switch (action) {
      case "create": {
        const name = formData.get("name");
        const email = formData.get("email");
        if (!name || !email) {
          return json(
            { error: "Missing required fields: name, email" },
            { status: 400 }
          );
        }
        const user = await createUser(String(name), String(email));
        return json(user, { status: 201 });
      }

      case "update": {
        const id = formData.get("id");
        const name = formData.get("name");
        const email = formData.get("email");
        if (!id || !name || !email) {
          return json(
            { error: "Missing required fields: id, name, email" },
            { status: 400 }
          );
        }
        const user = await updateUser(
          parseInt(String(id)),
          String(name),
          String(email)
        );
        return json(user);
      }

      case "delete": {
        const id = formData.get("id");
        if (!id) {
          return json({ error: "Missing required field: id" }, { status: 400 });
        }
        await deleteUser(parseInt(String(id)));
        return json({ success: true });
      }

      case "create_task": {
        const userId = formData.get("userId");
        const title = formData.get("title");
        const description = formData.get("description");
        if (!userId || !title) {
          return json(
            { error: "Missing required fields: userId, title" },
            { status: 400 }
          );
        }
        const task = await createTask(
          parseInt(String(userId)),
          String(title),
          String(description || "")
        );
        return json(task, { status: 201 });
      }

      case "toggle_task": {
        const id = formData.get("id");
        const completed = formData.get("completed");
        if (!id) {
          return json({ error: "Missing required field: id" }, { status: 400 });
        }
        const task = await updateTask(
          parseInt(String(id)),
          undefined,
          undefined,
          completed === "true"
        );
        return json(task);
      }

      case "delete_task": {
        const id = formData.get("id");
        if (!id) {
          return json({ error: "Missing required field: id" }, { status: 400 });
        }
        await deleteTask(parseInt(String(id)));
        return json({ success: true });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

interface User {
  id?: number;
  name: string;
  email: string;
  created_at?: string;
}

interface Task {
  id?: number;
  user_id: number;
  title: string;
  description: string;
  completed: number;
  created_at?: string;
}

interface LoaderData {
  users: SqlValue[][];
  tasks: Record<number, SqlValue[][]>;
}

export default function DatabasePage() {
  const { users: loaderUsers, tasks: loaderTasks } = useLoaderData<LoaderData>();
  const users = (loaderUsers || []).map((row) => ({
    id: row[0] as number,
    name: row[1] as string,
    email: row[2] as string,
    created_at: row[3] as string,
  }));
  const tasks = Object.entries(loaderTasks || {}).reduce(
    (acc, [userId, taskRows]) => {
      acc[parseInt(userId)] = taskRows.map((row) => ({
        id: row[0] as number,
        user_id: row[1] as number,
        title: row[2] as string,
        description: row[3] as string,
        completed: row[4] as number,
        created_at: row[5] as string,
      }));
      return acc;
    },
    {} as Record<number, Task[]>
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Fetchers for CRUD operations
  const userFetcher = useFetcher();
  const taskFetcher = useFetcher();

  // User form state
  const [userForm, setUserForm] = useState({ name: "", email: "" });

  // Task form state
  const [taskForm, setTaskForm] = useState({ title: "", description: "" });

  const handleCreateUser = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!userForm.name || !userForm.email) {
        setError("Please fill in all fields");
        return;
      }

      userFetcher.submit(
        {
          action: editingUserId ? "update" : "create",
          id: editingUserId || "",
          ...userForm,
        },
        { method: "post" },
      );
    },
    [userForm, editingUserId, userFetcher],
  );

  const handleCreateTask = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!taskForm.title || !selectedUserId) {
        setError("Please fill in required fields");
        return;
      }

      taskFetcher.submit(
        { action: "create_task", userId: selectedUserId, ...taskForm },
        { method: "post" },
      );
    },
    [taskForm, selectedUserId, taskFetcher],
  );

  const handleDeleteUser = useCallback(
    (userId: number) => {
      if (
        !confirm(
          "Are you sure you want to delete this user and all their tasks?",
        )
      ) {
        return;
      }

      userFetcher.submit(
        { action: "delete", id: userId },
        { method: "post" },
      );
    },
    [userFetcher],
  );

  const handleToggleTask = useCallback(
    (taskId: number, completed: boolean) => {
      if (!selectedUserId) return;

      taskFetcher.submit(
        { action: "toggle_task", id: taskId, completed: String(!completed) },
        { method: "post" },
      );
    },
    [selectedUserId, taskFetcher],
  );

  const handleDeleteTask = useCallback(
    (taskId: number) => {
      if (!selectedUserId) return;

      taskFetcher.submit(
        { action: "delete_task", id: taskId },
        { method: "post" },
      );
    },
    [selectedUserId, taskFetcher],
  );

  const startEditingUser = useCallback((user: User) => {
    setEditingUserId(user.id || null);
    setUserForm({ name: user.name, email: user.email });
  }, []);

  const cancelEditUser = useCallback(() => {
    setEditingUserId(null);
    setUserForm({ name: "", email: "" });
  }, []);

  // Clear task form when task fetcher completes submission
  useEffect(() => {
    if (taskFetcher.state === "idle" && taskFetcher.data) {
      setTaskForm({ title: "", description: "" });
    }
  }, [taskFetcher.state, taskFetcher.data]);

  return (
    <div style={styles.container}>
      <h1>SQLite Database Management</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        {/* Users Section */}
        <section style={styles.section}>
          <h2>Users</h2>

          <form onSubmit={handleCreateUser} style={styles.form}>
            <input
              type="text"
              placeholder="Name"
              value={userForm.name}
              onChange={(e) =>
                setUserForm({ ...userForm, name: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
              style={styles.input}
            />
            <button
              type="submit"
              disabled={userFetcher.state !== "idle"}
              style={styles.button}
            >
              {editingUserId ? "Update User" : "Create User"}
            </button>
            {editingUserId && (
              <button
                type="button"
                onClick={cancelEditUser}
                style={{ ...styles.button, background: "#6c757d" }}
              >
                Cancel
              </button>
            )}
          </form>

          <div style={styles.list}>
            {users.length === 0 ? (
              <p style={{ color: "#999" }}>No users yet</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    ...styles.listItem,
                    background:
                      selectedUserId === user.id ? "#e7f3ff" : "#f9f9f9",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedUserId(user.id || null)}
                >
                  <div>
                    <strong>{user.name}</strong>
                    <br />
                    <small style={{ color: "#666" }}>{user.email}</small>
                  </div>
                  <div style={styles.actions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingUser(user);
                      }}
                      style={{ ...styles.smallButton, background: "#007bff" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.id!);
                      }}
                      style={{ ...styles.smallButton, background: "#dc3545" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Tasks Section */}
        <section style={styles.section}>
          <h2>Tasks</h2>

          {selectedUserId ? (
            <>
              <form onSubmit={handleCreateTask} style={styles.form}>
                <input
                  type="text"
                  placeholder="Task Title"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  style={styles.input}
                />
                <textarea
                  placeholder="Description (optional)"
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  style={{ ...styles.input, minHeight: "60px" }}
                />
                <button
                  type="submit"
                  disabled={taskFetcher.state !== "idle"}
                  style={styles.button}
                >
                  Add Task
                </button>
              </form>

              <div style={styles.list}>
                {(tasks[selectedUserId] || []).length === 0 ? (
                  <p style={{ color: "#999" }}>No tasks yet</p>
                ) : (
                  (tasks[selectedUserId] || []).map((task) => (
                    <div key={task.id} style={styles.listItem}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={task.completed === 1}
                          onChange={() =>
                            handleToggleTask(task.id!, task.completed === 1)
                          }
                          style={{ marginRight: "8px" }}
                        />
                        <strong
                          style={{
                            textDecoration:
                              task.completed === 1 ? "line-through" : "none",
                          }}
                        >
                          {task.title}
                        </strong>
                        {task.description && (
                          <div style={{ fontSize: "0.9em", color: "#666" }}>
                            {task.description}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id!)}
                        style={{ ...styles.smallButton, background: "#dc3545" }}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p style={{ color: "#999" }}>Select a user to view their tasks</p>
          )}
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Inter, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "20px",
  },
  section: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  button: {
    padding: "10px 16px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "12px",
    background: "#f9f9f9",
    border: "1px solid #eee",
    borderRadius: "4px",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  smallButton: {
    padding: "6px 10px",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  error: {
    padding: "12px",
    background: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    marginBottom: "20px",
  },
};
