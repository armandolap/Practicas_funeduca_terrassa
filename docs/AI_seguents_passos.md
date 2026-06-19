# AI Seguents Passos — FunEduca CRM

## Última sessió (2026-06-19): requireAuth a totes les rutes + neteja desplegables

### Canvis realitzats

#### 1. Servidor ja no borra la BD en iniciar-se
- **Problema**: `server.js` feia `DROP DATABASE IF EXISTS` + recreava esquema + seed a cada inici.
- **Fix**: Nova funció `ensureDatabase()` que fa `CREATE DATABASE IF NOT EXISTS` i comprova si hi ha taules via `information_schema.tables`. Si ja n'hi ha, salta esquema i inserts.
- **Seed**: Ja no s'executa automàticament. Cal `npm run seed` des de `src/`.
- **Fitxers**: `src/server.js`, `src/seeder/seeder.js`, `src/package.json`, `AGENTS.md`

#### 2. requireAuth a TOTES les rutes del backend
- **Problema**: Només 3 de 26 fitxers de ruta usaven `requireAuth`. L'API era oberta.
- **Fix**: Afegit `requireAuth` a cada ruta de cada fitxer (GET, POST, PUT, DELETE). L'única ruta pública és `POST /auth/login`.
- **Fitxers**: 25 fitxers de ruta modificats (`client.js`, `familia.js`, `domicili.js`, `usuari.js`, `centre_activitats.js`, `projectes.js`, `reports.js`, `desplegables.js`, `callejero.js`, i tots els catàlegs).

#### 3. authFetch() al frontend
- **Problema**: Algunes pàgines del frontend no enviaven el token JWT a les peticions API (sobretot `client-create.js` i `callejero.js`).
- **Fix**: Afegit `authFetch(url, options)` global a `sidebar.js`. Substitudes 8 crides `fetch()` per `authFetch()` a `client-create.js` i `callejero.js`.
- **Fitxers**: `src/public/js/sidebar.js`, `src/public/js/client-create.js`, `src/public/js/callejero.js`

#### 4. desplegables/nivells-acces funcional des de la BD
- **Problema**: `usuari-crear.html` tenia hardcode dels nivells d'accés amb valors incorrectes ("Viewer" en lloc de "Responsable de projectes", faltava "Visitant").
- **Fix**: Afegit `"nivells-acces"` al MAP del controller `desplegables.js`. Eliminat el hardcode i els fallbacks inútils (`fetch('/paisos')`, etc.). El dropdown es carrega exclusivament des de la BD.
- **Fitxers**: `src/controllers/desplegables.js`, `src/public/usuari-crear.html`

#### 5. utf8mb3 → utf8mb4
- **Problema**: `Base_datos.sql` usava charset `utf8mb3` (obsolet, no suporta emojis).
- **Fix**: Substituïdes 29 ocurrències de `utf8mb3` per `utf8mb4`.
- **Fitxer**: `src/sql/Base_datos.sql`

### Tests

| Suite | Tests | Passats | Fallats |
|---|---|---|---|
| `AI_test.js` | 314 automàtics | 314 | 0 |
| `AI_test_advanced.js` | 105 constraint/workflow | 105 | 0 |
| `DEVIL_tests.js` | 143 caixa negra | 141 | 2 |

**2 tests fallats a DEVIL_tests.js** (esperats — causats per requireAuth):
- `GET /client?id[]= → 200 (no crash)` — retorna 401 perquè no envia token
- `GET /client?familia=1&familia=2 → 200 (no crash)` — retorna 401 perquè no envia token
- **Nota**: Aquests tests no són bugs, només cal actualitzar-los perquè enviïn token.

---

## Tasques pendents

### Prioritat Alta
- **Actualitzar DEVIL_tests.js** per enviar token JWT en les peticions (els 2 tests que fallen són falsos positius).
- **Executar tests manuals** (vegeu secció «Tests manuals» més avall): 7 blocs sobre el cercador de carrers (`callejero`) que requereixen interacció visual al navegador.
- **requireRole**: Aplicar `requireTotal` a rutes sensibles (catàlegs POST/PUT/DELETE, usuari CRUD). Actualment totes tenen `requireAuth` però qualsevol rol pot crear/usuaris.

### Prioritat Mitjana
- **Pàgines CRUD visuals per a catàlegs**: `tipus_via`, `barri`, `codi_postal` tenen endpoints però no interfície d'usuari per gestionar-los.
- **Documentació de l'API**: Afegir exemples de peticions/respostes a `docs/endpoints.md`. Documentar codis d'error.
- **Docker**: Crear Dockerfile + docker-compose per backend + MySQL.
- **Cerca callejero**: Afegir paginació o infinite scroll (actualment LIMIT 50).
- **Seed data**: Afegir més dades de test realistes.

### Prioritat Baixa
- **Linter/Formatter**: Configurar ESLint + Prettier. Afegir script a `package.json`.
- **Indexos FK**: Verificar que totes les FK estan correctament indexades per rendiment.
- **Logging**: Substituir `console.log` per logger estructurat.
- **Exposició error.message**: `controllers/usuari.js` exposa `error.message` al client (risc de seguretat). Pendents de debatre.

### Suggerències
- **CORS**: Si s'usa frontend des d'un altre origen.
- **Client_has_Domicili**: Implementar associació client↔domicili.

---

## No fet (postergat de la refactorització)

- **Unificar estils de controllers catàleg** (25 fitxers, risc alt, benefici estètic).
- **Mantenir `idCodi_postal`/`idCodiPostal`** a `callejero.js` — workaround necessari.
- **Mantenir noms `NESES`/`SEBAS`** en majúscules.
- **Unificar CSS**: El professor s'encarregarà de fusionar `main.css` i `client-create.css` (evitar conflictes d'estils).

## Tests manuals

### Obrir http://localhost:3000 al navegador
- [ ] Comprovar que es mostra el títol «Cercador de carrers»
- [ ] Comprovar que el desplegable «Tipus de via» té 24 opcions
- [ ] Comprovar que la barra de previsualització (preview-bar) és visible

### Escriure «ABAT» al camp «Nom del carrer»
- [ ] Comprovar que després de 500ms apareix un menú desplegable
- [ ] Comprovar que les opcions mostren el nom complet del carrer
- [ ] Comprovar que si hi ha noms repetits, es mostra «barri · CP» en lletra petita

### Fer clic a una opció del desplegable
- [ ] Comprovar que el camp «Barri» s'emplena automàticament
- [ ] Comprovar que el camp «Codi postal» s'emplena automàticament
- [ ] Comprovar que la barra de previsualització mostra: (tipus_via) nom [barri] <CP>
- [ ] Comprovar que el menú desplegable es tanca

### Seleccionar un tipus de via del filtre
- [ ] Comprovar que la llista de resultats es filtra pel tipus de via seleccionat

### Fer clic fora del camp de cerca
- [ ] Comprovar que el menú desplegable es tanca

### Escriure menys de 3 caràcters
- [ ] Comprovar que NO apareix el menú desplegable

### Comprovar responsivitat (provar amb Chrome DevTools o mòbil)
- [ ] Comprovar que el formulari es veu correctament en mòbil
- [ ] Comprovar que el menú desplegable no surt de la pantalla
