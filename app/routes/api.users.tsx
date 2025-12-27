import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { json } from '../utils/json';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../db';

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get('id');

  try {
    if (userId) {
      const user = await getUser(parseInt(userId));
      return json(user || null);
    }
    const users = await getUsers();
    return json(users);
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
    const name = data.name;
    const email = data.email;
    const id = data.id;

    switch (action) {
      case 'create': {
        if (!name || !email) {
          return json(
            { error: 'Missing required fields: name, email' },
            { status: 400 }
          );
        }
        const user = await createUser(String(name), String(email));
        return json(user, { status: 201 });
      }

      case 'update': {
        if (!id || !name || !email) {
          return json(
            { error: 'Missing required fields: id, name, email' },
            { status: 400 }
          );
        }
        const user = await updateUser(parseInt(String(id)), String(name), String(email));
        return json(user);
      }

      case 'delete': {
        if (!id) {
          return json({ error: 'Missing required field: id' }, { status: 400 });
        }
        await deleteUser(parseInt(String(id)));
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
