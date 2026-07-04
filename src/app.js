// @ts-check
import { Hono } from 'hono';
import { API_VERSION } from '@fxck/contracts';
import { getPool } from './db.js';

/**
 * Build the Hono application. Importing this module does NOT open a database
 * connection or start a server — the pool is created lazily on the first
 * request that needs it, which keeps `/health` and unit tests DB-free.
 * @returns {Hono}
 */
export function createApp() {
  const app = new Hono();

  app.get('/health', (c) => c.json({ version: API_VERSION }));

  app.get('/todos', async (c) => {
    const { rows } = await getPool().query(
      'SELECT id, title, done FROM todos ORDER BY id ASC'
    );
    return c.json(rows);
  });

  return app;
}

export const app = createApp();
