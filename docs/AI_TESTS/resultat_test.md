# Resultat dels tests

**Data:** 2026-06-18T06:55:14.317Z

❌ **3 test(s) han fallat** (de 292 totals)

## Possibles problemes i solucions

### POST /usuario → 400

**Error:** expected 201 + {id}, got 400 {"error":"Nom d'usuari obligatori"}

**Possible solució:** Verifica que el controlador retorna 201 i un objecte amb el camp 'id'. Revisa la funció create del repositori.

### POST /callejero (readOnly) → 401

**Error:** expected 404/405, got 401

**Possible solució:** Comprova que l'endpoint existeix a server.js i que la ruta està ben definida.

### GET / → 200

**Error:** expected 200 + login page, got 200

**Possible solució:** Comprova que el controlador retorna l'objecte correcte. Revisa getById al repositori.


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