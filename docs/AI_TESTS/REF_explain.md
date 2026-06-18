# REF_explain.md — Explicació dels canvis realitzats

## Canvis realitzats

### 1. `src/docs/REFACTOR.md` (creat)

S'ha creat una anàlisi exhaustiva del codi font del projecte, que inclou:

- **Arbre de directoris complet** del projecte `src/`
- **Documentació de cada fitxer**: funció per funció, amb descripció, paràmetres i retorn
- **Documentació de tots els patrons**: CRUD complet, ReadOnly, noms de variables
- **Llistat de problemes detectats**:
  - Codi duplicat (`express.json()`, `express.static()`, `runSQLFile`)
  - Inconsistències de noms (NESES, SEBAS, `idCodi_postal` vs `idCodiPostal`)
  - Valors màgics sense nom (errno 1050, 1060, 1061, 1062; defaults com 1, 12, 26)
  - Funcions en 1 línia il·legibles (`controllers/reports.js`)
  - Càlculs complexos sense comentari (`C_edad--`)
  - Fitxer `MostraClientes.js` amb syntax error
- **Guia de refactorització prioritzada** en 3 nivells
- **Diccionari d'abreviatures** del projecte

### 2. Canvis de codi (encara pendents)

Fins al moment **no s'ha modificat cap fitxer de codi**. L'únic canvi és l'addició del fitxer d'anàlisi `REFACTOR.md`.

### Properes passes previstes

Segons la guia de priorització del `REFACTOR.md`:

1. **Prioritat 1** — Correccions ràpides:
   - Eliminar middlewares duplicats a `server.js`
   - Extreure `isValidDate`/`isFutureDate` a `src/helpers/validators.js`
   - Extreure `runSQLFile` a helper compartit
   - Esborrar o refer `MostraClientes.js`

2. **Prioritat 2** — Llegibilitat:
   - Refactoritzar `reports.js` controller
   - Unificar estil d'importació de repositoris
   - Afegir comentaris de significat

3. **Prioritat 3** — Estructura:
   - Extreure valors màgics a constants
   - Unificar noms NESES/SEBAS
   - Refactoritzar `searchCombined` a `domicili.js`
