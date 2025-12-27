import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { json } from '../utils/json';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../db';

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(request.url);
  const taskId = url.searchParams.get('id');
  const userId = url.searchParams.get('userId');

  try {
    if (taskId) {
      const task = await getTask(parseInt(taskId));
      return json(task || null);
    }
    if (userId) {
      const tasks = await getTasks(parseInt(userId));
      return json(tasks);
    }
    return json({ error: 'Missing required parameter: userId or id' }, { status: 400 });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const data = await request.json();
    const action = data.action;
    const userId = data.userId;
    const title = data.title;
    const description = data.description;
    const id = data.id;
    const completed = data.completed;

    switch (action) {
      case 'create': {
        if (!userId || !title) {
          return json(
            { error: 'Missing required fields: userId, title' },
            { status: 400 }
          );
        }
        const task = await createTask(
          parseInt(String(userId)),
          String(title),
          String(description || '')
        );
        return json(task, { status: 201 });
      }

      case 'toggle': {
        if (!id) {
          return json({ error: 'Missing required field: id' }, { status: 400 });
        }
        const task = await updateTask(
          parseInt(String(id)),
          undefined,
          undefined,
          typeof completed === 'boolean' ? completed : false
        );
        return json(task);
      }

      case 'delete': {
        if (!id) {
          return json({ error: 'Missing required field: id' }, { status: 400 });
        }
        await deleteTask(parseInt(String(id)));
        return json({ success: true });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
