# REFACTOR.md — Anàlisi del codi i guia de refactorització

## Estructura del projecte

```
src/
├── server.js                     ← Punt d'entrada: Express, middlewares, rutes, bootstrap BB.DD.
├── AI_test.js                    ← Suite de tests d'integració (299 automàtics + 7 manuals)
├── AI_test_advanced.js           ← Tests avançats (no utilitzat activament)
├── DEVIL_tests.js                ← Tests de caixa negra: edge cases, validacions, seguretat (84 tests)
│
├── config/
│   └── database.js               ← Pool de connexions MySQL (singleton, 10 connexions)
│
├── middlewares/
│   └── auth.js                   ← Middlewares JWT: requireAuth, requireRole, requireTotal
│
├── routes/                       ← 25 fitxers: defineixen endpoints HTTP i deleguen a controllers
│   ├── auth.js                   ← POST /login, GET /me
│   ├── client.js                 ← CRUD /client + /client/full (creació completa)
│   ├── projectes.js              ← CRUD /projectes + gestió responsables/clients
│   ├── usuari.js                 ← CRUD /usuario
│   ├── domicili.js               ← CRUD /domicili + cerca + byFamily
│   ├── familia.js                ← CRUD /familia + cerca + checkName
│   ├── reports.js                ← 13 endpoints de reports/estadístiques
│   ├── callejero.js              ← Cerca + CRUD al carrerer
│   ├── centre_activitats.js      ← CRUD /centre-activitats
│   ├── desplegables.js           ← GET /desplegables/:name (catàlegs dinàmics)
│   ├── paisos.js                 ← ReadOnly: GET /paisos (i :id)
│   ├── estructura_familiar.js    ← ReadOnly
│   ├── genere.js                 ← ReadOnly
│   ├── motiu_baixa.js            ← ReadOnly
│   ├── NESES.js                  ← CRUD complet
│   ├── resul_acad.js             ← ReadOnly
│   ├── risc.js                   ← ReadOnly
│   ├── rol.js                    ← ReadOnly
│   ├── SEBAS.js                  ← ReadOnly
│   ├── situacio_eco.js           ← ReadOnly
│   ├── tipus_domicili.js         ← ReadOnly
│   ├── tipus_via.js              ← CRUD complet
│   ├── barri.js                  ← CRUD complet
│   ├── codi_postal.js            ← CRUD complet
│   └── nivel_acceso.js          ← ReadOnly
│
├── controllers/                  ← 25 fitxers: lògica de negoci, validacions, resposta HTTP
│   ├── auth.js                   ← login (JWT), me (perfil usuari autenticat)
│   ├── client.js                 ← CRUD simple + createFull/updateFull (transaccional)
│   ├── projectes.js              ← CRUD + addClients/removeClient + responsables
│   ├── usuari.js                 ← CRUD
│   ├── domicili.js               ← CRUD + cerca combinada
│   ├── familia.js                ← CRUD + cerca + checkName
│   ├── reports.js                ← 13 funcions "pass-through" al repo
│   ├── callejero.js              ← Cerca, getById, create
│   ├── centre_activitats.js      ← CRUD + search
│   ├── desplegables.js           ← Router dinàmic via MAP object
│   ├── paisos.js                 ← ReadOnly (getAllPais, getPaisById)
│   ├── NESES.js                  ← CRUD complet (5 funcions)
│   ├── ... (catalog controllers) ← Patró: si ReadOnly → getAll + getById
│   │                                si CRUD  → getAll + getById + create + update + remove
│
├── repositories/                 ← 25 fitxers: consultes SQL, pool de connexions
│   ├── client.js                 ← Consultes complexes: getFiltered (SQL_CALC_FOUND_ROWS),
│   │                                getDetailById (17 JOINs), createFull/updateFull (transaccional)
│   ├── projectes.js              ← Consultes: getAll amb filtres, getById, responsables,
│   │                                participants, create/update, syncResponsables, addClients
│   ├── reports.js                ← 13 consultes d'agregació/estadístiques
│   ├── domicili.js               ← getDetailById amb 3 subconsultes (persones, families, projectes)
│   ├── familia.js                ← getDetailById amb 3 subconsultes
│   ├── callejero.js              ← Cerca amb filtres + JOINs
│   ├── centre_activitats.js      ← getAll/getById/search amb JOINs + create transaccional
│   ├── NESES.js                  ← CRUD simple (patró per a catàlegs)
│   ├── ... (catalog repos)       ← getAll, getById, (create, update, remove opcional)
│
├── seeder/
│   └── seeder.js                 ← Insereix dades de prova (8 families, 6 usuaris, 9 projectes, 16 clients)
│
├── views/
│   └── MostraClientes.js         ← ESBORRANY (syntax error, no usat)
│
├── public/
│   └── js/
│       ├── sidebar.js            ← Navegació lateral, control de sessió, gating per rol
│       ├── login.js              ← Formulari login, redirecció per rol
│       ├── projectes.js          ← Llistat projectes amb filtres, cerca amb debounce
│       ├── client-create.js      ← Formulari creació/edició persona (766 línies)
│       ├── callejero.js          ← Autocompletat carrers amb debounce (frontend)
│       └── desplegables.js       ← Carregar selects dinàmics
│
├── sql/
│   ├── Base_datos.sql            ← Esquema complet (CREATE TABLE, FK, etc.)
│   └── inserts_tablas_estaticas.sql ← Dades estàtiques (paisos, carrers, catàlegs)
│
└── docs/
    ├── AI_TESTS/                 ← Informes de tests d'integració
    ├── DEVIL_tests.md            ← Definició dels 15 blocs de DEVIL tests
    └── REFACTOR.md               ← Aquest fitxer
```

---

## 1. PATRONS GENERALS

### Patró CRUD complet (ex: NESES, tipus_via, barri, codi_postal, curso)

**Route** (`routes/NESES.js`):
```js
router.get("/",   controller.getAll);
router.get("/:id", controller.getById);
router.post("/",  controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
```

**Controller** (`controllers/NESES.js`): 5 funcions:
- `getAllNESES(req, res)` → crida `repo.getAll()`, retorna `200 + array`
- `getNESESById(req, res)` → crida `repo.getById(id)`, retorna `200 + objecte` o `404`
- `createNESES(req, res)` → valida `req.body`, crida `repo.create()`, retorna `201`
- `updateNESES(req, res)` → crida `repo.update(id, data)`, retorna `200` o `404`
- `deleteNESES(req, res)` → crida `repo.remove(id)`, retorna `200` o `404`

**Repository** (`repositories/NESES.js`): 5 funcions:
- `getAll()` → `SELECT * FROM taula ORDER BY nom`
- `getById(id)` → `SELECT * FROM taula WHERE id = ?`, retorna `rows[0]` o `null`
- `create(nom)` → `INSERT INTO taula (camp) VALUES (?)`, retorna `insertId`
- `update(id, nom)` → `UPDATE taula SET camp = ? WHERE id = ?`, retorna `affectedRows`
- `remove(id)` → `DELETE FROM taula WHERE id = ?`, retorna `affectedRows`

### Patró ReadOnly (ex: paisos, genere, risc, rol, SEBAS, etc.)

**Route**: `GET /` + `GET /:id`
**Controller**: `getAllXxx` + `getXxxById`
**Repository**: `getAll` + `getById`

### Patró de noms de variables i funcions

| Abreviatura | Significat |
|---|---|
| `NESES` / `neses` | Necessitats Especials (taula `necessitats_especials`) |
| `SEBAS` / `sebas` | Programa SEBAS (taula `sebas`) |
| `idGenere` | Gènere (M/F/Altres) — de `genere` no "gènere" |
| `idRol` | Rol dins la familia (pare/mare/fill/tutor) |
| `C_edad` | Edat calculada (derived from `Fecha_nacimiento`) |
| `C_temps_a_lentitat` | Temps calculat des de `Data_d_alta` |
| `Num_calle`, `Nom_calle` | Número i nom del carrer |
| `idcallejero` | ID del carrer (taula `callejero`) |
| `Direccio` (repo) | ID de la direcció (taula `direccio`) |
| `idTipus_via` | Tipus de via (carrer/avinguda/plaça...) |
| `idCodi_postal` / `idCodiPostal` | Codi postal (inconsistent entre funcions) |
| `Tipus_domicili` | Tipus d'habitatge (lloguer/hipoteca/ocupació...) |
| `Estructura_familiar` | Composición familiar (biparental/monoparental/tutor...) |
| `idNivel_acceso` | Nivell de permisos (1=Admin, 2=Resp.zona, 3=Resp.projectes, 4=Treballador, 5=Visitant) |
| `username` | Nom d'usuari per login |
| `Cognom_familiar` | Cognom de la familia |
| `inscritos` | Participants inscrits al projecte (comptatge) |
| `plazas` | Places disponibles al projecte |
| `fecha_inicio_act` / `fecha_fin_act` | Dates d'inici i fi d'activitats del projecte |
| `Data_d_alta` / `Data_baixa` | Dates d'alta i baixa del client |
| `derivacio_serveis_socials` | Flag: derivat a serveis socials (0/1) |
| `Pais_naixement` | ID del país de naixement |
| `idSituacio_economica` | Situació econòmica de la familia |
| `idNecessitat_especial` / `idSebas` | Necessitats especials / SEBAS |
| `Responsables` (taula) | Persones responsables d'un projecte (tipus: 1=zona, 2=projecte, 3=treballador) |

---

## 2. DOCUMENTACIÓ PER FITXER

### 2.1 `src/server.js` — Punt d'entrada

| Funció | Descripció |
|---|---|
| `runSQLFile(connection, filePath)` | Llegeix un fitxer SQL, el divideix per `;` i executa cada sentència ignorant errors coneguts (1050, 1060, 1061, 1062) |
| `startServer()` | Bootstrap: crea connexió, DROP/CREATE DATABASE, executa schema + inserts + seeder, crea pool, engega servidor |

**Flux d'arrencada**:
1. Carrega `.env`
2. Crea connexió bootstrap
3. `DROP DATABASE IF EXISTS` → `CREATE DATABASE` → `USE`
4. Executa `Base_datos.sql` (schema)
5. Executa `inserts_tablas_estaticas.sql` (dades estàtiques)
6. Executa `seeder.insertTestData()` (dades de prova)
7. Tanca connexió bootstrap
8. Crea pool de connexions (10 connexions)
9. `server.listen(PORT)`

**Middlewares** (en ordre):
1. `express.json()` — parseja body JSON
2. Middleware de body absent — retorna 400 si POST/PUT/PATCH sense body
3. Middleware d'error JSON — retorna 400 si JSON malformat
4. `express.static()` — fitxers estàtics des de `public/`
5. Rutes (veure secció 3)
6. Segon `express.static()` (duplicat)

### 2.2 `src/config/database.js` — Pool de connexions

| Funció | Descripció |
|---|---|
| `createPool()` | Crea un pool mysql2/promise (singleton). Retorna el pool existent si ja creat. Llegeix `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` de `process.env`. Límit: 10 connexions, `waitForConnections: true` |

### 2.3 `src/middlewares/auth.js` — Autenticació JWT

| Funció | Descripció | Paràmetres | Retorn |
|---|---|---|---|
| `requireAuth(req, res, next)` | Verifica `Authorization: Bearer <token>`. Decodifica JWT i assigna `req.user` | `req.headers.authorization` | `401` si token absent/invàlid, `next()` si OK |
| `requireRole(...roleIds)` | Factory: retorna middleware que comprova que `req.user.idNivel_acceso` estigui a `roleIds` | `...roleIds: number[]` | `401` si no auth, `403` si rol no permès, `next()` si OK |
| `requireTotal(req, res, next)` | Requereix `idNivel_acceso === 1` (Admin total) | — | `401/403` si no és admin, `next()` si OK |

### 2.4 `src/controllers/auth.js` — Autenticació

| Funció | Descripció | Repositori |
|---|---|---|
| `login(req, res)` | Rep `{username, password}`, busca a `usuario_app`, compara amb bcrypt, retorna JWT (24h) + dades usuari | Directe (pool.query) |
| `me(req, res)` | Retorna dades de l'usuari autenticat (`req.user.idUsuario_APP`). Exclou `password` | Directe (pool.query) |

### 2.5 `src/controllers/client.js`

| Funció | Descripció | Paràmetres | Retorn |
|---|---|---|---|
| `getAllClients(req, res)` | Llista clients. Si hi ha query params (`q`, `familia`, etc.) fa filtrat, sinó getAll | `req.query: {q, familia, genere, barri, edatMin, edatMax, offset, limit}` | `200 + array` o `200 + {rows, total}` |
| `getClientById(req, res)` | Detall del client + projectes associats. Filtra projectes per `filter` (tots/actius/futur/passats) | `req.params.id`, `req.query.filter` | `200 + objecte` o `404` |
| `createClient(req, res)` | Crea client simple (només dades requerides: Nom, Cognoms) | `req.body` (tots els camps client) | `201 + {id}` o `400` |
| `updateClient(req, res)` | Actualitza client, recalcula `C_edad` si `Fecha_nacimiento` canvia | `req.params.id`, `req.body` | `200` o `400` o `404` |
| `deleteClient(req, res)` | Elimina client (repo fa cascade: proyectos_has_client, nacionalitat) | `req.params.id` | `200` o `404` |
| `createFullClient(req, res)` | Crea client complet amb familia + domicili en transacció | `req.body: {client, familia, domicili}` | `201 + {id}` |
| `updateFullClient(req, res)` | Actualitza client complet amb familia + domicili en transacció | `req.params.id`, `req.body: {client, familia, domicili}` | `200` |
| `calcTempsEntitat(altaDateStr)` | Calcula temps des de l'alta en format humà (ex: "3 anys", "6 mesos", "0") | `altaDateStr: string (YYYY-MM-DD)` | `string` |
| `isValidDate(dateStr)` | Valida que una data sigui real (no 2021-02-30) | `dateStr: string` | `boolean` |
| `isFutureDate(dateStr)` | Comprova si una data és futura (comparant amb avui 23:59:59) | `dateStr: string` | `boolean` |
| `parseDate(dateStr)` | Parseja data evitant desplaçament UTC | `dateStr: string` | `Date` |

### 2.6 `src/controllers/projectes.js`

| Funció | Descripció | Validacions rellevants |
|---|---|---|
| `getAllProjectes(req, res)` | Llista projectes amb filtre (`todos`/`activos`/`futuros`/`pasados`/`actiu_futur`), cerca `q`, filtre per `responsable_id` | — |
| `getProjectesByCentre(req, res)` | Llista projectes d'un centre | — |
| `getProjectesById(req, res)` | Detall projecte + participants + responsables | — |
| `createProject(req, res)` | Crea projecte + sincronitza responsables | `Nom_projecte` obligatori i ≤100, `idcentre_activitats` obligatori, `plazas` ≥0, `fecha_fin >= fecha_inicio` |
| `updateProject(req, res)` | Actualitza projecte. Roles: 1/2 poden sync, 3 pot add | Mateixes validacions que create + permís per rol |
| `deleteProject(req, res)` | Elimina projecte (repo fa cascade) | — |
| `addClients(req, res)` | Afegeix clients al projecte. Valida que `clientIds` existeixin | `clientIds` array, tots han d'existir a taula `client` |
| `removeClient(req, res)` | Elimina client del projecte | — |
| `getUsuarisPerNivell(req, res)` | Usuaris per rang de nivell d'accés | — |

### 2.7 `src/controllers/domicili.js`

| Funció | Descripció |
|---|---|
| `getAllDomicilis(req, res)` | Llista domicilis. Amb `barri`/`tipus` fa filtrat |
| `getDomiciliById(req, res)` | Detall d'un domicili |
| `createDomicili(req, res)` | Crea domicili. Valida que `Tipus_domicili` i `Direccio` siguin números |
| `updateDomicili(req, res)` | Actualitza domicili. Mateixes validacions |
| `deleteDomicili(req, res)` | Elimina domicili |
| `getDomicilisByFamily(req, res)` | Domicilis d'una família |
| `searchDomicilisCarrer(req, res)` | Cerca combinada domicilis + carrers |

### 2.8 `src/controllers/familia.js`

| Funció | Descripció |
|---|---|
| `getAllFamilias(req, res)` | Llista famílies amb filtres |
| `getFamiliaById(req, res)` | Detall família |
| `createFamilia(req, res)` | Crea família. Valida `Cognom_familiar` ≤100, `Estructura_familiar` tipus number |
| `updateFamilia(req, res)` | Actualitza família |
| `deleteFamilia(req, res)` | Elimina família |
| `searchFamilies(req, res)` | Cerca per nom (`q` obligatori) |
| `checkFamilyName(req, res)` | Comprova si un cognom familiar existeix (`name` obligatori) |

### 2.9 `src/controllers/usuari.js`

| Funció | Descripció |
|---|---|
| `getAllUsuarios(req, res)` | Llista usuaris amb filtre (tots/responsables/trabajadores) + cerca `q` |
| `getUsuarioById(req, res)` | Detall usuari + projectes + stats (actius, futurs, tancats) |
| `createUsuario(req, res)` | Crea usuari. Valida camps obligatoris + username ≤50 + no duplicat |
| `updateUsuario(req, res)` | Actualitza usuari. Valida body present |
| `removeUsuario(req, res)` | Elimina usuari (repo fa cascade a `Responsables`) |

### 2.10 `src/controllers/reports.js` — 13 funcions "pass-through"

| Funció | Crida a repo | Descripció |
|---|---|---|
| `getProjectesGeneresEdats` | `repo.projectesGeneresEdats()` | Projectes × gènere × segment edat |
| `getGenere` | `repo.genere()` | Clients per gènere |
| `getSitEco` | `repo.sitEco()` | Clients per situació econòmica × rol |
| `getRolFam` | `repo.rolFam()` | Clients per rol familiar |
| `getTipHab` | `repo.tipHab()` | Habitatges per tipus |
| `getCont` | `repo.cont()` | Recomptes globals (actius, families, baixes) |
| `getNeses` | `repo.neses()` | Necessitats especials × gènere |
| `getSebasDev` | `repo.sebasDev()` | Clients amb seguiment SEBAS + derivacions |
| `getCursAny` | `repo.cursAny(any)` | Resultats acadèmics per any |
| `getResAcad` | `repo.resAcad()` | Resultats acadèmics agregats |
| `getMotiusBaixa` | `repo.motiusBaixa()` | Motius de baixa |
| `getRiscos` | `repo.riscos()` | Nivells de risc |
| `getPaisos` | `repo.paisos()` | Nacionalitat + naixement |

### 2.11 `src/controllers/callejero.js`

| Funció | Descripció |
|---|---|
| `searchCallejero(req, res)` | Cerca carrers per `tipus_via`, `q`, `nom_calle`, `idBarri`, `idCodi_postal` |
| `createCallejero(req, res)` | Crea carrer (requereix auth + admin total) |
| `getCallejeroById(req, res)` | Detall carrer |

### 2.12 `src/controllers/desplegables.js`

| Funció | Descripció |
|---|---|
| `getDesplegable(req, res)` | Router dinàmic: `GET /desplegables/:name`. Usa `MAP[name]` per obtenir repo + claus. Retorna `[{id, Nom}, ...]` |

### 2.13 `src/repositories/client.js`

| Funció | Descripció | SQL |
|---|---|---|
| `getAll()` | Tots els clients JOIN familia + genere | 3 JOINs |
| `getFiltered({q, familia, genere, barri, edatMin, edatMax, offset, limit})` | Cerca amb filtres + paginació | `SQL_CALC_FOUND_ROWS` + `FOUND_ROWS()` |
| `getDetailById(id)` | Detall complet amb 17 LEFT JOINs | 17 JOINs a totes les taules relacionades |
| `getProjectsByClient(id, filter)` | Projectes del client amb estat (actiu/futur/tancat) | 2 JOINs + CASE |
| `create(clientData)` | INSERT client amb 23 camps | `INSERT INTO client (...) VALUES (?, ...)` |
| `update(id, clientData)` | UPDATE client (23 camps) | `UPDATE client SET ... WHERE idClient=?` |
| `remove(id)` | DELETE en cascada (proyectos_has_client, nacionalitat, client) | 3 DELETEs |
| `createFull(data)` | Transacció: crea direccio → domicili → familia → client → nacionalitat | Transactional |
| `updateFull(id, data)` | Transacció: actualitza o crea direccio, domicili, familia, client | Transactional |

### 2.14 `src/repositories/projectes.js`

| Funció | Descripció |
|---|---|
| `getAll(filter, q, responsable_id, idCentre)` | Cerca projectes amb 4 filtres + LIKE |
| `getById(id)` | Detall projecte amb JOINs a centre + direccio + callejero |
| `getResponsables(projectId)` | Responsables d'un projecte (JOIN usuario_app + Nivel_acceso) |
| `getUsuarisByNivell(minLevel, maxLevel)` | Usuaris per rang de nivell |
| `getParticipants(projectId)` | Clients participants d'un projecte |
| `create(projecteData)` | INSERT projecte (6 camps) |
| `update(id, projecteData)` | UPDATE projecte (6 camps) |
| `syncResponsables(projectId, ...)` | DELETE + reINSERT responsables (tipus 1, 2, 3) |
| `addResponsables(projectId, ...)` | INSERT IGNORE responsables (només afegeix) |
| `remove(id)` | DELETE en cascada (Responsables, proyectos_has_client, proyectos) |
| `validateClientIds(clientIds)` | Retorna els IDs que NO existeixen a `client` |
| `addClients(projectId, clientIds)` | INSERT IGNORE a proyectos_has_client |
| `removeClient(projectId, clientId)` | DELETE de proyectos_has_client |

### 2.15 `src/repositories/reports.js` — 13 funcions d'agregació

| Funció | Descripció | Agrupació |
|---|---|---|
| `projectesGeneresEdats()` | Projectes × gènere × segment edat (0-3, 4-6, ..., +65) | `GROUP BY p.idProyecto, g.Nom_genere, segment_edat` |
| `genere()` | Clients per gènere | `GROUP BY g.Nom_genere` |
| `sitEco()` | Clients per situació econòmica × rol | `GROUP BY se.Nom, r.Nom_rol` |
| `rolFam()` | Clients per rol familiar | `GROUP BY r.Nom_rol` |
| `tipHab()` | Habitatges per tipus | `GROUP BY td.Nom_domicili` |
| `cont()` | 4 recomptes: actius, families, baixes totals, baixes per genere | 4 consultes |
| `neses()` | Necessitats especials × gènere (exclou id 3 = "No NESE") | `GROUP BY ne.Nom_necessitat, g.Nom_genere` |
| `sebasDev()` | Clients amb SEBAS + derivacions serveis socials | 2 consultes |
| `cursAny(any)` | Resultats acadèmics per any, amb percentatges calculats | `YEAR(cl.Data_d_alta) = ?` |
| `resAcad()` | Resultats acadèmics agregats | `GROUP BY ra.Nom_resultat_acad` |
| `motiusBaixa()` | Motius de baixa per clients donats de baixa | `WHERE Baixa = 1` |
| `riscos()` | Nivells de risc | `GROUP BY r.Nivel` |
| `paisos()` | Nacionalitats + països de naixement | 2 consultes |

### 2.16 `src/seeder/seeder.js`

| Funció | Descripció |
|---|---|
| `runSQLFile(conn, filePath)` | Executa fitxer SQL (reutilitzat de server.js) |
| `insertTestData(conn)` | Insereix dades de prova: 10 direccions, 10 domicilis, 8 families, 6 usuaris, 3 centres, 9 projectes, 16 clients, associacions + responsables |
| `runSeed()` | Buida totes les taules (ordre: Responsables → ... → necessitats_especials), reseteja AUTO_INCREMENT, recarrega schema + inserts + test data |
| `ORDERED_TABLES` | Array amb 28 noms de taules en ordre de dependència |

### 2.17 `src/public/js/sidebar.js` — Frontend navegació

| Funció | Descripció |
|---|---|
| `getRole()` | Llegeix `user.idNivel_acceso` del `localStorage` |
| `requireAuth()` | Redirigeix a `/login.html` si no hi ha token |
| `logout()` | Neteja `localStorage`, redirigeix a login |
| `renderSidebar(activePage)` | Genera menú lateral HTML segons rol. Admin (1) veu Informes + Config. Roles 2-3 tenen "Els meus projectes" |

### 2.18 `src/public/js/login.js`

| Funció | Descripció |
|---|---|
| `login()` | Envia POST `/auth/login`, guarda token + user al `localStorage`, redirigeix segons rol |

### 2.19 `src/public/js/client-create.js` — Formulari persona (766 línies)

| Funció | Descripció |
|---|---|
| `showToast(msg, type)` | Mostra notificació temporal |
| `calcEdad(fecha)` | Calcula edat des de data de naixement |
| `loadSelect(url, select, valueKey, labelKey)` | Carrega options d'un select via API |
| `initDropdowns()` | Inicialitza tots els desplegables del formulari |
| `setDefaultDropdowns()` | Selecciona valors per defecte (risc=1, sebas=12, curs=26, etc.) |
| `triggerFamilySearch(q)` | Cerca famílies amb debounce |
| `searchFamilies(q)` | GET `/familia/search?q=...` |
| `showFamilyDropdown(items)` | Mostra dropdown de famílies |
| `selectFamily(item)` | Selecciona família, carrega domicilis |
| `clearFamily()` | Deselecciona família |
| `loadFamilyDomiciles(idFamilia)` | GET `/domicili/byFamily/:id` |
| `triggerDomiciliSearch()` | Cerca domicilis amb debounce |
| `fetchDomicili(url)` | GET `/domicili/search?...` |
| `showDomiciliDropdown(results)` | Mostra dropdown combinat (domicilis existents + carrers) |
| `selectDomiciliResult(r)` | Selecciona domicili o carrer, emplena camps |
| `setDomicileEditState(readonly)` | Bloqueja/desbloqueja camps d'edició |
| `setBarriCpValue(barriVal, cpVal)` | Emplena barri i CP (input o select segons ambigüitat) |
| `highlightAmbiguity(field)` | Marca camp amb dubte |
| `clearBarriCpHighlight()` | Neteja marques |
| `autoFillBarriCp(results)` | Emplena automàticament barri i CP |
| `updatePreview(r)` | Actualitza barra de previsualització |
| `submitForm()` | Valida i envia formulari (POST/PUT `/client/full`) |
| `resetForm()` | Reinicia formulari |
| `clearDomicile()` | Reinicia camps de domicili |
| `loadEditData(id)` | Carrega dades d'una persona existent per editar |

### 2.20 `src/views/MostraClientes.js` — ESBORRANY

Fitxer incomplet amb errors de sintaxi. No s'utilitza actualment. Línia 10 té `const  = require(...)` (falta nom de variable). La funció `clientViewFilter` té sintaxi incorrecta (`async clientViewFilter() {` en lloc de `async function clientViewFilter() {`).

---

## 3. PROBLEMES D'ESTIL DETECTATS

### 3.1 Inconsistències de noms

| On | Problema | Suggeriment |
|---|---|---|
| `controllers/NESES.js` | Noms de funció en majúscules: `getAllNESES`, `createNESES` | Usar `getAllNecessitats` o `getAll` |
| `controllers/SEBAS.js` | Mateix problema | `getAllSebas` |
| `controllers/estructura_familiar.js` | Noms enormes: `getAllEstructura_familiar`, `getEstructura_familiarById` | `getAll`, `getById` (o `getAllEstFam`) |
| `controllers/paisos.js` vs `controllers/client.js` | `paisosRepository.getAll()` vs `repo.getAll()` | Unificar estil d'importació |
| `routes/desplegables.js` | `name` com a param: inconsistent amb altres rutes | OK, és un cas especial |
| `repositories/domicili.js:create(idTipusDomicili, direccio)` vs `controller` | Rep només paràmetres individuals (no objecte) | Inconsistent amb la majoria de repos |

### 3.2 Control d'errors duplicat i inconsistent

- Els controllers de catàleg (ReadOnly) tenen try/catch idèntics: 10 línies per funció
- `reports.js` controller: funcions en 1 línia, sense console.error
- La majoria de controllers tenen `console.error(error)` i retornen `{message: "..."}`; altres retornen `{error: error.message}`

### 3.3 Codi duplicat

- `server.js` té `express.json()` i `express.static()` DUPLICATS (línies 17 i 54, 24 i 81)
- `runSQLFile` duplicat a `server.js` i `seeder.js`
- La validació de `isValidDate` i `isFutureDate` podria anar a un helper compartit
- Tots els catàlegs tenen el mateix patró (estil inconsistent entre ells)
- `server.js:94` comprova `err.errno` per ignorar errors SQL — seeder.js fa el mateix amb llista similar

### 3.4 Problemes de llegibilitat

- `server.js:94`: `if (![1050, 1060, 1061, 1062].includes(err.errno))` — què signifiquen aquests números?
- `controllers/client.js:59`: `if (m < 0 || (m === 0 && avui.getDate() < nac.getDate())) C_edad--;` — càlcul d'edat sense comentari
- `controllers/client.js:118`: valors màgics (`RISK_SENSE_RISC = 1`, `SEBAS_NO_SEBAS = 12`, `CURS_NO_APLICA = 26`)
- `controllers/reports.js`: totes les funcions en 1 línia (il·legible)
- `repositories/domicili.js:searchCombined`: 200 línies de construcció SQL manual, molt difícil de seguir

### 3.5 Problemes de seguretat i robustesa

- ~~SQL injection: mitigat per mysql2 (prepared statements)~~ ✓
- ~~XSS a respostes JSON: Express escapa HTML per defecte~~ ✓
- ~~Validacions de tipus afegides recentment~~ ✓
- `MostraClientes.js` té syntax error (no es carrega, però és codi mort)
- `idCodi_postal` vs `idCodiPostal` a `controllers/callejero.js:6` — el controller accepta ambdós noms (workaround)

### 3.6 Ineficiències

- `repositories/client.js:getDetailById`: 17 LEFT JOINs. Quan es crida des d'updateFullClient, carrega totes les relacions només per comprovar existència.
- `repositories/domicili.js:searchCombined`: fa dues consultes SQL separades i combina els resultats a JS. 

---

## 4. GUIA DE REFACTORITZACIÓ PRIORITZADA

### Prioritat 1 (Correccions ràpides, alt impacte)

1. **Eliminar `express.json()` i `express.static()` duplicats a `server.js`**
2. **Extreure `isValidDate` i `isFutureDate` a `src/helpers/validators.js`**
3. **Extreure `runSQLFile` a un helper compartit** (ja duplicat a server.js i seeder.js)
4. **Corregir `MostraClientes.js`** (eliminar-lo si no s'usa, o refer-lo)

### Prioritat 2 (Llegibilitat)

5. **Afegir comentaris de significat de variables** (valors màgics, abreviatures)
6. **Refactoritzar `reports.js` controller**: expandir a múltiples línies, afegir try/catch amb console.error
7. **Unificar estil d'importació de repositori**: `const repo = require(...)` a tot arreu
8. **Afegir comentaris de què fan els números màgics** (errno, defaults, etc.)

### Prioritat 3 (Estructura)

9. **Extreure valors màgics a constants amb nom descriptiu**
10. **Unificar noms de catàlegs** (NESES → necessitats, SEBAS → sebas)
11. **Refactoritzar `searchCombined`** a `domicili.js` per reduir duplicació SQL

---

## 5. NOMENCLATURA ABREVIATURES DEL PROJECTE

| Abrev. | Català | Anglès | Notes |
|---|---|---|---|
| `NESE` | Necessitats Especials | Special Needs | Taula: `necessitats_especials` |
| `SEBAS` | (Programa) SEBAS | — | Servei educatiu específic |
| `Genere` | Gènere | Gender | Incorrecte ortogràfic (hauria de ser "Gènere") |
| `Cognom` | Cognom | Surname | |
| `Direccio` | Direcció | Address | Taula: `direccio` (abreviat per espai) |
| `Dom` | Domicili | Home/Residence | |
| `Telefon` | Telèfon | Phone | |
| `Estructura_familiar` | Estructura familiar | Family structure | |
| `Nivel_acceso` | Nivell d'accés | Access level | Taula: `Nivel_acceso` (amb majúscula!) |
| `idFamilia` | ID de la família | Family ID | |
| `idRol` | ID del rol | Role ID | Rol dins la família |
| `plazas` | Places (vacants) | Slots/Seats | |
| `inscritos` | Inscrits | Enrolled | Castellanisme, hauria de ser "inscrits" |
| `fecha_inicio_act` | Data d'inici activitats | Activity start date | Castellanisme (fecha = data) |
| `Fecha_nacimiento` | Data de naixement | Birth date | Castellanisme |
| `Data_d_alta` | Data d'alta | Registration date | Barreja català/castellà |
| `C_edad` | Edat calculada | Calculated age | |
| `idcallejero` | ID del carrer | Street ID | Taula: `callejero` |
| `Num_calle` | Número de carrer | Street number | Castellanisme (calle = carrer) |
| `Nom_calle` | Nom del carrer | Street name | |
| `Pais_naixement` | País de naixement | Birth country | |
| `Baixa` | Donat de baixa | Deactivated | Flag 0/1 |
| `derivacio_serveis_socials` | Derivació a serveis socials | Referred to social services | |
