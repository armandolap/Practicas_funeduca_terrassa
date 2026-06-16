# AI Test Report

**Date:** 2026-06-16T11:52:52.808Z

## Summary

- **Passed:** 218
- **Failed:** 19
- **Warnings:** 1
- **Manual tests:** 7
- **Total (auto):** 238

## Automated Results

```
  ✓ GET /paisos → 200
  ✓ GET /paisos body[0] té id
  ✓ GET /paisos/1 → 200
  ✓ GET /paisos/1 body té id
  ✓ GET /paisos/999999 → 404
  ✓ POST /paisos (readOnly) → 404
  ✓ PUT /paisos/1 (readOnly) → 404
  ✓ DELETE /paisos/1 (readOnly) → 404
  ✓ GET /estFamilia → 200
  ✓ GET /estFamilia body[0] té id
  ✓ GET /estFamilia/1 → 200
  ✓ GET /estFamilia/1 body té id
  ✓ GET /estFamilia/999999 → 404
  ✓ POST /estFamilia (readOnly) → 404
  ✓ PUT /estFamilia/1 (readOnly) → 404
  ✓ DELETE /estFamilia/1 (readOnly) → 404
  ✓ GET /motiuBaixa → 200
  ✓ GET /motiuBaixa body[0] té id
  ✓ GET /motiuBaixa/10 → 200
  ✓ GET /motiuBaixa/10 body té id
  ✓ GET /motiuBaixa/999999 → 404
  ✓ POST /motiuBaixa (readOnly) → 404
  ✓ PUT /motiuBaixa/1 (readOnly) → 404
  ✓ DELETE /motiuBaixa/1 (readOnly) → 404
  ✓ GET /neses → 200
  ✓ GET /neses body[0] té id
  ✓ GET /neses/1 → 200
  ✓ GET /neses/1 body té id
  ✓ GET /neses/999999 → 404
  ✓ POST /neses {} → 400 (validation)
  ✓ PUT /neses/999999 (nonexistent) → 404
  ✓ DELETE /neses/999999 (nonexistent) → 404
  ✓ POST /neses → 201
  ✓ GET /neses/9 after create → 200
  ✓ GET /neses/9 camp "Nom_necessitat" = "Necessitat Test"
  ✓ PUT /neses/9 → 200
  ✓ GET /neses/9 after update → 200
  ✓ GET /neses/9 after update: "Nom_necessitat" = "Necessitat Test"
  ✓ DELETE /neses/9 → 200
  ✓ GET /neses/9 (after delete) → 404
  ✓ GET /resulAcad → 200
  ✓ GET /resulAcad body[0] té id
  ✓ GET /resulAcad/3 → 200
  ✓ GET /resulAcad/3 body té id
  ✓ GET /resulAcad/999999 → 404
  ✓ POST /resulAcad (readOnly) → 404
  ✓ PUT /resulAcad/1 (readOnly) → 404
  ✓ DELETE /resulAcad/1 (readOnly) → 404
  ✓ GET /risc → 200
  ✓ GET /risc body[0] té id
  ✓ GET /risc/4 → 200
  ✓ GET /risc/4 body té id
  ✓ GET /risc/999999 → 404
  ✓ POST /risc (readOnly) → 404
  ✓ PUT /risc/1 (readOnly) → 404
  ✓ DELETE /risc/1 (readOnly) → 404
  ✓ GET /rol → 200
  ✓ GET /rol body[0] té id
  ✓ GET /rol/4 → 200
  ✓ GET /rol/4 body té id
  ✓ GET /rol/999999 → 404
  ✓ POST /rol (readOnly) → 404
  ✓ PUT /rol/1 (readOnly) → 404
  ✓ DELETE /rol/1 (readOnly) → 404
  ✓ GET /sebas → 200
  ✓ GET /sebas body[0] té id
  ✓ GET /sebas/11 → 200
  ✓ GET /sebas/11 body té id
  ✓ GET /sebas/999999 → 404
  ✓ POST /sebas (readOnly) → 404
  ✓ PUT /sebas/1 (readOnly) → 404
  ✓ DELETE /sebas/1 (readOnly) → 404
  ✓ GET /sitEco → 200
  ✓ GET /sitEco body[0] té id
  ✓ GET /sitEco/4 → 200
  ✓ GET /sitEco/4 body té id
  ✓ GET /sitEco/999999 → 404
  ✓ POST /sitEco (readOnly) → 404
  ✓ PUT /sitEco/1 (readOnly) → 404
  ✓ DELETE /sitEco/1 (readOnly) → 404
  ✓ GET /tipusDom → 200
  ✓ GET /tipusDom body[0] té id
  ✓ GET /tipusDom/7 → 200
  ✓ GET /tipusDom/7 body té id
  ✓ GET /tipusDom/999999 → 404
  ✓ POST /tipusDom (readOnly) → 404
  ✓ PUT /tipusDom/1 (readOnly) → 404
  ✓ DELETE /tipusDom/1 (readOnly) → 404
  ✓ GET /curso → 200
  ✓ GET /curso body[0] té id
  ✓ GET /curso/1 → 200
  ✓ GET /curso/1 body té id
  ✓ GET /curso/999999 → 404
  ✓ POST /curso {} → 400 (validation)
  ✓ PUT /curso/999999 (nonexistent) → 404
  ✓ DELETE /curso/999999 (nonexistent) → 404
  ✓ POST /curso → 201
  ✓ GET /curso/51 after create → 200
  ✓ GET /curso/51 camp "Nom" = "Curs Test"
  ✓ PUT /curso/51 → 200
  ✓ GET /curso/51 after update → 200
  ✓ GET /curso/51 after update: "Nom" = "Curs Test"
  ✓ DELETE /curso/51 → 200
  ✓ GET /curso/51 (after delete) → 404
  ✓ GET /projectes → 200
  ✓ GET /projectes body[0] té id
  ✓ GET /projectes/1 → 200
  ✓ GET /projectes/1 body té id
  ✓ GET /projectes/999999 → 404
  ✓ POST /projectes {} → 400 (validation)
  ✗ PUT /projectes/999999 (nonexistent) → 400 — expected 404, got 400
  ✓ DELETE /projectes/999999 (nonexistent) → 404
  ✓ POST /projectes → 201
  ✓ GET /projectes/2 after create → 200
  ✓ GET /projectes/2 camp "Nom_projecte" = "Projecte Test 2"
  ✗ PUT /projectes/2 → 500 — expected 200, got 500 {"message":"Error actualitzant projecte"}
  ✓ GET /projectes/2 after update → 200
  ✓ GET /projectes/2 after update: "Nom_projecte" = "Projecte Test 2 Actualitzat"
  ✓ GET /projectes/2 after update: "Nom_projecte" = "Projecte Test 2 Actualitzat"
  ✓ DELETE /projectes/2 → 200
  ✓ GET /projectes/2 (after delete) → 404
  ✓ GET /usuario → 200
  ✓ GET /usuario body[0] té id
  ✓ GET /usuario/1 → 200
  ✓ GET /usuario/1 body té id
  ✓ GET /usuario/999999 → 404
  ✓ POST /usuario {} → 400 (validation)
  ✗ PUT /usuario/999999 (nonexistent) → 500 — expected 404, got 500
  ✓ DELETE /usuario/999999 (nonexistent) → 404
  ✗ POST /usuario → 400 — expected 201 + {id}, got 400 {"error":"Rol usuari és obligatori"}
  ✓ GET /domicili → 200
  ✓ GET /domicili body[0] té id
  ✓ GET /domicili/1 → 200
  ✓ GET /domicili/1 body té id
  ✓ GET /domicili/999999 → 404
  ✗ POST /domicili {} → 500 (validation) — expected 400 for empty body, got 500
  ✓ PUT /domicili/999999 (nonexistent) → 404
  ✓ DELETE /domicili/999999 (nonexistent) → 404
  ✓ POST /domicili → 201
  ✓ GET /domicili/2 after create → 200
  ✓ GET /domicili/2 camp "Tipus_domicili" = "1"
  ✓ PUT /domicili/2 → 200
  ✓ GET /domicili/2 after update → 200
  ✓ GET /domicili/2 after update: "Tipus_domicili" = "1"
  ✓ DELETE /domicili/2 → 200
  ✓ GET /domicili/2 (after delete) → 404
  ✓ GET /familia → 200
  ✓ GET /familia body[0] té id
  ✓ GET /familia/1 → 200
  ✓ GET /familia/1 body té id
  ✓ GET /familia/999999 → 404
  ✗ POST /familia {} → 500 (validation) — expected 400 for empty body, got 500
  ✗ PUT /familia/999999 (nonexistent) → 500 — expected 404, got 500
  ✓ DELETE /familia/999999 (nonexistent) → 404
  ✗ POST /familia → 500 — expected 201 + {id}, got 500 {"message":"Error creant família"}
  ✓ GET /client → 200
  ✓ GET /client body[0] té id
  ✓ GET /client/1 → 200
  ✓ GET /client/1 body té id
  ✓ GET /client/999999 → 404
  ✗ POST /client {} → 500 (validation) — expected 400 for empty body, got 500
  ✓ POST /client FK invalid (idFamilia: 999999) → 500
  ✓ PUT /client/999999 (nonexistent) → 404
  ✓ DELETE /client/999999 (nonexistent) → 404
  ✗ POST /client → 500 — expected 201 + {id}, got 500 {"message":"Error creant client"}
  ✓ GET /tipusVia → 200
  ✓ GET /tipusVia body[0] té id
  ✓ GET /tipusVia/7 → 200
  ✓ GET /tipusVia/7 body té id
  ✓ GET /tipusVia/999999 → 404
  ✓ POST /tipusVia {} → 400 (validation)
  ✓ PUT /tipusVia/999999 (nonexistent) → 404
  ✓ DELETE /tipusVia/999999 (nonexistent) → 404
  ✓ POST /tipusVia → 201
  ✓ GET /tipusVia/49 after create → 200
  ✓ GET /tipusVia/49 camp "Nom" = "TEST VIA"
  ✓ PUT /tipusVia/49 → 200
  ✓ GET /tipusVia/49 after update → 200
  ✓ GET /tipusVia/49 after update: "Nom" = "TEST VIA MOD"
  ✓ DELETE /tipusVia/49 → 200
  ✓ GET /tipusVia/49 (after delete) → 404
  ✓ GET /barri → 200
  ✓ GET /barri body[0] té id
  ✓ GET /barri/16 → 200
  ✓ GET /barri/16 body té id
  ✓ GET /barri/999999 → 404
  ✓ POST /barri {} → 400 (validation)
  ✓ PUT /barri/999999 (nonexistent) → 404
  ✓ DELETE /barri/999999 (nonexistent) → 404
  ✓ POST /barri → 201
  ✓ GET /barri/113 after create → 200
  ✓ GET /barri/113 camp "Nom" = "TEST BARRI"
  ✓ PUT /barri/113 → 200
  ✓ GET /barri/113 after update → 200
  ✓ GET /barri/113 after update: "Nom" = "TEST BARRI MOD"
  ✓ DELETE /barri/113 → 200
  ✓ GET /barri/113 (after delete) → 404
  ✓ GET /codiPostal → 200
  ✓ GET /codiPostal body[0] té id
  ✓ GET /codiPostal/6 → 200
  ✓ GET /codiPostal/6 body té id
  ✓ GET /codiPostal/999999 → 404
  ✓ POST /codiPostal {} → 400 (validation)
  ✓ PUT /codiPostal/999999 (nonexistent) → 404
  ✓ DELETE /codiPostal/999999 (nonexistent) → 404
  ✓ POST /codiPostal → 201
  ✓ GET /codiPostal/17 after create → 200
  ✓ GET /codiPostal/17 camp "Codi" = "99999"
  ✓ PUT /codiPostal/17 → 200
  ✓ GET /codiPostal/17 after update → 200
  ✓ GET /codiPostal/17 after update: "Codi" = "88888"
  ✓ DELETE /codiPostal/17 → 200
  ✓ GET /codiPostal/17 (after delete) → 404
  ✗ GET /callejero → 500 — expected 200 + array, got 500
  ⚠ GET /callejero array buit (callejero sense query ok) — callejero sense query espera array buit
  ✗ GET /callejero/1 → 500 — expected 200 + object, got 500
  ✗ GET /callejero/999999 → 500 — expected 404, got 500
  ✓ POST /callejero (readOnly) → 404
  ✓ PUT /callejero/1 (readOnly) → 404
  ✓ DELETE /callejero/1 (readOnly) → 404
  ✗ GET /callejero?q=ABAT → 500 — expected 200 + array, got 500
  ✗ GET /callejero?q=ABAT&tipus_via=1 → 500 — expected 200 + array, got 500
  ✗ GET /callejero?q=ZZZNOTHING → 500 — expected 200 + array, got 500
  ✗ GET /callejero?q=AB (min 3 chars) → 500 — expected 200 + array, got 500
  ✗ GET /callejero (sense query) → 500 — expected 200 + array, got 500
  ✗ GET /callejero/999999 → 500 — expected 404, got 500
  ✓ GET / → 200
  ✓ GET /css/callejero.css → 200
  ✓ GET /js/callejero.js → 200
  ✓ GET /nonexistent.html → 404
  ✓ GET /desplegables/barri → 200
  ✓ GET /desplegables/barri[0] té "id" i "Nom"
  ✓ GET /desplegables/noexiste → 404
  ✓ GET /desplegables/codi_postal → 200
  ✓ GET /desplegables/curso → 200
  ✓ GET /desplegables/tipus_via → 200
  ✓ GET /desplegables/rol → 200
  ✓ GET /desplegables/neses → 200
```

❌ **19 test(s) failed**

## Manual Tests (user)

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
