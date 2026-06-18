# AI Seguents Passos — FunEduca CRM

## Última sessió (2026-06-18): Correcció de 2 bugs

### Bug 1 — Edició de persona no carrega dades (crític)
- **Causa**: `const editPersonId` declarada dues vegades al mateix àmbit global (inline a `crear-persona.html:200` i a `client-create.js:686`). El `SyntaxError` impedia l'execució de tot `client-create.js`.
- **Fix**: Eliminada la declaració duplicada. `let isEditMode = !!editPersonId;` reutilitza la variable global.
- **Fitxer**: `src/public/js/client-create.js`

### Bug 2 — Inconsistència en filtres de projectes
- **2a (detall)**: `client.html:31` → `currentProjFilter` canviat de `'actius'` a `'tots'`.
- **2b (llistat)**: `repositories/client.js:22` → afegit `AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())` a la subconsulta `GROUP_CONCAT`.

| Suite | Tests | Passats | Fallats |
|---|---|---|---|
| `AI_test.js` | 314 automàtics | 314 | 0 |
| `AI_test_advanced.js` | 105 constraint/workflow | 105 | 0 |
| `DEVIL_tests.js` | 143 caixa negra | 143 | 0 |

---

## Tasques pendents

### Prioritat Alta
- **Autenticació i autorització de rols**: Protegir endpoints CRUD per rol. Actualment `requireAuth` existeix però `requireRole` i `requireTotal` estan implementats però no aplicats a totes les rutes.
- **Executar tests manuals** (vegeu secció «Tests manuals» més avall): 7 blocs sobre el cercador de carrers (`callejero`) que requereixen interacció visual al navegador.

### Prioritat Mitjana
- **Pàgines CRUD visuals per a catàlegs**: `tipus_via`, `barri`, `codi_postal` tenen endpoints però no interfície d'usuari per gestionar-los.
- **Documentació de l'API**: Afegir exemples de peticions/respostes a `docs/endpoints.md`. Documentar codis d'error.
- **Docker**: Crear Dockerfile + docker-compose per backend + MySQL.
- **Cerca callejero**: Afegir paginació o infinite scroll (actualment LIMIT 50).
- **Seed data**: Afegir més dades de test realistes.

### Prioritat Baixa
- **Linter/Formatter**: Configurar ESLint + Prettier. Afegir script a `package.json`.
- **Charset utf8mb4**: Per compatibilitat amb emojis.
- **Indexos FK**: Verificar que totes les FK estan correctament indexades per rendiment.
- **Logging**: Substituir `console.log` per logger estructurat.

### Suggerències
- **CORS**: Si s'usa frontend des d'un altre origen.
- **Client_has_Domicili**: Implementar associació client↔domicili.

---

## No fet (postergat de la refactorització)

- **Unificar estils de controllers catàleg** (25 fitxers, risc alt, benefici estètic).
- **Mantenir `idCodi_postal`/`idCodiPostal`** a `callejero.js` — workaround necessari.
- **Mantenir noms `NESES`/`SEBAS`** en majúscules.

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

