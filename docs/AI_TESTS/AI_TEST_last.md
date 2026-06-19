# AI Test Report

**Date:** 2026-06-19T09:07:54.262Z

## Summary

- **Passed:** 314
- **Failed:** 0
- **Warnings:** 0
- **Manual tests:** 7
- **Total (auto):** 314

## Automated Results

```
  ✓ GET /paisos → 200
  ✓ GET /paisos body[0] té id
  ✓ GET /paisos/17 → 200
  ✓ GET /paisos/17 body té id
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
  ✓ GET /neses/5 after create → 200
  ✓ GET /neses/5 camp "Nom_necessitat" = "Necessitat Test"
  ✓ PUT /neses/5 → 200
  ✓ GET /neses/5 after update → 200
  ✓ GET /neses/5 after update: "Nom_necessitat" = "Necessitat Test"
  ✓ DELETE /neses/5 → 200
  ✓ GET /neses/5 (after delete) → 404
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
  ✓ GET /curso/27 after create → 200
  ✓ GET /curso/27 camp "Nom" = "Curs Test"
  ✓ PUT /curso/27 → 200
  ✓ GET /curso/27 after update → 200
  ✓ GET /curso/27 after update: "Nom" = "Curs Test"
  ✓ DELETE /curso/27 → 200
  ✓ GET /curso/27 (after delete) → 404
  ✓ GET /projectes → 200
  ✓ GET /projectes body[0] té id
  ✓ GET /projectes/9 → 200
  ✓ GET /projectes/9 body té id
  ✓ GET /projectes/999999 → 404
  ✓ POST /projectes {} → 400 (validation)
  ✓ PUT /projectes/999999 (nonexistent) → 404
  ✓ DELETE /projectes/999999 (nonexistent) → 404
  ✓ POST /projectes → 201
  ✓ GET /projectes/10 after create → 200
  ✓ GET /projectes/10 camp "Nom_projecte" = "Projecte Test 2"
  ✓ PUT /projectes/10 → 200
  ✓ GET /projectes/10 after update → 200
  ✓ GET /projectes/10 after update: "Nom_projecte" = "Projecte Test 2 Actualitzat"
  ✓ GET /projectes/10 after update: "Nom_projecte" = "Projecte Test 2 Actualitzat"
  ✓ DELETE /projectes/10 → 200
  ✓ GET /projectes/10 (after delete) → 404
  ✓ GET /usuario → 200
  ✓ GET /usuario body[0] té id
  ✓ GET /usuario/3 → 200
  ✓ GET /usuario/3 body té id
  ✓ GET /usuario/999999 → 404
  ✓ POST /usuario {} → 400 (validation)
  ✓ PUT /usuario/999999 (nonexistent) → 404
  ✓ DELETE /usuario/999999 (nonexistent) → 404
  ✓ POST /usuario → 201
  ✓ GET /usuario/7 after create → 200
  ✓ GET /usuario/7 camp "Nom" = "Test"
  ✓ PUT /usuario/7 → 200
  ✓ GET /usuario/7 after update → 200
  ✓ GET /usuario/7 after update: "Nom" = "Test"
  ✓ DELETE /usuario/7 → 200
  ✓ GET /usuario/7 (after delete) → 404
  ✓ GET /domicili → 200
  ✓ GET /domicili body[0] té id
  ✓ GET /domicili/1 → 200
  ✓ GET /domicili/1 body té id
  ✓ GET /domicili/999999 → 404
  ✓ POST /domicili {} → 400 (validation)
  ✓ PUT /domicili/999999 (nonexistent) → 404
  ✓ DELETE /domicili/999999 (nonexistent) → 404
  ✓ POST /domicili → 201
  ✓ GET /domicili/11 after create → 200
  ✓ GET /domicili/11 camp "Tipus_domicili" = "1"
  ✓ PUT /domicili/11 → 200
  ✓ GET /domicili/11 after update → 200
  ✓ GET /domicili/11 after update: "Tipus_domicili" = "1"
  ✓ DELETE /domicili/11 → 200
  ✓ GET /domicili/11 (after delete) → 404
  ✓ GET /familia → 200
  ✓ GET /familia body[0] té id
  ✓ GET /familia/8 → 200
  ✓ GET /familia/8 body té id
  ✓ GET /familia/999999 → 404
  ✓ POST /familia {} → 400 (validation)
  ✓ PUT /familia/999999 (nonexistent) → 404
  ✓ DELETE /familia/999999 (nonexistent) → 404
  ✓ POST /familia → 201
  ✓ GET /familia/9 after create → 200
  ✓ GET /familia/9 camp "Cognom_familiar" = "Test"
  ✓ PUT /familia/9 → 200
  ✓ GET /familia/9 after update → 200
  ✓ GET /familia/9 after update: "Cognom_familiar" = "Test"
  ✓ DELETE /familia/9 → 200
  ✓ GET /familia/9 (after delete) → 404
  ✓ GET /client → 200
  ✓ GET /client body[0] té id
  ✓ GET /client/13 → 200
  ✓ GET /client/13 body té id
  ✓ GET /client/999999 → 404
  ✓ POST /client {} → 400 (validation)
  ✓ POST /client FK invalid (idFamilia: 999999) → 500
  ✓ PUT /client/999999 (nonexistent) → 404
  ✓ DELETE /client/999999 (nonexistent) → 404
  ✓ POST /client → 201
  ✓ GET /client/17 after create → 200
  ✓ PUT /client/17 → 200
  ✓ GET /client/17 after update → 200
  ✓ GET /client/17 after update: "Nom" = "Maria Actualitzada"
  ✓ DELETE /client/17 → 200
  ✓ GET /client/17 (after delete) → 404
  ✓ GET /tipusVia → 200
  ✓ GET /tipusVia body[0] té id
  ✓ GET /tipusVia/7 → 200
  ✓ GET /tipusVia/7 body té id
  ✓ GET /tipusVia/999999 → 404
  ✓ POST /tipusVia {} → 400 (validation)
  ✓ PUT /tipusVia/999999 (nonexistent) → 404
  ✓ DELETE /tipusVia/999999 (nonexistent) → 404
  ✓ POST /tipusVia → 201
  ✓ GET /tipusVia/25 after create → 200
  ✓ GET /tipusVia/25 camp "Nom" = "TEST VIA"
  ✓ PUT /tipusVia/25 → 200
  ✓ GET /tipusVia/25 after update → 200
  ✓ GET /tipusVia/25 after update: "Nom" = "TEST VIA MOD"
  ✓ DELETE /tipusVia/25 → 200
  ✓ GET /tipusVia/25 (after delete) → 404
  ✓ GET /barri → 200
  ✓ GET /barri body[0] té id
  ✓ GET /barri/16 → 200
  ✓ GET /barri/16 body té id
  ✓ GET /barri/999999 → 404
  ✓ POST /barri {} → 400 (validation)
  ✓ PUT /barri/999999 (nonexistent) → 404
  ✓ DELETE /barri/999999 (nonexistent) → 404
  ✓ POST /barri → 201
  ✓ GET /barri/57 after create → 200
  ✓ GET /barri/57 camp "Nom" = "TEST BARRI"
  ✓ PUT /barri/57 → 200
  ✓ GET /barri/57 after update → 200
  ✓ GET /barri/57 after update: "Nom" = "TEST BARRI MOD"
  ✓ DELETE /barri/57 → 200
  ✓ GET /barri/57 (after delete) → 404
  ✓ GET /codiPostal → 200
  ✓ GET /codiPostal body[0] té id
  ✓ GET /codiPostal/6 → 200
  ✓ GET /codiPostal/6 body té id
  ✓ GET /codiPostal/999999 → 404
  ✓ POST /codiPostal {} → 400 (validation)
  ✓ PUT /codiPostal/999999 (nonexistent) → 404
  ✓ DELETE /codiPostal/999999 (nonexistent) → 404
  ✓ POST /codiPostal → 201
  ✓ GET /codiPostal/9 after create → 200
  ✓ GET /codiPostal/9 camp "Codi" = "99999"
  ✓ PUT /codiPostal/9 → 200
  ✓ GET /codiPostal/9 after update → 200
  ✓ GET /codiPostal/9 after update: "Codi" = "88888"
  ✓ DELETE /codiPostal/9 → 200
  ✓ GET /codiPostal/9 (after delete) → 404
  ✓ GET /callejero → 200
  ✓ GET /callejero body[0] té id
  ✓ GET /callejero/7 → 200
  ✓ GET /callejero/7 body té id
  ✓ GET /callejero/999999 → 404
  ✓ POST /callejero (readOnly) → 400
  ✓ PUT /callejero/1 (readOnly) → 404
  ✓ DELETE /callejero/1 (readOnly) → 404
  ✓ GET /callejero?q=ABAT → 200
  ✓ GET /callejero?q=ABAT té resultats
  ✓ GET /callejero?q=ABAT[0] té idcallejero
  ✓ GET /callejero?q=ABAT[0] té Nom_complet
  ✓ GET /callejero?q=ABAT[0] té tipus_via
  ✓ GET /callejero/1 → 200
  ✓ GET /callejero/1 nom_complet = "AVINGUDA ABAT MARCET, DE L'"
  ✓ GET /callejero?q=ABAT&tipus_via=1 → 200
  ✓ GET /callejero?q=ABAT&tipus_via=1 filtrat
  ✓ GET /callejero?q=ZZZNOTHING → 200
  ✓ GET /callejero?q=ZZZNOTHING buit
  ✓ GET /callejero?q=AB (min 3 chars) → 200
  ✓ GET /callejero?q=AB array buit (o tots)
  ✓ GET /callejero (sense query) → 200
  ✓ GET /callejero/999999 → 404
  ✓ GET / → 200
  ✓ GET /crear-persona.html → 200
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
  ✓ GET /familia/search?q=Garcia → 200
  ✓ GET /familia/search?q=Garcia té resultats
  ✓ GET /familia/search?q=Garcia[0] té idFamilia
  ✓ GET /familia/search?q=Garcia[0] té Cognom_familiar
  ✓ GET /familia/search?q=ZZZNOTHING buit
  ✓ GET /familia/search (sense q) → 400
  ✓ GET /domicili/byFamily/1 → 200
  ✓ GET /domicili/byFamily/1 té resultats
  ✓ GET /domicili/byFamily/1[0] té idDomicili
  ✓ GET /domicili/byFamily/999999 → 200
  ✓ GET /domicili/search?q=ABAT → 200
  ✓ GET /domicili/search?q=ABAT té resultats
  ✓ GET /domicili/search?q=ABAT[0] té _type
  ✓ GET /domicili/search?q=ABAT[0] té idcallejero
  ✓ GET /domicili/search?q=ABAT[0] té Nom_complet
  ✓ GET /domicili/search?q=A&idFamilia=1 → 200
  ✓ GET /domicili/search?q=ZZZNOTHING → 200
  ✓ GET /domicili/search?q=ZZZNOTHING buit
  ✓ GET /domicili/search?q=AB (short) → 200
  ✓ GET /domicili/search (sense q) → 200
  ✓ GET /familia/checkName?name=Garcia → 200
  ✓ GET /familia/checkName?name=ZZZZZ → 200
  ✓ GET /familia/checkName (sense name) → 400
  ✓ POST /client/full → 201
  ✓ GET /client/18 after full create → 200
  ✓ GET /client/18 C_edad calculada
  ✓ GET /client/18 Baixa=0
  ✓ GET /client/18 C_temps_a_lentitat="0"
  ✓ POST /client/full missing fields → 400
  ✓ POST /client/full amb familia/domicili existents → 201
  ✓ GET /resulAcad → 6 registres (esperat 6)
  ✓ GET /motiuBaixa → 10 registres (esperat 10)
  ✓ GET /risc → 4 registres (esperat 4)
  ✓ GET /paisos → 246 registres (esperat 246)
  ✓ GET /sitEco → 5 registres (esperat 5)
  ✓ GET /rol → 6 registres (esperat 6)
  ✓ GET /sebas → 12 registres (esperat 12)
  ✓ GET /neses → 4 registres (esperat 4)
  ✓ GET /curso → 26 registres (esperat 26)
  ✓ GET /tipusDom → 7 registres (esperat 7)
  ✓ GET /genere → 3 registres (esperat 3)
  ✓ GET /estFamilia → 6 registres (esperat 6)
  ✓ GET /tipusVia → 24 registres (esperat 24)
  ✓ GET /barri → 56 registres (esperat 56)
  ✓ GET /codiPostal → 8 registres (esperat 8)
```

✅ **All automated tests passed**