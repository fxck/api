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

/** The rows seeded on first startup. */
const SEED = [
  { title: 'Wire up the shared contract package', done: true },
  { title: 'Serve todos from Postgres', done: false },
  { title: 'Render the list in the web service', done: false },
];

/**
 * Idempotent startup migration: create the todos table if missing and seed
 * three rows exactly once (only when the table is empty). Safe to run on
 * every boot.
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
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM todos');
  if (rows[0].count === 0) {
    for (const t of SEED) {
      await db.query('INSERT INTO todos (title, done) VALUES ($1, $2)', [
        t.title,
        t.done,
      ]);
    }
  }
}
