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
| `DEVIL_tests.js` | 84 caixa negra | 84 | 0 |

---

## Tasques pendents

### Prioritat Alta
- **Autenticació i autorització de rols**: Protegir endpoints CRUD per rol. Actualment `requireAuth` existeix però `requireRole` i `requireTotal` estan implementats però no aplicats a totes les rutes.
- **Revisar tests manuals**: `resultat_test.md` té 7 blocs manuals sobre el cercador de carrers (`callejero`) que no s'executen automàticament.

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
