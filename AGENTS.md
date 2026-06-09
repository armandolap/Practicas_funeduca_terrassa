# AGENTS.md — FunEduca CRM

## Stack (verified)

- **Backend**: Express 5 + mysql2/promise (no ORM) — raw SQL queries
- **Frontend**: Static HTML/CSS/JS served from `src/public/`
- **No tests**, no linter, no formatter configured

## Quickstart

```bash
cp .env.example .env   # edit DB creds + secrets
npm install            # in src/
node src/server.js     # or `npx nodemon src/server.js`
```

`.env` must be at project root, **not** in `src/` (`server.js:3` resolves `../.env`).

## Architecture (`src/`)

```
routes/{entity}.js → controllers/{entity}.js → repositories/{entity}.js
```

Every entity has the same CRUD pattern: `getAll`, `getById`, `create`, `update`, `remove`. Routes registered in `server.js:35-58` under root (`/paisos`, `/usuario`, etc.).

## Database

- Schema: `src/sql/Base_datos.sql` (schema name `mydb` — rename before deploying)
- All FK constraints: `ON DELETE NO ACTION`
- Charset: `utf8` (not utf8mb4)
- ~11 catalog tables (see README) — not user-editable, admin-only

## Key gotchas

- `middlewares/auth.js` is a stub — auth not wired up. `express-session`/`MySQLStore` fully commented out
- `package.json` has no `dev` script — use `node` or `nodemon` directly
- DB pool: `src/config/database.js` — `mysql2/promise` pool, 10-connection limit
- Express 5: `express.json()` is built-in
- Server startup (in order): `SET FK_CHECKS=0` → `Base_datos.sql` → `callejero_schema.sql` → `inserts_tablas_estaticas.sql` → `SET FK_CHECKS=1`
- Table name is `Direccio` (capital D) — case-sensitive on Linux MySQL
