# Passos Següents — 2026-06-18

## Última sessió: Correcció de 2 bugs

### Bug 1 — Edició de persona no carrega dades (crític)

**Causa**: `const editPersonId` declarada dues vegades al mateix àmbit global:
- Inline a `crear-persona.html:200` (abans de carregar `client-create.js`)
- A `src/public/js/client-create.js:686`

El `SyntaxError` (duplicate `const`) impedia l'execució de TOT `client-create.js`, per tant `loadEditData()` mai s'invocava.

**Fix**: Eliminada la declaració duplicada a `client-create.js`. `let isEditMode = !!editPersonId;` reutilitza la variable global del document HTML.

**Fitxer**: `src/public/js/client-create.js`

### Bug 2 — Inconsistència en filtres de projectes

**2a — Detall de persona (`client.html`)**:
- `let currentProjFilter = 'actius'` → canviat a `'tots'`
- El filtre per defecte havia de mostrar TOTS els projectes, no només actius
- **Fitxer**: `src/public/client.html:31`

**2b — Llistat de persones (`clients.html`)**:
- La columna `projectes` al llistat incloïa projectes passats/cerrats
- Afegit `AND (p.fecha_fin_act IS NULL OR p.fecha_fin_act >= CURDATE())` a la subconsulta `GROUP_CONCAT` a `getFiltered()`
- **Fitxer**: `src/repositories/client.js:22`

### Verificació

| Suite | Tests | Passats | Fallats |
|---|---|---|---|
| `AI_test.js` | 314 automàtics | 314 | 0 |
| `DEVIL_tests.js` | 84 caixa negra | 84 | 0 |

---

## No fet (postergat de la refactorització)

- **Unificar estils de controllers catàleg** (25 fitxers, risc alt, benefici estètic). Patró inline (8-10 línies) vs patró verbós (15-20 línies).
- **Mantenir `idCodi_postal`/`idCodiPostal`** a `callejero.js` — workaround necessari per discrepància entre frontend (camelCase) i BD (snake_case).
- **Mantenir noms `NESES`/`SEBAS`** en majúscules — reflecteixen noms de taula, canviaria massa fitxers.

---

## Recomanacions per a properes iteracions

1. **Revisar tests manuals** — `resultat_test.md` té 7 blocs manuals sobre el cercador de carrers (`callejero`) que mai s'executen automàticament.
2. **Comprovar que `docs/AI_TESTS/` només conté resultats de tests** — la resta de documentació ha d'anar a `docs/`.
3. **Consolidar documentació dispersa** — `src/docs/` ja s'ha mogut a `docs/`, però hi ha múltiples `.md` i fitxers de text a `docs/` que podrien unificar-se si cal.
