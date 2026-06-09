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

Every entity has the same CRUD pattern: `getAll`, `getById`, `create`, `update`, `remove`. Routes registered in `server.js:25-37` under root (`/paisos`, `/usuario`, etc.).

## Database

- Schema: `src/sql/Base_datos.sql` (schema name `mydb` — rename before deploying)
- All FK constraints: `ON DELETE NO ACTION`
- Charset: `utf8` (not utf8mb4)
- ~11 catalog tables (see README) — not user-editable, admin-only

## Key gotchas

- `callejero.js` has routes/controllers/repos but is **not** registered in `server.js`
- `middlewares/auth.js` is a stub — auth not wired up. `express-session`/`MySQLStore` fully commented out
- `package.json` has no `dev` script — use `node` or `nodemon` directly
- `public/css/css/` and `public/js/js/` have accidental nested dirs (flat structure intended)
- DB pool: `src/config/database.js` — `mysql2/promise` pool, 10-connection limit
- Express 5: `express.json()` is built-in
