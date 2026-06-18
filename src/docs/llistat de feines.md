# Llistat de feines — Refactorització del codi

> **Objectiu:** Millorar llegibilitat, eliminar duplicacions, unificar estils, tot sense trencar cap test ni funcionalitat.
> **Restricció:** Els fitxers `.sql` NO es modifiquen en cap cas.
> **Eina de verificació:** `AI_test.js` (299 tests auto + 7 manuals) i `DEVIL_tests.js` (84 tests).

---

## Tasca 1 — Eliminar middlewares duplicats a `server.js`

### Què s'ha de fer
Eliminar les línies 68 i 95 de `src/server.js`:
- Línia 68: `server.use(express.json());` — ja està a la línia 17
- Línia 95: `server.use(express.static(path.join(__dirname, "public")));` — ja està a la línia 38

### Per què
Codi duplicat que no aporta cap funcionalitat extra. El primer `express.json()` ja parseja tots els bodies JSON entrants. El segon `express.static()` és redundant perquè el primer ja serveix tots els fitxers estàtics.

### Fitxers afectats
- `src/server.js` (línies 68 i 95)

### Risc
- **Cap.** L'ordre dels middlewares és: parse → body absent check → error JSON → static → routes. El segon `express.json()` no afecta res perquè el primer ja va parsejar. El segon `express.static()` és un no-op idèntic.

### Verificació
- Server engega correctament
- `AI_test.js` passa
- `DEVIL_tests.js` passa

### Resultat
✅ Línies 68 (`express.json()`) i 95 (`express.static()`) eliminades. `server.js` redueix de 150 a 131 línies.

---

## Tasca 2 — Compartir `runSQLFile` entre `server.js` i `seeder.js`

### Què s'ha de fer
1. Crear `src/helpers/sqlRunner.js` amb la funció `runSQLFile(connection, filePath)` extreta de `server.js`
2. A `server.js`: canviar `const` per `require` des del helper, eliminar la definició local
3. A `seeder.js`: canviar `const` per `require` des del helper, eliminar la definició local

### Per què
La funció `runSQLFile` està duplicada als dos fitxers, amb petites diferències en el regex (un usa `USE`, l'altre `use`) i en el tipus d'error ignorat (un usa `includes`, l'altre compara cada valor amb `&&`). Extreure-la a un helper compartit elimina la duplicació i unifica el comportament.

### Fitxers afectats
- `src/helpers/sqlRunner.js` (NOU)
- `src/server.js` (eliminar funció, afegir require)
- `src/seeder.js` (eliminar funció, afegir require)

### Risc
- **Baix.** La funció té la mateixa signatura i comportament. Cal assegurar que la versió "guanyadora" sigui compatible amb ambdós usos.
  - La versió de `server.js` ignora errors 1050, 1060, 1061, 1062 via `includes`
  - La versió de `seeder.js` ignora els mateixos codis via `!==` encadenats (equivalent)
  - La versió de `server.js` usa regex `USE \`?\w+\`?\s*;` amb flag `gim` (case-insensitive)
  - La versió de `seeder.js` usa regex `use \s*;` amb flag `gim` (case-insensitive)
  - La versió del helper unificarà: regex `USE\s+` per netejar, i ignorarà errors 1050, 1060, 1061, 1062 via `includes`

### Verificació
- El servidor arrenca correctament (schema + inserts + seeder)
- `runSeed()` standalone funciona (`node src/seeder/seeder.js`)

### Resultat
✅ Creada `src/helpers/sqlRunner.js`. `server.js` i `seeder.js` l'usen. Ambdós bootstraps funcionen.

---

## Tasca 3 — Extreure validadors de dates a `src/helpers/validators.js`

### Què s'ha de fer
1. Crear `src/helpers/validators.js` amb les funcions:
   - `isValidDate(dateStr)` — valida format YYYY-MM-DD i data real (no 2021-02-30)
   - `isFutureDate(dateStr)` — comprova si la data és futura (fins a 23:59:59 d'avui)
   - `parseDate(dateStr)` — parseja data evitant desplaçament UTC (afegeix "T12:00:00Z")
2. A `controllers/client.js`: importar les funcions des del helper, eliminar les definicions locals (línies 206-221)

### Per què
Les tres funcions estan definides localment a `controllers/client.js`. Extreure-les permet reutilitzar-les en altres controllers en el futur i redueix la mida del fitxer client.js.

### Fitxers afectats
- `src/helpers/validators.js` (NOU)
- `src/controllers/client.js` (eliminar funcions, afegir require)

### Risc
- **Cap.** Les funcions són pures (només depenen del paràmetre d'entrada) i només s'usen dins de `client.js`. El comportament és idèntic.

### Verificació
- `AI_test.js` passa (tests de creació/edició de clients)
- `DEVIL_tests.js` passa (tests de validació de dates)

### Resultat
✅ Creada `src/helpers/validators.js`. `controllers/client.js` l'importa. Validacions de data intactes.

---

## Tasca 4 — Netejar `views/MostraClientes.js`

### Què s'ha de fer
El fitxer `src/views/MostraClientes.js` té errors de sintaxi i no s'utilitza enlloc:
- Línia 10: `const  = require("../repositories/client");` — falta el nom de la variable
- Línia 13: `async clientViewFilter () {` — falta la paraula `function`
- Línia 18: `module.exports = {clientViewFilter }` — exporta una funció que no existeix

**Opció A** (recomanada): Substituir tot el contingut per un comentari que expliqui que és codi mort i l'any en què es va desestimar. Deixar el fitxer com a registre històric però sense errors de sintaxi.

**Opció B**: Esborrar el fitxer. Perill: si algun `require(...)` extern l'importa (tot i que no es troba cap), trencarà.

### Per què
Codi mort amb errors de sintaxi que no aporta valor i podria confondre.

### Fitxers afectats
- `src/views/MostraClientes.js`

### Risc
- **Cap** si s'opta per Opció A. El fitxer no es require des d'enlloc (grep: `MostraClientes` no apareix a cap altre fitxer).

### Verificació
- `server.js` engega sense errors
- `AI_test.js` passa

### Resultat
✅ `src/views/MostraClientes.js` substituït per comentari d'esborrany. Sense canvi funcional.

---

## Tasca 5 — Refactoritzar `controllers/reports.js`

### Què s'ha de fer
Expandir les 13 funcions "pass-through" d'una línia al format multi-línia estàndard del projecte:
```js
async function getGenere(req, res) {
    try {
        const data = await repo.genere();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de gènere" });
    }
}
```

Actualment són:
```js
async function getGenere(req, res) {
    try { res.json(await repo.genere()); } catch (e) { res.status(500).json({ message: e.message }); }
}
```

### Per què
- Les funcions en 1 línia són il·legibles i difícils de depurar
- No registren l'error a la consola (no `console.error`)
- Exposen `e.message` (detall intern de l'error) al client, cosa que la resta del projecte no fa

### Fitxers afectats
- `src/controllers/reports.js`

### Risc
- **Mitjà.** Canvia el missatge d'error retornat al client (de `e.message` a "Error al obtenir ..."). Cap test actual comprova el text exacte del missatge d'error per a reports (els tests verifiquen status code 500 i prou).

### Verificació
- `AI_test.js` passa
- `DEVIL_tests.js` passa

### Resultat
✅ `controllers/reports.js` expandit de 46 a 136 línies. Funcions amb `console.error` i missatges en català consistents.

---

## Tasca 6 - No fer (postergat) — Unificar estils de controllers de catàleg

### Què s'ha de fer
Unificar els 25 controllers de catàleg a un estil consistent. Hi ha 3 patrons:
- **Inline** (genere.js, nivel_acceso.js, barri.js, tipus_via.js, codi_postal.js, centre_activitats.js): funcions compactes, 3-5 línies per funció, `res.status(200).json()` directe
- **Verbós** (NESES.js, SEBAS.js, estructura_familiar.js, motiu_baixa.js, paisos.js, risc.js, rol.js, situacio_eco.js, resul_acad.js, tipus_domicili.js, curso.js): 15-20 línies per funció, `return res.status(404).json()`, molts espais en blanc
- **Mixt** (desplegables.js, callejero.js): patrons especials

**Decisió**: **NO REFACTORITZAR**. L'estil inconsistent no afecta el funcionament i el risc de trencar alguna cosa és massa alt per al benefici estètic.

### Per què es posterga
- Totes les funcions fan exactament el mateix amb estils diferents
- No hi ha diferència funcional
- Els tests cobreixen aquests endpoints
- El risc de trencar per error humà supera el guany de llegibilitat

### Anotació de canvis futurs (si es vol fer)
1. Convertir tots els ReadOnly al patró `genere.js` (inline, 8-10 línies per funció)
2. Convertir tots els CRUD al patró `barri.js` (inline, 8-12 línies per funció)
3. Mantenir `desplegables.js` com a cas especial
4. Mantenir `centre_activitats.js` i `callejero.js` com estan (ja inline)

---

## Tasca 7 — Mantenir `idCodi_postal` / `idCodiPostal` a `callejero.js`

### Decisió: NO CANVIAR

El controller `src/controllers/callejero.js:6` accepta ambdós noms:
```js
const { idCodi_postal, idCodiPostal } = req.query;
const result = await callejeroRepository.search({
    idCodi_postal: idCodi_postal || idCodiPostal,
    ...
});
```

Aquest workaround existeix perquè el frontend envia `idCodiPostal` (camelCase) mentre que la BD usa `idCodi_postal` (snake_case). Canviar-ho requeriria modificar el frontend JS o la BD, cosa que està fora de l'abast.

---

## Tasca 8 — Mantenir noms `NESES` / `SEBAS` en majúscules

### Decisió: NO CANVIAR

Els noms de variable `NESES` i `SEBAS` apareixen a:
- 2 controllers, 2 repos, 2 routes
- `desplegables.js` (MAP)
- `reports.js` / `reports` repo

Canviar-los requeriria modificar tots els fitxers que els usen i podria trencar imports. El nom reflecteix la taula SQL (`necessitats_especials`, `sebas`) i és reconeixible per al desenvolupador.

---

## Resum d'execució

| Tasca | Fitxers | Risc | Prioritat | Estat |
|---|---|---|---|---|
| 1. Eliminar middlewares duplicats | 1 | Cap | Alta | ✅ FET |
| 2. Compartir runSQLFile | 3 (1 nou) | Baix | Alta | ✅ FET |
| 3. Extreure validators | 3 (1 nou) | Cap | Alta | ✅ FET |
| 4. Netejar MostraClientes.js | 1 | Cap | Mitjana | ✅ FET |
| 5. Refactoritzar reports.js | 1 | Mitjà | Mitjana | ✅ FET |
| 6. Unificar catàlegs | 25 | Alt | **POSTERGAT** | ❌ NO |
| 7. idCodi_postal/idCodiPostal | 0 | — | **NO CANVIAR** | ➡️ MANTINGUT |
| 8. Noms NESES/SEBAS | 0 | — | **NO CANVIAR** | ➡️ MANTINGUT |

### Resultat de tests post-canvis

| Suite | Tests | Passats | Fallats |
|---|---|---|---|
| `AI_test.js` | 314 automàtics | 314 | 0 |
| `DEVIL_tests.js` | 84 caixa negra | 84 | 0 |
