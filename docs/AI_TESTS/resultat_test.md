# Resultat dels tests

**Data:** 2026-06-18T15:51:29.825Z

✅ Tots els tests han passat correctament.

## Possibles problemes i solucions

No s'han detectat problemes.

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