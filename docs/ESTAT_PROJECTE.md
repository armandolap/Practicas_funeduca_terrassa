# Estat del Projecte — FunEduca CRM

> Data: 2026-06-09

---

## 1. Resum Executiu

CRM per a gestió d'entitats socials amb: gestió de clients, famílies, domicilis, projectes, i un cercador de carrers (callejero) amb autocomplete. Stack Express 5 + mysql2/promise. Sense tests unitaris; bateria de tests d'integració via `AI_test.js`.

---

## 2. Stack Tecnològic

| Capa       | Tecnologia                              |
|------------|-----------------------------------------|
| Backend    | **Express 5** + **mysql2/promise**      |
| Frontend   | HTML estátic + CSS + JS (vanilla)       |
| Base de dades | MySQL 8, charset `utf8`, InnoDB      |
| Sessió     | `express-session` + `MySQLStore` (no actiu) |
| Auth       | Stub (`middlewares/auth.js` no actiu)   |

---

## 3. Arquitectura

### 3.1 Patró de 3 capes

```
Ruta (HTTP) → Controlador (lògica) → Repositori (SQL)
```

Cada entitat té 3 fitxers:
- `routes/{entitat}.js` — defineix les rutes HTTP i les delega al controlador
- `controllers/{entitat}.js` — valida dades, crida al repositori, retorna HTTP response
- `repositories/{entitat}.js` — executa SQL amb `pool.query()` i retorna dades

### 3.2 Flux d'execució: Arrancada del servidor

```
node src/server.js
        │
        ▼
  1. Requereix dotenv + pool mysql
        │
        ▼
  2. Comprova que ../.env existeix → si no, error i sortida
        │
        ▼
  3. Càrrega de mòduls:
     - express(), 20 route modules, express.json(), static
        │
        ▼
  4. Registre de middlewares (20 rutes + static)
        │
        ▼
  5. startServer():
        ├── pool.getConnection() → verifica connexió MySQL
        ├── runSQLFile("sql/callejero_schema.sql")
        │     → DROP vella Direccio, CREATE tipus_via/barri/codi_postal/direccio
        ├── runSQLFile("sql/inserts_tablas_estaticas.sql")
        │     → INSERT dades catàleg + callejero (2076 línies SQL)
        └── server.listen(PORT)
```

### 3.3 Flux d'execució: Petició HTTP

```
Client → GET /callejero?q=abc
        │
        ▼
  server.use("/callejero", callejeroRouter)
        │
        ▼
  routes/callejero.js: router.get("/", controller.searchCallejero)
        │
        ▼
  controllers/callejero.js: searchCallejero(req, res)
        │  extreu { tipus_via, q } = req.query
        │  crida repository.search({ tipus_via, q })
        ▼
  repositories/callejero.js: search({ tipus_via, q })
        │  SQL: SELECT d.idDireccio, ..., CONCAT(tv.Nom,' ',d.Nom_calle) AS Nom_complet
        │  FROM direccio d JOIN tipus_via tv ...
        │  WHERE tv.Nom LIKE ? ...
        │  ORDER BY tv.Nom, d.Nom_calle, b.Nom, cp.Codi LIMIT 50
        ▼
  Retorna array d'objectes → controller → res.json(rows) (200)
        o
  Error → res.status(500).json({ message: "..." })
```

### 3.4 Flux d'execució: Seeder + Tests

```
npm run AI_test (src/AI_test.js)
        │
        ▼
  1. runSeed():
        ├── SET FOREIGN_KEY_CHECKS=0
        ├── DELETE FROM 28 taules (ordre FK-safe)
        ├── ALTER TABLE … AUTO_INCREMENT=1
        ├── runSQLFile("sql/callejero_schema.sql")
        ├── runSQLFile("sql/inserts_tablas_estaticas.sql")
        ├── INSERT test data (Centre_coordinacio, Domicili, Familia, Usuario_APP, Proyectos, Client)
        └── SET FOREIGN_KEY_CHECKS=1
        │
        ▼
  2. spawn("node", ["server.js"]) amb PORT=3000
        │
        ▼
  3. Espera "Servidor en http" (timeout 15s)
        │
        ▼
  4. Per cada endpoint (20 total):
        ├── GET /path → status 200 + array
        ├── GET /path/{validId} → status 200 + objecte
        ├── GET /path/999999 → status 404
        └── Si readOnly=false:
              ├── POST /path (payload) → status 201 + id
              ├── PUT /path/{id} (update payload) → status 200
              ├── DELETE /path/{id} → status 200
              └── GET /path/{id} → status 404 (after delete)
        │
        ▼
  5. Genera informe:
        ├── docs/AI_TESTS/AI_test_NNN.md (detallat, anglès)
        └── docs/AI_TESTS/resultat_test.md (solucions, català)
        │
        ▼
  6. kill(serverProcess), exit(0/1)
```

---

## 4. Endpoints

### 4.1 Llegenda

| Símbol | Significat |
|--------|------------|
| R/O | Read-only (només GET) — catàleg estàtic |
| CRUD | GET, POST, PUT, DELETE complets |
| Parcial | CRUD incomplet (falten PUT/DELETE) |

### 4.2 Llistat complet (20 endpoints)

| # | Prefix | Tipus | Mètodes | Controlador |
|---|--------|-------|---------|-------------|
| 1 | `/paisos` | R/O | GET /, GET /:id | `paisos.getAllPais`, `getPaisById` |
| 2 | `/estFamilia` | R/O | GET /, GET /:id | `estructura_familiar.getAllEstructura_familiar`, `getEstructura_familiarById` |
| 3 | `/motiuBaixa` | R/O | GET /, GET /:id | `motiu_baixa.getAllMotiu_baixa`, `getMotiu_baixaById` |
| 4 | `/neses` | CRUD | GET, POST, GET/:id, PUT/:id, DELETE/:id | `NESES.*` |
| 5 | `/resulAcad` | R/O | GET /, GET /:id | `resul_acad.*` |
| 6 | `/risc` | R/O | GET /, GET /:id | `risc.*` |
| 7 | `/rol` | R/O | GET /, GET /:id | `rol.*` |
| 8 | `/sebas` | R/O | GET /, GET /:id | `SEBAS.*` |
| 9 | `/sitEco` | R/O | GET /, GET /:id | `situacio_eco.*` |
| 10 | `/tipusDom` | R/O | GET /, GET /:id | `tipus_domicili.*` |
| 11 | `/curso` | CRUD | GET, POST, GET/:id, PUT/:id, DELETE/:id | `curso.*` |
| 12 | `/projectes` | Parcial | GET, GET/:id, POST `[falten PUT/DELETE]` | `projectes.*` |
| 13 | `/usuario` | CRUD | GET, POST, GET/:id, PUT/:id, DELETE/:id | `usuari.*` |
| 14 | `/domicili` | CRUD | GET, POST, GET/:id, PUT/:id, DELETE/:id | `domicili.*` |
| 15 | `/familia` | CRUD | GET, POST, GET/:id, PUT/:id, DELETE/:id | `familia.*` |
| 16 | `/client` | CRUD | GET, POST, GET/:id, PUT/:id, DELETE/:id | `client.*` |
| 17 | `/tipusVia` | CRUD | GET, POST, GET/:id, PUT/:id, DELETE/:id | `tipus_via.*` |
| 18 | `/barri` | CRUD | GET, POST, GET/:id, PUT/:id, DELETE/:id | `barri.*` |
| 19 | `/codiPostal` | CRUD | GET, POST, GET/:id, PUT/:id, DELETE/:id | `codi_postal.*` |
| 20 | `/callejero` | R/O | GET /?q=&tipus_via=, GET /:id | `callejero.searchCallejero`, `getCallejeroById` |

**Total: 75 handlers** (comptant cada combinació mètode+ruta).

---

## 5. Fitxers i Funcions (per capa)

### 5.1 Rutes → Controladors

Cada fitxer de ruta (`src/routes/*.js`) defineix un `express.Router()` i delega a funcions del controlador.

#### `/paisos` (`routes/paisos.js`)
```
GET /          → controllers/paisos.getAllPais
GET /:id       → controllers/paisos.getPaisById
```

#### `/estFamilia` (`routes/estructura_familiar.js`)
```
GET /          → controllers/estructura_familiar.getAllEstructura_familiar
GET /:id       → controllers/estructura_familiar.getEstructura_familiarById
```

#### `/motiuBaixa` (`routes/motiu_baixa.js`)
```
GET /          → controllers/motiu_baixa.getAllMotiu_baixa
GET /:id       → controllers/motiu_baixa.getMotiu_baixaById
```

#### `/neses` (`routes/NESES.js`)
```
GET /          → controllers/NESES.getAllNESES
POST /         → controllers/NESES.createNESES
GET /:id       → controllers/NESES.getNESESById
PUT /:id       → controllers/NESES.updateNESES
DELETE /:id    → controllers/NESES.deleteNESES
```

#### `/resulAcad` (`routes/resul_acad.js`)
```
GET /          → controllers/resul_acad.getAllResul_acad
GET /:id       → controllers/resul_acad.getResul_acadById
```

#### `/risc` (`routes/risc.js`)
```
GET /          → controllers/risc.getAllRisc
GET /:id       → controllers/risc.getRiscById
```

#### `/rol` (`routes/rol.js`)
```
GET /          → controllers/rol.getAllRol
GET /:id       → controllers/rol.getRolById
```

#### `/sebas` (`routes/SEBAS.js`)
```
GET /          → controllers/SEBAS.getAllSEBAS
GET /:id       → controllers/SEBAS.getSEBASById
```

#### `/sitEco` (`routes/situacio_eco.js`)
```
GET /          → controllers/situacio_eco.getAllsituacio_eco
GET /:id       → controllers/situacio_eco.getsituacio_ecoById
```

#### `/tipusDom` (`routes/tipus_domicili.js`)
```
GET /          → controllers/tipus_domicili.getAlltipus_domicili
GET /:id       → controllers/tipus_domicili.getTipus_domiciliById
```

#### `/curso` (`routes/curso.js`)
```
GET /          → controllers/curso.getAllcurso
POST /         → controllers/curso.createCurso
GET /:id       → controllers/curso.getCursoById
PUT /:id       → controllers/curso.updateCurso
DELETE /:id    → controllers/curso.deleteCurso
```

#### `/projectes` (`routes/projectes.js`)
```
GET /          → controllers/projectes.getAllProjectes
POST /         → controllers/projectes.createProject
GET /:id       → controllers/projectes.getProjectesById
```

#### `/usuario` (`routes/usuari.js`)
```
GET /          → controllers/usuari.getAllUsuarios
POST /         → controllers/usuari.createUsuario
GET /:id       → controllers/usuari.getUsuarioById
PUT /:id       → controllers/usuari.updateUsuario
DELETE /:id    → controllers/usuari.removeUsuario
```

#### `/domicili` (`routes/domicili.js`)
```
GET /          → controllers/domicili.getAllDomicilis
POST /         → controllers/domicili.createDomicili
GET /:id       → controllers/domicili.getDomiciliById
PUT /:id       → controllers/domicili.updateDomicili
DELETE /:id    → controllers/domicili.deleteDomicili
```

#### `/familia` (`routes/familia.js`)
```
GET /          → controllers/familia.getAllFamilias
POST /         → controllers/familia.createFamilia
GET /:id       → controllers/familia.getFamiliaById
PUT /:id       → controllers/familia.updateFamilia
DELETE /:id    → controllers/familia.deleteFamilia
```

#### `/client` (`routes/client.js`)
```
GET /          → controllers/client.getAllClients
POST /         → controllers/client.createClient
GET /:id       → controllers/client.getClientById
PUT /:id       → controllers/client.updateClient
DELETE /:id    → controllers/client.deleteClient
```

#### `/tipusVia` (`routes/tipus_via.js`)
```
GET /          → controllers/tipus_via.getAllTipus_via
POST /         → controllers/tipus_via.createTipus_via
GET /:id       → controllers/tipus_via.getTipus_viaById
PUT /:id       → controllers/tipus_via.updateTipus_via
DELETE /:id    → controllers/tipus_via.deleteTipus_via
```

#### `/barri` (`routes/barri.js`)
```
GET /          → controllers/barri.getAllBarri
POST /         → controllers/barri.createBarri
GET /:id       → controllers/barri.getBarriById
PUT /:id       → controllers/barri.updateBarri
DELETE /:id    → controllers/barri.deleteBarri
```

#### `/codiPostal` (`routes/codi_postal.js`)
```
GET /          → controllers/codi_postal.getAllCodi_postal
POST /         → controllers/codi_postal.createCodi_postal
GET /:id       → controllers/codi_postal.getCodi_postalById
PUT /:id       → controllers/codi_postal.updateCodi_postal
DELETE /:id    → controllers/codi_postal.deleteCodi_postal
```

#### `/callejero` (`routes/callejero.js`)
```
GET /          → controllers/callejero.searchCallejero (query: tipus_via?, q?)
GET /:id       → controllers/callejero.getCallejeroById
```

---

### 5.2 Controladors → Repositoris

Patró general (20 fitxers, 86 funcions exportades).

#### Patró READ-ONLY (10 entitats: paisos, estFamilia, motiuBaixa, resulAcad, risc, rol, sebas, sitEco, tipusDom, callejero)

```
getAll*(req, res)
  Entrada: req (sense paràmetres)
  Crida: repositori.getAll()
  Sortida OK → status 200, array d'objectes
  Sortida ERR → status 500, { message: "Error …" }

get*ById(req, res)
  Entrada: req.params.id (string, es converteix a número a la query)
  Crida: repositori.getById(id)
  Sortida OK (trobat) → status 200, objecte
  Sortida OK (no trobat) → status 404, { message: "… no trobat" }
  Sortida ERR → status 500, { message: "Error …" }
```

#### Patró CRUD (9 entitats: neses, curso, usuari, domicili, familia, client, tipusVia, barri, codiPostal)

```
getAll*(req, res)
  → repositori.getAll()
  OK: 200 + array; ERR: 500 + { message }

get*ById(req, res)
  → repositori.getById(id)
  OK (trobat): 200 + objecte; OK (no trobat): 404 + message; ERR: 500

create*(req, res)
  → destructure req.body (ex: { Nom, idDomicili, … })
  → repositori.create(…)
  OK: 201 + { message: "…", id }; ERR: 500 (+400 si falta camp obligatori a alguns)

update*(req, res)
  → { id } = req.params, destructure req.body
  → repositori.update(id, …)
  OK (affectedRows≠0): 200 + { message: "…" }
  OK (no trobat): 404 + { message: "… no trobat" }
  ERR: 500

delete*(req, res)
  → { id } = req.params
  → repositori.remove(id)
  OK (affectedRows≠0): 200 + { message: "…" }
  OK (no trobat): 404 + { message: "… no trobat" }
  ERR: 500
```

#### Patró PARCIAL (projectes)
```
getAllProjectes → OK: 200, ERR: 500
getProjectesById → OK: 200/404, ERR: 500
createProject → Entrada: req.body.projecte (objecte imbricat)
                OK: 201 + { message, id }, ERR: 400/500
```

#### Diferències del patró `usuari.js`
- No usa `console.error` al catch
- Retorna `{ error: error.message }` (filtra errors interns al client) en lloc de `{ message: "hardcoded" }`
- No fa `res.status(200)` explícit — usa `res.json()` (default 200)
- `removeUsuario` en lloc de `deleteUsuario`
- `getById` retorna `rows[0]` sense `|| null` → retorna `undefined` si no trobat

---

### 5.3 Repositoris → MySQL

Tots els repositoris usen `pool.query(SQL, params)` amb placeholders `?`.

#### CRUD complet: `codi_postal.js`, `barri.js`, `tipus_via.js`, `client.js`, `familia.js`, `domicili.js`, `curso.js`, `NESES.js`, `usuari.js`

| Funció | SQL | Paràmetres entrada | Retorn (OK) | Retorn (no trobat) |
|--------|-----|-------------------|-------------|-------------------|
| `getAll()` | `SELECT * FROM taula ORDER BY col` | cap | `Array` d'objectes | `[]` |
| `getById(id)` | `SELECT * FROM taula WHERE PK = ?` | `id` (number) | `Objecte` o `null` (`undefined` a usuari) | `null`/`undefined` |
| `create(…params)` | `INSERT INTO taula (cols) VALUES (?)` | valors del camp | `result.insertId` (number) | N/A |
| `update(id, …params)` | `UPDATE taula SET col=? WHERE PK=?` | `id` + valors | `result.affectedRows` (0 si no trobat) | 0 |
| `remove(id)` | `DELETE FROM taula WHERE PK=?` | `id` | `result.affectedRows` (0 si no trobat) | 0 |

#### `client.js` — particularitats
- 20 paràmetres a `create` i `update` (totes les columnes de `Client`)
- `Telefon ?? null`, `Correu_electronic ?? null`, etc. per opcionals

#### `projectes.js` — particularitats
- `create` rep objecte amb defaults: `Centro_coord=1, plazas=0, inscritos=0`
- `update` i `remove` NO exportats

#### `callejero.js` — únic amb cerca personalitzada

| Funció | SQL | Paràmetres | Retorn OK | Retorn no trobat |
|--------|-----|-----------|-----------|-----------------|
| `search({tipus_via, q})` | `SELECT d.idDireccio, d.Nom_calle, CONCAT(tv.Nom,' ',d.Nom_calle) AS Nom_complet, tv.Nom AS tipus_via, b.Nom AS barri, cp.Codi AS codi_postal FROM direccio d JOIN tipus_via tv ON tv.idTipus_via = d.idTipus_via LEFT JOIN barri b ON b.idBarri = d.idBarri LEFT JOIN codi_postal cp ON cp.idCodi_postal = d.idCodi_postal WHERE 1=1 [AND d.idTipus_via=?] [AND CONCAT(tv.Nom,' ',d.Nom_calle) LIKE ?] ORDER BY tv.Nom, d.Nom_calle, b.Nom, cp.Codi LIMIT 50` | `tipus_via` (opcional, FK), `q` (string, min 3) | `Array` d'objectes | `[]` |
| `getById(id)` | `SELECT … FROM direccio d JOIN … WHERE d.idDireccio = ?` | `id` | `Objecte` | `null` |

---

## 6. Base de Dades

### 6.1 Esquema `mydb`

**Charset:** `utf8` (no utf8mb4). **Motor:** InnoDB. **FK:** totes amb `ON DELETE NO ACTION / ON UPDATE NO ACTION`.

### 6.2 Taules de l'esquema principal (Base_datos.sql)

| # | Taula | Funció | FK cap a |
|---|-------|--------|----------|
| 1 | `Usuario_APP` | Usuaris del sistema | — |
| 2 | ~~`Direccio`~~ | **Eliminada** per `callejero_schema.sql` | — |
| 3 | `Centre_coordinacio` | Centres on es fan activitats | `Direccio` (antiga) |
| 4 | `Proyectos` | Projectes/activitats | `Centre_coordinacio`, `Usuario_APP` |
| 5 | `Tipus_domicili` | Catàleg: Lloguer, Hipoteca… | — |
| 6 | `Domicili` | Domicilis | `Tipus_domicili`, `Direccio` (antiga) |
| 7 | `Proyectos_has_Usuarios APP` | N:M Projectes↔Usuaris | `Proyectos`, `Usuario_APP` |
| 8 | `Estructura_familiar` | Catàleg: biparental, monoparental… | — |
| 9 | `Familia` | Famílies | `Domicili`, `Estructura_familiar` |
| 10 | `Pais` | Catàleg de països | — |
| 11 | `Rol` | Catàleg: Mare, Pare, Fill/a… | — |
| 12 | `Risc` | Catàleg: Sense risc, Lleu… | — |
| 13 | `Resultat_academic` | Catàleg: Promociona, Repeteix… | — |
| 14 | `Motiu_baixa` | Catàleg: Quotes impagades… | — |
| 15 | `Situacio_economica` | Catàleg: Jubilat/ada… | — |
| 16 | `Sebas` | Catàleg SEBAS | — |
| 17 | `Curs_actual` | Catàleg: I3, I4, 1r primaria… | — |
| 18 | `Genere` | Catàleg: Masculí, Femení, No binari | — |
| 19 | `Client` | Entitat principal (20 columnes, 10 FK) | `Familia`, `Rol`, `Genere`, `Pais`, `Risc`, `Resultat_academic`, `Motiu_baixa`, `Situacio_economica`, `Sebas`, `Curs_actual` |
| 20 | `Client_has_Domicili` | N:M Client↔Domicili | `Client`, `Domicili` |
| 21 | `Nacionalitat` | N:M Client↔Pais (extra) | `Client`, `Pais` |
| 22 | `Necessitats_especials` | Catàleg NESE | — |
| 23 | `Necessitats_especials_has_Client` | N:M NESE↔Client | `Necessitats_especials`, `Client` |
| 24 | `Persona_relacionada` | Auto-referència Client↔Client | `Client` (×2) |

### 6.3 Taules del mòdul callejero (callejero_schema.sql)

| # | Taula | Columnes | Files | FK |
|---|-------|----------|-------|----|
| 1 | `tipus_via` | `idTipus_via` PK, `Nom` UNIQUE | 24 | — |
| 2 | `barri` | `idBarri` PK, `Nom` UNIQUE | 56 | — |
| 3 | `codi_postal` | `idCodi_postal` PK, `Codi` UNIQUE | 8 | — |
| 4 | `direccio` | `idDireccio` PK, `idTipus_via` FK, `Nom_calle`, `idBarri` FK, `idCodi_postal` FK. UNIQUE `(idTipus_via, Nom_calle, idBarri, idCodi_postal)` | 1648 | `tipus_via`, `barri`, `codi_postal` |

### 6.4 Dades injectades (inserts_tablas_estaticas.sql)

| Taula | Rows | Origen |
|-------|------|--------|
| `Resultat_academic` | 5 | Manual |
| `Motiu_baixa` | 10 | Manual |
| `Risc` | 4 | Manual |
| `Pais` | ~200 | Manual |
| `Situacio_economica` | 5 | Manual |
| `Rol` | 6 | Manual |
| `Sebas` | 11 | Manual |
| `Necessitats_especials` | 4 | Manual |
| `Curs_actual` | 25 | Manual |
| `Tipus_domicili` | 7 | Manual |
| `Genere` | 3 | Manual |
| `Estructura_familiar` | 6 | Manual |
| `tipus_via` | 24 | Generat de `inserts_calles.sql` |
| `barri` | 56 | Generat de `inserts_calles.sql` |
| `codi_postal` | 8 | Generat de `inserts_calles.sql` |
| `direccio` | 1648 | Generat de `inserts_calles.sql` — combinacions úniques reals |

---

## 7. Frontend

### 7.1 Fitxers

```
src/public/
├── index.html          (892 B) — HTML semàntic
├── css/callejero.css   (995 B) — 12 regles CSS
└── js/callejero.js     (4.1 KB) — 7 funcions, 142 línies
```

### 7.2 Funcions del frontend (`callejero.js`)

| Funció | Rol | Entrada | Comportament | API cridada |
|--------|-----|---------|-------------|-------------|
| `loadTipusVia()` | Inicialització | cap | Carrega `/tipusVia`, emplena `<select>` | `GET /tipusVia` → array `[{idTipus_via, Nom}]` |
| `onFilterChange()` | Gestor d'events | cap (llegeix input) | Debounce 500ms, gate 3 caràcters, evita duplicats | — |
| `fetchResults()` | Crida API | cap (llegeix input + select) | `GET /callejero?q=…&tipus_via=…` → mostra dropdown | `GET /callejero` → array d'objectes |
| `showDropdown(results)` | Render dropdown | `results: Array` | Per cada resultat: `<div>` amb nom. Si `Nom_complet` duplicat: afegeix `<small>barri · CP</small>` | — |
| `selectResult(r)` | Selecció | `r: Object` | Omple input + barri + CP, amaga dropdown, actualitza preview | — |
| `updatePreview(r)` | Barra superior | `r: Object` o falsy | Format: `(tipus_via) nom [barri] <CP>` | — |
| `autoFill(results)` | Autoemplenar | `results: Array` | Si tots els resultats comparteixen barri/CP, emplena camps readonly | — |

### 7.3 Estructura HTML

```
┌────────────────────────────────────────────┐
│  Cercador de carrers                       │
├────────────────────────────────────────────┤
│  ████████████████████████████████████████  │  ← preview-bar (monospace)
│  (tipus_via) Nom_complet [barri] <CP>      │
├────────────────────────────────────────────┤
│  Tipus de via:  [AVINGUDA ▼]              │
├────────────────────────────────────────────┤
│  Nom del carrer: [________________________]│
│                  ┌──────────────────────┐  │
│                  │ AVINGUDA DE L'ABAT   │  │  ← dropdown
│                  │   MARCET             │  │     (desplegable)
│                  │ PONT DE L'ABAT MARCET│  │
│                  │   [POBLE NOU · 08225]│  │  ← amb desambiguació
│                  └──────────────────────┘  │
├────────────────────────────────────────────┤
│  Barri:        [________________] readonly │
│  Codi postal:  [________] readonly        │
└────────────────────────────────────────────┘
```

---

## 8. Inventari de Fitxers

### 8.1 Raïl del projecte
```
.env.example
AGENTS.md
ESTAT_PROJECTE.md        ← aquest fitxer
opencode.json
opencode.jsonc
```

### 8.2 `src/`
```
src/
├── server.js                   — Punt d'entrada + startup SQL
├── AI_test.js                  — Bateria de tests
├── package.json
├── config/
│   └── database.js             — Pool mysql2/promise
├── middlewares/
│   └── auth.js                 — Stub (no actiu)
├── routes/                     — 20 fitxers (un per entitat)
├── controllers/                — 20 fitxers (un per entitat)
├── repositories/               — 20 fitxers (un per entitat)
├── seeder/
│   ├── seeder.js               — Seed: buida BD + càrrega dades + test data
│   └── genera_inserts_callejero.js — Script generador (ús intern)
├── sql/
│   ├── Base_datos.sql          — Esquema principal (528 línies, 24 taules)
│   ├── callejero_schema.sql    — Esquema callejero (direccio + catàlegs)
│   ├── inserts_tablas_estaticas.sql — Totes les dades (16 taules, 2076 línies)
│   ├── inserts_calles.sql      — Dades brutes de carrers (2746 línies)
│   ├── calles_simplificadas.sql
│   └── BBDD_model_original.mwb — Model MySQL Workbench
└── public/
    ├── index.html
    ├── css/callejero.css
    └── js/callejero.js
```

### 8.3 `docs/`
```
docs/
├── endpoints.md                — Documentació d'endpoints
└── AI_TESTS/
    ├── AI_test_001.md
    ├── AI_test_002.md
    ├── AI_test_003.md
    ├── passos_seguents.md      — Llista de tasques pendents
    └── resultat_test.md        — Resultat de l'última execució
```

---

## 9. Estat per Mòdul

### Complet (operatiu)
- ✅ **20 endpoints REST** amb patró 3 capes
- ✅ **CRUD complet** a 9 entitats (tipusVia, barri, codiPostal, neses, curso, usuari, domicili, familia, client)
- ✅ **10 catàlegs de consulta** (paisos, estFamilia, motiuBaixa, resulAcad, risc, rol, sebas, sitEco, tipusDom, callejero)
- ✅ **Mòdul callejero** amb cerca per nom + filtre per tipusVia, 1648 direccions
- ✅ **Frontend autocomplete** amb debounce 500ms, desambiguació, barra de previsualització
- ✅ **Càrrega automàtica** de schema + dades a l'arrencar `server.js`
- ✅ **Seeder** que buida i recarrega totes les dades (inclòs callejero) en ordre FK-safe
- ✅ **Bateria de tests** (20 endpoints, ~96 tests) amb generació d'informe Markdown
- ✅ **Guard `.env`** amb missatge d'error amigable
- ✅ **Taula `direccio` normalitzada** amb UNIQUE INDEX i FK a catàlegs

### Parcial
- ⚠️ **`/projectes`** — falta PUT (update) i DELETE
- ⚠️ **`/client`** — comentari `TODO: ubicacion — afegir gestió de Client_has_Domicili`
- ⚠️ **`usuari.js`** — patró diferent (no `console.error`, retorna `error.message`, retorna `undefined` en lloc de `null`)
- ⚠️ **Cal·lejero no registrat a `server.js`** (comentari a AGENTS.md ja resolt — està registrat)

### No implementat
- ❌ **Autenticació** — `middlewares/auth.js` és un stub
- ❌ **Sessions** — `express-session` + `MySQLStore` comentats
- ❌ **UI de gestió** — No hi ha CRUD visual per a cap entitat
- ❌ **Testos unitaris** — només tests d'integració via AI_test.js
- ❌ **Linter/Formatter** — no configurat
- ❌ **Docker** — no hi ha Dockerfile

---

## 10. Detalls Tècnics Clau

### `.env`
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mydb
SESSION_SECRET=canviame
```
El fitxer ha d'estar a l'arrel del projecte (`../.env` des de `src/`).

### `config/database.js`
Pool mysql2/promise amb `connectionLimit=10`, `waitForConnections=true`, `queueLimit=0`.

### Express 5
`express.json()` és nadiu (no cal `body-parser`).

### Claus foranes
Totes amb `ON DELETE NO ACTION / ON UPDATE NO ACTION`. Les eliminacions han de respectar l'ordre FK-safe (fill abans que pare).

### Callejero: `Nom_complet`
Es calcula a la query amb `CONCAT(tv.Nom, ' ', d.Nom_calle)`. Exemple: `AVINGUDA DE L'ABAT MARCET`.

### Callejero: cerca
- Mínim 3 caràcters per `q`
- `tipus_via` és opcional (FK a `tipus_via.idTipus_via`)
- `LIMIT 50` per seguretat
- ORDER BY: tipus_via, nom_calle, barri, codi_postal

### Callejero: desambiguació al frontend
149 de 1648 combinacions de `(des_sigla, nom_carrer)` tenen múltiples barris/CPs. El frontend mostra ` — barri · CP` en aquests casos.

### Seeder: ordre FK-safe
Delete en ordre invers a les dependencies:
1. Taules junction (Persona_relacionada, Proyectos_has_Usuarios APP, ...)
2. Taules amb FK (Client, Familia, Proyectos, Domicili, ...)
3. Taules sense FK (tipus_via, barri, codi_postal, catàlegs)

### AI_test.js
- 20 endpoints, ~96 tests
- Genera informe a `docs/AI_TESTS/AI_test_NNN.md` (auto-numerat)
- Genera `docs/AI_TESTS/resultat_test.md` (sobreescrit)
- Usa `buildPayload(path)` per generar payloads de POST
- Usa `buildUpdatePayload(path)` per generar payloads de PUT
- Spawna servidor a port 3000 com a child process

---

*Document generat automàticament — revisa i actualitza quan avancis.*
