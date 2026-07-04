# api

Hono API serving todos from Postgres. Depends on
[`@fxck/contracts`](https://github.com/fxck/contracts) as a git dependency.

## Endpoints

- `GET /health` → `{ "version": API_VERSION }` (from the shared contract).
- `GET /todos` → JSON array of todo rows read from Postgres.

## Database

An idempotent startup migration creates the `todos` table and seeds three rows
on first boot. The connection string comes from `DATABASE_URL`.

## Scripts

- `npm start` — run the server (`node src/index.js`).
- `npm run typecheck` — `tsc --noEmit`.
- `npm test` — `node --test`.

## Deploy (Zerops)

Deployed to the `apidev` service via direct `zcli push`. `zerops.yml` wires
`DATABASE_URL` to the managed Postgres service (`${db_connectionString}`) and
serves HTTP on port 3000.
