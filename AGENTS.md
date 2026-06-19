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
2. Bootstrap connection (no DB selected)
3. `CREATE DATABASE IF NOT EXISTS` — no dropea si ja existeix
4. Comprova si la BD té taules (`information_schema.tables`)
   - Si **no** en té → executa `Base_datos.sql` (schema) + `inserts_tablas_estaticas.sql`
   - Si **ja en té** → salta esquema i inserts (no toca res)
5. **Mai** executa seed automàticament
6. Tanca connexió bootstrap → crea pool → `server.listen()`

**Important**: `dotenv` MUST be loaded before any repository is required (repos call `createPool()` at module load which reads env vars).

## Seed (dades de prova)

**Ja no s'executen automàticament.** Per inserir dades de prova:

```bash
cd src
npm run seed
```

Això esborra TOTES les dades de les taules i les torna a inserir (schema + inserts estàtics + dades de prova).

## Key gotchas

- `middlewares/auth.js` is a stub — auth not wired up. `express-session`/`MySQLStore` fully commented out
- DB pool: `src/config/database.js` — `mysql2/promise` pool, 10-connection limit
- Express 5: `express.json()` is built-in
- Pool is created at module load time by `seeder.js:3-5` (via `createPool()`), so the env must be loaded first
- El servidor **ja no borra la BD** en iniciar-se. Per forçar un reset complet: `node seeder/seeder.js`
- All `node` commands must be run from `src/` (packages installed there, not at root)

## Seed users (password: `1234` for all)

| Email                 | Password | Rol (idNivel_acceso) | Nom          |
|-----------------------|----------|----------------------|--------------|
| test@test.com         | 1234     | Admin (1)            | Usuari       |
| admin@test.com        | 1234     | Admin (1)            | Admin        |
| supervisor@test.com   | 1234     | Responsable zona (2) | Supervisor   |
| projectes@test.com    | 1234     | Responsable projectes (3) | Projectes |
| treballador@test.com  | 1234     | Treballador (4)      | Treballador  |
| visitant@test.com     | 1234     | Visitant (5)         | Visitant     |

## Auth

- Root `/` serves `login.html` (JWT-based, no sessions)
- `middlewares/auth.js` provides `requireAuth`, `requireRole`, `requireTotal` middlewares
- `POST /auth/login` returns JWT (24h expiry) — **pública**
- `GET /auth/me` returns current user (requires Bearer token)
- Frontend stores token + user in `localStorage`
- `sidebar.js` provides `requireAuth()` (redirects to `/login.html` if no token), `logout()`, `renderSidebar(activePage)`, and `authFetch(url, options)` (wraps `fetch()` adding the Bearer token automatically)
- After login, redirects to `/meus-projectes.html` for roles 2 & 3, otherwise `/clients.html`
- UI role gating: "Configuració" only for Admin (1), "Nou projecte" for Admin (1) + Resp zona (2), "Crear persona" for 1/2/3, etc.
- **Totes les rutes protegides** des de Juny 2026: tots els endpoints (`client`, `familia`, `domicili`, `usuari`, `centre_activitats`, `projectes`, `desplegables`, `reports`, `callejero`, i tots els catàlegs) requereixen `requireAuth` excepte `POST /auth/login`. Rutes sensibles (`callejero` POST) tenen `requireTotal` addicional.
