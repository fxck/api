// @ts-check
import pg from 'pg';

/** @type {pg.Pool | undefined} */
let pool;

/**
 * Lazily create (and reuse) the Postgres connection pool.
 * @returns {pg.Pool}
 */
export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new pg.Pool({ connectionString });
  }
  return pool;
}

/** The rows seeded on first startup, each with a priority. */
const SEED = [
  { title: 'Wire up the shared contract package', done: true, priority: 'high' },
  { title: 'Serve todos from Postgres', done: false, priority: 'medium' },
  { title: 'Render the list in the web service', done: false, priority: 'low' },
];

/**
 * Idempotent startup migration: create the todos table if missing, add the
 * `priority` column (contract 1.1.0), seed three rows on first boot, and
 * backfill priorities for the known seed rows. Safe to run on every boot.
 * @returns {Promise<void>}
 */
export async function migrate() {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id    SERIAL PRIMARY KEY,
      title TEXT    NOT NULL,
      done  BOOLEAN NOT NULL DEFAULT false
    );
  `);
  // Contract 1.1.0: add the priority column. Idempotent — existing rows get
  // the default and are backfilled below.
  await db.query(
    `ALTER TABLE todos ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';`
  );
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM todos');
  if (rows[0].count === 0) {
    for (const t of SEED) {
      await db.query(
        'INSERT INTO todos (title, done, priority) VALUES ($1, $2, $3)',
        [t.title, t.done, t.priority]
      );
    }
  } else {
    // Backfill priorities for the known seed rows migrated from 1.0.0.
    for (const t of SEED) {
      await db.query('UPDATE todos SET priority = $1 WHERE title = $2', [
        t.priority,
        t.title,
      ]);
    }
  }
}
