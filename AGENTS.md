# AGENTS.md — FunEduca CRM

## Stack (verified)

- **Backend**: Express 5 + mysql2/promise (no ORM) — raw SQL queries
- **Frontend**: Static HTML/CSS/JS served from `src/public/`
- **Integration tests**: `AI_test.js` (~130 automated + 7 manual blocks)
- **No linter**, no formatter configured

## Quickstart

```bash
cp .env.example .env            # edit DB_PASSWORD if needed
cd src && npm install && npm run dev   # or `node server.js`
```

Schema + static data load **automatically** on first start (no manual import).

`.env` must be at project root, **not** in `src/` (`server.js:3` resolves `../.env`).

## Architecture (`src/`)

```
routes/{entity}.js → controllers/{entity}.js → repositories/{entity}.js
```

Every entity has the same CRUD pattern: `getAll`, `getById`, `create`, `update`, `remove`. Routes registered in `server.js:35-58` under root (`/paisos`, `/usuario`, etc.).

## Database

- Schema: `src/sql/Base_datos.sql` (schema name `crm_funeduca` — rename before deploying)
- All FK constraints: `ON DELETE NO ACTION`
- Charset: `utf8` (not utf8mb4)
- ~11 catalog tables (see README) — not user-editable, admin-only

## CRITICAL: Table name case sensitivity

- MariaDB on Linux has `lower_case_table_names=0` → **table names are case-sensitive**
- All table names in the schema and queries must match **exactly**
- Actual table names in the DB are **all lowercase** (e.g. `pais`, `tipus_domicili`, `callejero`, `genere`, etc.)
- Exceptions (capitalized): `Nivel_acceso`, `Responsables` (created with caps in schema)
- `inserts_tablas_estaticas.sql` was fixed to use lowercase table names (was using `Callejero`, `Pais`, `Genere`, etc.)

## Startup flow (server.js)

1. Load `.env` from project root (REQUIRED before any route/repo require)
2. Bootstrap connection: `DROP DATABASE IF EXISTS` → `CREATE DATABASE` → `USE`
3. Run `Base_datos.sql` (schema) then `inserts_tablas_estaticas.sql` (static data)
4. Run `seeder/insertTestData()` (seed data — 1 user, 5 families, 7 clients, etc.)
5. Close bootstrap connection → create pool → `server.listen()`

**Important**: `dotenv` MUST be loaded before any repository is required (repos call `createPool()` at module load which reads env vars).

## Key gotchas

- `middlewares/auth.js` is a stub — auth not wired up. `express-session`/`MySQLStore` fully commented out
- DB pool: `src/config/database.js` — `mysql2/promise` pool, 10-connection limit
- Express 5: `express.json()` is built-in
- Pool is created at module load time by `seeder.js:3-5` (via `createPool()`), so the env must be loaded first
- Server exits on duplicate key errors from seeder — `server.js` now drops/recreates DB on each start to ensure clean slate
- All `node` commands must be run from `src/` (packages installed there, not at root)

## Seed users (password: `1234` for all)

| Email               | Password | Rol (idNivel_acceso) | Nom        |
|---------------------|----------|----------------------|------------|
| test@test.com       | 1234     | Total (1)            | Usuari     |
| admin@test.com      | 1234     | Total (1)            | Admin      |
| supervisor@test.com | 1234     | Responsable zona (2) | Supervisor |
| visitant@test.com   | 1234     | Viewer (3)           | Visitant   |

## Auth

- Root `/` serves `login.html` (JWT-based, no sessions)
- `middlewares/auth.js` provides `requireAuth`, `requireRole`, `requireTotal` middlewares
- `POST /auth/login` returns JWT (24h expiry)
- `GET /auth/me` returns current user (requires Bearer token)
- Frontend stores token + user in `localStorage`
- `sidebar.js` provides `requireAuth()` (redirects to `/login.html` if no token), `logout()`, and `renderSidebar(activePage)`
- After login, redirects to `/clients.html`
- UI role gating: "Configuració" only for Total (1), "Nou projecte" for Total (1) + Responsable (2), etc.
