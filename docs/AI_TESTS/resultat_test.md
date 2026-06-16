# Resultat dels tests

**Data:** 2026-06-16T10:57:46.941Z

❌ **19 test(s) han fallat** (de 215 totals)

## Possibles problemes i solucions

### POST /projectes → 500

**Error:** expected 201 + {id}, got 500 {"message":"Error creant projecte"}

**Possible solució:** Verifica que el controlador retorna 201 i un objecte amb el camp 'id'. Revisa la funció create del repositori.

### PUT /usuario/999999 (nonexistent) → 500

**Error:** expected 404, got 500

**Possible solució:** Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.

### POST /usuario → 400

**Error:** expected 201 + {id}, got 400 {"error":"Rol usuari és obligatori"}

**Possible solució:** Verifica que el controlador retorna 201 i un objecte amb el camp 'id'. Revisa la funció create del repositori.

### POST /domicili {} → 500 (validation)

**Error:** expected 400 for empty body, got 500

**Possible solució:** Verifica que el controlador valida les dades d'entrada i retorna 400 per payloads buits o invàlids.

### POST /domicili → 500

**Error:** expected 201 + {id}, got 500 {"message":"Error creant domicili"}

**Possible solució:** Verifica que el controlador retorna 201 i un objecte amb el camp 'id'. Revisa la funció create del repositori.

### POST /familia {} → 500 (validation)

**Error:** expected 400 for empty body, got 500

**Possible solució:** Verifica que el controlador valida les dades d'entrada i retorna 400 per payloads buits o invàlids.

### PUT /familia/999999 (nonexistent) → 500

**Error:** expected 404, got 500

**Possible solució:** Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.

### POST /familia → 500

**Error:** expected 201 + {id}, got 500 {"message":"Error creant família"}

**Possible solució:** Verifica que el controlador retorna 201 i un objecte amb el camp 'id'. Revisa la funció create del repositori.

### POST /client {} → 500 (validation)

**Error:** expected 400 for empty body, got 500

**Possible solució:** Verifica que el controlador valida les dades d'entrada i retorna 400 per payloads buits o invàlids.

### POST /client → 500

**Error:** expected 201 + {id}, got 500 {"message":"Error creant client"}

**Possible solució:** Verifica que el controlador retorna 201 i un objecte amb el camp 'id'. Revisa la funció create del repositori.

### GET /callejero → 500

**Error:** expected 200 + array, got 500

**Possible solució:** Comprova que el controlador retorna l'objecte correcte. Revisa getById al repositori.

### GET /callejero/1 → 500

**Error:** expected 200 + object, got 500

**Possible solució:** Comprova que el controlador retorna l'objecte correcte. Revisa getById al repositori.

### GET /callejero/999999 → 500

**Error:** expected 404, got 500

**Possible solució:** Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.

### GET /callejero?q=ABAT → 500

**Error:** expected 200 + array, got 500

**Possible solució:** Comprova que el controlador retorna l'objecte correcte. Revisa getById al repositori.

### GET /callejero?q=ABAT&tipus_via=1 → 500

**Error:** expected 200 + array, got 500

**Possible solució:** Comprova que el controlador retorna l'objecte correcte. Revisa getById al repositori.

### GET /callejero?q=ZZZNOTHING → 500

**Error:** expected 200 + array, got 500

**Possible solució:** Comprova que el controlador retorna l'objecte correcte. Revisa getById al repositori.

### GET /callejero?q=AB (min 3 chars) → 500

**Error:** expected 200 + array, got 500

**Possible solució:** Comprova que el controlador retorna l'objecte correcte. Revisa getById al repositori.

### GET /callejero (sense query) → 500

**Error:** expected 200 + array, got 500

**Possible solució:** Comprova que el controlador retorna l'objecte correcte. Revisa getById al repositori.

### GET /callejero/999999 → 500

**Error:** expected 404, got 500

**Possible solució:** Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.


## Tests manuals pendents

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

---
*Aquest fitxer es sobrescriu en cada execució dels tests.*