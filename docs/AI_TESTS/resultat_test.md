# Resultat dels tests

**Data:** 2026-06-10T08:12:30.312Z

❌ **5 test(s) han fallat** (de 234 totals)

## Possibles problemes i solucions

### PUT /projectes/2 → 404

**Error:** expected 200, got 404 null

**Possible solució:** Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.

### GET /projectes/2 after update: "Nom_projecte" = "Projecte Test 2"

**Error:** expected "Projecte Test 2 Actualitzat", got "Projecte Test 2"

**Possible solució:** Revisa el codi de l'endpoint: ruta → controlador → repositori. Comprova que el seeder insereix les dades necessàries.

### GET /projectes/2 after update: "Nom_projecte" = "Projecte Test 2"

**Error:** expected "Projecte Test 2 Actualitzat", got "Projecte Test 2"

**Possible solució:** Revisa el codi de l'endpoint: ruta → controlador → repositori. Comprova que el seeder insereix les dades necessàries.

### DELETE /projectes/2 → 404

**Error:** expected 200, got 404

**Possible solució:** Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.

### GET /projectes/2 (after delete) → 200

**Error:** expected 404, got 200

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