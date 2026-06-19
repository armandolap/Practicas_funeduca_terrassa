## Build Prompt: FunEduca CRM — Complete Implementation

### Context

You are building the complete FunEduca CRM from the existing codebase at `/home/jhh/Documents/REPOS/funeduca/Practicas_funeduca_terrassa/src/`. The backend uses Express 5 + mysql2/promise with raw SQL. The frontend is static HTML/CSS/JS served from `src/public/`. Architecture: `routes/{entity}.js → controllers/{entity}.js → repositories/{entity}.js`.

The database schema (`src/sql/Base_datos.sql`) and static data (`src/sql/inserts_tablas_estaticas.sql`) are loaded automatically by `src/server.js` on first start. Test data (5 families, 7 clients, 1 project, 1 usuari, 1 centre_activitats) is seeded by `src/seeder/seeder.js` → `insertTestData()` called from `server.js`.

Read `AGENTS.md` and all view spec files in `src/views/` first — every view description file defines what the page must show and what functions it needs.

**Blocked**: MySQL/MariaDB is not accessible in this environment. Do NOT try to run the server or tests.

---

### Schema Fixes (Base_datos.sql)

1. **`usuario_app` table**: Remove `UNIQUE` from `idNivel_acceso` (line 438). Add `password VARCHAR(255) NOT NULL` column.
2. **`necessitats_especials_has_client` table**: Still in schema but no longer used (NESE is now a FK on `client.idNecessitat_especial`). Keep it for now (don't break existing schema), note it's deprecated.

---

### Backend Work

#### 1. Auth System (`routes/auth.js`, `controllers/auth.js`, `middlewares/auth.js`)

- `POST /auth/login` — receives `{email, password}`, looks up `usuario_app` by email, compares password (use `bcrypt`), returns JWT containing `{idUsuario_APP, idNivel_acceso, Nom, Cognoms}`.
- `middlewares/auth.js` — export middleware functions: `requireAuth` (any logged-in user), `requireRole(...roles)` (must have one of specified `idNivel_acceso` values), `requireTotal` (only idNivel_acceso=1).
- Install `bcrypt` and `jsonwebtoken` npm packages.
- Add `password` hashing to `usuario_app` create/update controller.

#### 2. centre_activitats CRUD (`routes/centre_activitats.js`, `controllers/centre_activitats.js`, `repositories/centre_activitats.js`)

Full CRUD:
- `GET /centre-activitats` — list all, join with `direccio` → `callejero` → `tipus_via`, `barri`, `codi_postal` to return full address.
- `GET /centre-activitats/search?q=&idcallejero=&nom_carrer=` — search by name and/or address (like domicile search).
- `GET /centre-activitats/:id` — detail.
- `POST /centre-activitats` — create (accepts `{nom_centre_activitats, direccio: {idcallejero, Num_calle, Pis, Escala}}` — creates direccio if needed).
- `PUT /centre-activitats/:id` — update.
- `DELETE /centre-activitats/:id` — remove.

Register in `server.js` under `/centre-activitats`.

#### 3. Project Enhancements (`routes/projectes.js`, `controllers/projectes.js`, `repositories/projectes.js`)

- `GET /projectes?filter=activos|pasados|todos&q=cadena` — filter projects by active/inactive (based on `fecha_inicio_act`/`fecha_fin_act` vs today), and by name search string. Return each with `inscritos` as `COUNT` from `proyectos_has_client`.
- `GET /projectes/:id` — enhance to include: responsable info (join usuario_app), centre_activitats info with full address, list of enrolled clients (join `proyectos_has_client` + `client` + `familia`).
- `POST /projectes` — already works, but `inscritos` should be set to 0 on creation (calculated on read). Ensure `idcentre_activitats` is validated.
- `PUT /projectes/:id` — already works.
- `DELETE /projectes/:id` — already works, also clean up `Responsables` and `proyectos_has_client`.
- `POST /projectes/:id/clients` — add clients to project. Body: `{clientIds: [1,2,3]}`. Insert into `proyectos_has_client`.
- `DELETE /projectes/:id/clients/:idClient` — remove client from project.

#### 4. Usuari_app Enhancements (`routes/usuari.js`, `controllers/usuari.js`, `repositories/usuari.js`)

- `GET /usuario?filter=tots|responsables|trabajadores&q=cadena` — filter by role (Resp. de projecte = idNivel_acceso 4? Check inserts_tablas_estaticas.sql for exact IDs). Return with: `num_projectes_oberts`, `num_projectes_actius`, `num_persones_en_projectes_actius`.
- `GET /usuario/:id` — enhance to return: personal info, list of projects (with status: obert/tancat, actiu/inactiu), counts (#projectes, #oberts, #actius, #inactius, #tancats).
- `POST /usuario` — add password hashing. Required: `{Nom, Cognoms, email, Telefon, idNivel_acceso, password}`.
- `PUT /usuario/:id` — add password hashing if password provided.
- `DELETE /usuario/:id` — check no projects assigned before deleting.

#### 5. Reports (`routes/reports.js`, `controllers/reports.js`, `repositories/reports.js`)

Create all report endpoints from `src/views/H1` spec:

- `GET /reports/projectes/generesEdats` — per project: gender × age segments (0-3, 4-6, 7-9, 10-12, 13-15, 16-18, 18-30, 30-65, +65), totals.
- `GET /reports/genere` — gender totals annual.
- `GET /reports/sitEco` — situacio_economica × rol (fill/adult).
- `GET /reports/rolFam` — rol familiar totals annual.
- `GET /reports/tipHab` — tipus_domicili counts.
- `GET /reports/cont` — counters: total usuaris unics, families uniques, baixes (total, dones, homes, no binari).
- `GET /reports/neses` — necessitats_especials totals per gender.
- `GET /reports/sebasDev` — SEBAS seguiment + derivacions totals.
- `GET /reports/cursAny/:any` — curs_actual totals for year, resultat_academic breakdown with percentages.
- `GET /reports/resAcad` — resultat_academic totals.
- `GET /reports/motiusBaixa` — motiu_baixa × total persones.
- `GET /reports/riscos` — risc × total.
- `GET /reports/països` — paisos (nacionalitat vs naixement) totals.

Register in `server.js` under `/reports`.

#### 6. Client Enhancements (`routes/client.js`, `controllers/client.js`, `repositories/client.js`)

- `GET /client?q=&familia=&genere=&barri=&edatMin=&edatMax=` — filterable client list with all filters from D1 view spec.
- `GET /client/:id` — enhance to return full detail per D2 view spec: personal info, family info, domicile info (full address), project history (with filter by active/future/past/all), edad, temps entitat, #activitats fetes.
- `PUT /client/:id` — already exists.
- `POST /client/full` — already exists.
- `DELETE /client/:id` — already exists.

#### 7. Family Enhancements (`routes/familia.js`, `controllers/familia.js`, `repositories/familia.js`)

- `GET /familia?q=&estructura=&barri=&centreCoord=&offset=&limit=` — filtered list per E1 spec (10-15 at a time, alphabetical). Return: `idFamilia, Cognom_familiar, num_membres, num_menors, num_majors, estructura_familiar, domicili_principal, centre_coordinacio`.
- `GET /familia/:id` — enhance per E2 spec: return cognoms, estructura_familiar, array of domicilis (with full address), array of membres (nom, rol, edat), array of projectes from all members.

#### 8. Domicili Enhancements (`routes/domicili.js`, `controllers/domicili.js`, `repositories/domicili.js`)

- `GET /domicili?barri=&tipus=&centreCoord=&offset=&limit=` — filtered list per G1 spec.
- `GET /domicili/:id` — enhance per G2 spec: return full address, tipus_domicili, array of persones (with nom, cognoms, estat, familia info), array of families, array of projectes from associated people.

---

### Frontend Views

All views go in `src/public/` as `.html` files + corresponding `.js` files in `src/public/js/`. Use the same pattern as `index.html` + `client-create.js`.

Each page needs:
- A `<link>` to a CSS file in `src/public/css/`
- A sidebar navigation (reuse pattern from `index.html`, but make it dynamic/role-aware if possible)
- The page content area

#### 0. Login Page (`login.html`, `js/login.js`)

- Email + password form
- On success, store JWT in `localStorage`, redirect to project list (A1)
- Show error on failure
- If already logged in (JWT exists), redirect to A1

#### 1. Update Sidebar (in all pages)

Sidebar should have:
- "Projectes" → `/projectes.html`
- "Clients" → `/clients.html`
- "Families" → `/families.html`
- "Responsables/Treballadors" → `/usuaris.html`
- "Domicilis" → `/domicilis.html`
- "Informes" → `/informes.html`
- "Configuració" (only for Total/R. Zona) → `/config.html`
- "Crear persona" → `/index.html` (existing)
- Role-based visibility: Config only for Total; Crear persona for Total, R. Zona, Responsable proj.

JavaScript in sidebar: read JWT from localStorage, decode to get role, show/hide items.

#### 2. A1 — Project List (`projectes.html`, `js/projectes.js`)

Per `src/views/A1 projectes`:
- Top: "Crear projecte" button, filter buttons: Actius / Passats / Tots, search text input
- List of projects (newest first), each showing: Nom_projecte, fecha_inicio_act, fecha_fin_act, aforo/plazas, responsable, centre_activitats name
- Click project → go to `projecte.html?id=X`
- "Crear projecte" button → go to `projecte-crear.html`
- Only show "Crear projecte" button if user role allows it (Total, R. Zona, Responsable proj.)
- Use `GET /projectes?filter=&q=`

#### 3. A2 — Project Detail + Project Create (`projecte.html`, `projecte-crear.html`, `js/projecte.js`, `js/projecte-crear.js`)

Per `src/views/A2 projecte detalle`:
- Project name in large text
- Status badges: Abierto/Cerrado, Activo/Inactivo (calculated from dates)
- Dates, participants count, aforo
- Responsable: name, phone, email (from usuario_app)
- Centre coordinació info placeholder (if no table, show "No disponible")
- Centre activitats: name + full address
- Description
- **Participant list**: table of enrolled clients (name, cognoms, familia, edit/remove button)
- **Add participant**: search/browse clients button → modal or inline search to add clients
- "Edit" button (only if user can edit this project: Total, R. Zona, or Responsable proj. who is the responsable)
- Remove client button (only for authorized users)

**Project Create Form** (`projecte-crear.html`, `js/projecte-crear.js`):
- Fields: Nom_projecte, Descripcio, plazas, fecha_inicio_act (optional), fecha_fin_act (optional)
- **Centre activitats search**: Input for center name + integrated address search (like client-create.js domicile search but for centre_activitats). Shows dropdown matching by name and/or address. If no existing match, allows creating new: fills form with `nom_centre_activitats`, then address fields (tipus_via, nom_calle, num, pis, escala, barri, CP).
- Responsable: dropdown of users with role Responsable proj. or Total.
- On submit: POST `/projectes` with nested `{projecte: {...}, responsable: id}`.

#### 4. D1 — Client List (`clients.html`, `js/clients.js`)

Per `src/views/D1 clientes(usuario proyecto)`:
- "Crear nuevo" button → `/index.html` (existing form)
- Filters: text search (nom/cognoms), age segment dropdown (0-3, 4-6, 7-9, 10-12, 13-15, 16-18, 18-30, 30-65, +65), family dropdown (lazy-loaded), gender dropdown, barri dropdown
- Results list: Nom, Cognoms, Edad, Familia, Projectes (comma-separated)
- 10-15 per page (pagination or infinite scroll)
- Click → `client.html?id=X`
- Use `GET /client?q=&familia=&genere=&barri=&edatMin=&edatMax=`

#### 5. D2 — Client Detail (`client.html`, `js/client.js`)

Per `src/views/D2 clientes detalle`:
- Left: Nom i cognoms (large), Edat, Genere, Temps a l'associació, Quantitat activitats fetes
- Right: Familia name (link to `familia.html?id=X`), Domicili full address (link to `domicili.html?id=X`), Telefon, Correu
- Bottom: Project filter tabs — Actius / Inscrit-futur / Passats / Tots
- List of projects: nom_projecte, estat (obert/tancat, actiu/inactiu), data_fi_activitat
- "Edit" button (only if authorized: Total, R. Zona, Responsable proj., Treballador?)
- **Assign/Remove project** (for Treballador: can only assign/remove, not edit other data):
  - Button "Assignar a projecte" → modal with project search
  - Button "Treure del projecte" next to each project
- Use `GET /client/:id`, `POST /projectes/:id/clients`, `DELETE /projectes/:id/clients/:idClient`

#### 6. E1 — Family List (`families.html`, `js/families.js`)

Per `src/views/E1 llistat families`:
- Filters: text search (cognom), estructura_familiar dropdown, barri dropdown
- List: Cognom_familiar, num_membres, num_menors/num_majors, estructura_familiar, domicili_principal, centre_coordinacio
- Alphabetical, 10-15 per page
- Click → `familia.html?id=X`

#### 7. E2 — Family Detail (`familia.html`, `js/familia.js`)

Per `src/views/E2 vfamilia detalle`:
- Header: Cognom_familiar + Estructura_familiar
- Domicilis associats: list with full addresses
- Membres: table with Nom, Cognoms, Rol, Edat, link to client detail
- Projectes: list of all projects from all members (deduplicated)
- Centre coordinació info

#### 8. C1/F1 — Usuari App List (`usuaris.html`, `js/usuaris.js`)

Per `src/views/C1 responsable projecte` and `F1`:
- "Crear usuari" button (only Total, R. Zona) → `usuari-crear.html`
- Filter buttons: Tots / Responsables / Treballadors
- Text search by nom/cognoms
- Results: Nom, Cognoms, Rol (Nivel_acceso), Telefon, email, num_projectes_actius, num_projectes_oberts, num_persones_en_projectes_actius
- Ordered by quantity of active projects
- Click → `usuari.html?id=X`

#### 9. C2/F2 — Usuari Detail (`usuari.html`, `js/usuari.js`)

Per `src/views/C2 responsable projecte detalle` and `F2`:
- Header: Nom i Cognoms (large)
- Contact info: email, telefon, rol (Nivel_acceso)
- Project stats: [#projectes] [#oberts] [#actius] [#inactius] [#tancats]
- Project list: table with nom, participants, estat, dates
- "Edit" button (only Total, R. Zona)

#### 10. Usuari Create/Edit (`usuari-crear.html`, `js/usuari-crear.js`)

- Fields: Nom, Cognoms, email, Telefon, idNivel_acceso (dropdown), password
- Only accessible by Total access level
- POST `/usuario` with hashed password

#### 11. G1 — Domicili List (`domicilis.html`, `js/domicilis.js`)

Per `src/views/G1 vista domicilis`:
- Filters: barri, tipus_domicili
- List: full address, tipus_domicili, quantitat gent, familia principal
- Click → `domicili.html?id=X`

#### 12. G2 — Domicili Detail (`domicili.html`, `js/domicili.js`)

Per `src/views/G2 domicili detalle`:
- Full address + tipus_domicili
- Persones: table (nom, cognoms, familia, estat, link to client detail)
- Families: nom familia, num_membres, estructura_familiar
- Projectes: list from associated people

#### 13. H1 — Reports (`informes.html`, `js/informes.js`)

Per `src/views/H1`:
- Top: row of buttons, one per report type (Projectes/generesEdats, Genère, Sit. Econòmica, Rol Familiar, Tipus Habitatge, Comptadors, NESE, SEBAS/Deriv., Curs Actual, Res. Acadèmic, Motius Baixa, Riscos, Països)
- Below buttons: "Exportar informe actual CSV" and "Exportar tots CSV"
- Main area: table rendering the selected report data
- CSV export: convert current table to CSV and download
- "Exportar tots": fetch all reports, combine into one CSV, download

#### 14. H2 — Config (`config.html`, `js/config.js`)

Per `src/views/H2`:
- Only visible to Total access level
- Dropdown to select which static table to manage (estructura_familiar, pais, sebas, motiu_baixa, risc, genere, rol, situacio_economica, necessitats_especials, curs_actual, resultat_academic, tipus_domicili, barri, codi_postal, tipus_via, Nivel_acceso)
- Table view showing all records with "Afegir" button and "Eliminar" button per row
- "Afegir" → inline form or modal to add new record
- "Eliminar" → confirm then DELETE
- Uses the existing static table endpoints

#### 15. J1 — Person/Family List (`persones-families.html`, `js/persones-families.js`)

Per `src/views/J1 llistat persones families`:
- Combined view of persons and families
- Filters: text search, gender dropdown, barri dropdown, estructura_familiar dropdown
- Two sections or toggled view: families list + persons list
- Links to client detail and family detail

---

### Authorization Matrix

| Feature | Total (1) | R. Zona (2) | Viewer (3) | R. Projecte (4) | Treballador (5) |
|---------|-----------|-------------|-----------------|------------------|-----------------|
| Create users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit static tables | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create projectes | ✅ | ✅ | ❌ | ✅ | ❌ |
| Edit any projecte | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit own projecte | ✅ | ✅ | ❌ | ✅ | ❌ |
| Assign/remove clients to any project | ✅ | ✅ | ❌ | ✅ | ✅ |
| Edit clients | ✅ | ✅ | ❌ | ✅ | ❌ |
| View everything | ✅ | ✅ | ✅ | ✅ | ✅ |

**Note**: Check actual `idNivel_acceso` values from `inserts_tablas_estaticas.sql` (they may differ from the assumptions above). Find the exact INSERT statement and use those IDs.

---

### Key Implementation Notes

1. **NESE**: Already a single FK on `client.idNecessitat_especial`. The old M-N junction table `necessitats_especials_has_client` is deprecated.
2. **Inscritos**: Always calculated as `SELECT COUNT(*) FROM proyectos_has_client WHERE idProyecto = ?`. Never stored directly.
3. **C_temps_a_lentitat**: Calculated from `Data_d_alta` in the controller (`calcTempsEntitat()`).
4. **Dropdown defaults**: "No NESE" (id=3), "No aplica" for Curs (id=26) and Res. Acad., "Sense risc" (id=1), "No SEBAS" (id=12).
5. **JWT**: Store in `localStorage`, send as `Authorization: Bearer <token>` header.
6. **Password**: Hash with `bcrypt` (10 rounds).
7. **No ORM**: Use raw SQL with `mysql2/promise` throughout.
8. **Sidebar**: Include on every page. The active page should be highlighted.
9. **CSS**: Create `src/public/css/main.css` for shared styles (sidebar, layout, buttons, tables). Each page can have its own additional CSS file.
10. **NPM packages to install**: `bcrypt`, `jsonwebtoken`. (Already have: `express`, `mysql2`, `dotenv`.)

---

### Files to Create (Full List)

**Backend:**
- `src/routes/auth.js`
- `src/controllers/auth.js`
- `src/middlewares/auth.js`
- `src/routes/centre_activitats.js`
- `src/controllers/centre_activitats.js`
- `src/repositories/centre_activitats.js`
- `src/routes/reports.js`
- `src/controllers/reports.js`
- `src/repositories/reports.js`

**Backend files to modify:**
- `src/server.js` — register new routes, add password column handling
- `src/repositories/usuari.js` — enhance queries
- `src/controllers/usuari.js` — enhance controllers
- `src/routes/usuari.js` — add new endpoints
- `src/repositories/projectes.js` — add filter, client management
- `src/controllers/projectes.js` — enhance controllers
- `src/routes/projectes.js` — add new endpoints
- `src/repositories/client.js` — enhance queries
- `src/controllers/client.js` — enhance controllers
- `src/routes/client.js` — add new endpoints
- `src/repositories/familia.js` — enhance queries
- `src/controllers/familia.js` — enhance controllers
- `src/routes/familia.js` — add new endpoints
- `src/repositories/domicili.js` — enhance queries
- `src/controllers/domicili.js` — enhance controllers
- `src/routes/domicili.js` — add new endpoints
- `src/sql/Base_datos.sql` — fix UNIQUE, add password column
- `src/seeder/seeder.js` — add password for test user

**Frontend:**
- `src/public/login.html`
- `src/public/js/login.js`
- `src/public/projectes.html`
- `src/public/js/projectes.js`
- `src/public/projecte.html`
- `src/public/js/projecte.js`
- `src/public/projecte-crear.html`
- `src/public/js/projecte-crear.js`
- `src/public/clients.html`
- `src/public/js/clients.js`
- `src/public/client.html`
- `src/public/js/client.js`
- `src/public/families.html`
- `src/public/js/families.js`
- `src/public/familia.html`
- `src/public/js/familia.js`
- `src/public/usuaris.html`
- `src/public/js/usuaris.js`
- `src/public/usuari.html`
- `src/public/js/usuari.js`
- `src/public/usuari-crear.html`
- `src/public/js/usuari-crear.js`
- `src/public/domicilis.html`
- `src/public/js/domicilis.js`
- `src/public/domicili.html`
- `src/public/js/domicili.js`
- `src/public/informes.html`
- `src/public/js/informes.js`
- `src/public/config.html`
- `src/public/js/config.js`
- `src/public/persones-families.html`
- `src/public/js/persones-families.js`
- `src/public/css/main.css` (shared styles)

---

### Verification

After creation, the build agent should:
1. Verify all files compile without syntax errors (`node --check` on each `.js`)
2. Verify route/controller/repo imports are consistent (no missing `require()`)
3. Verify all view specs' functions are implemented
4. Report any blocking issues (like missing `centre_coordinacio` table)

---

### What NOT To Do

- Do NOT run the server or connect to MySQL (no DB available)
- Do NOT modify `src/AI_test.js` (will be updated separately)
- Do NOT delete `necessitats_especials_has_client` table from schema (keep for backward compatibility, just don't use it)
- Do NOT modify `src/views/` files (those are spec documents)
- Do NOT create `README.md` or documentation files
