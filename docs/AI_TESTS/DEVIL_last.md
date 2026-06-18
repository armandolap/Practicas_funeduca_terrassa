# DEVIL Test Report

**Date:** 2026-06-18T20:16:02.818Z

## Summary

- **Passed:** 143
- **Failed:** 0
- **Warnings:** 0
- **Total:** 143

## Results

```
  ✓ POST /projectes {} → 400
  ✓ POST /projectes {projecte:{}} → 400
  ✓ POST /projectes empty Nom → 400
  ✓ POST /client/full {} → 400
  ✓ POST /client/full empty nested → 400
  ✓ POST /client {} → 400
  ✓ POST /client empty Nom → 400
  ✓ POST /familia empty Cognom → 400
  ✓ POST /usuario {} → 400
  ✓ POST /domicili {} → 400
  ✓ POST /auth/login {} → 400
  ✓ PUT /client/1/full {} → 400
  ✓ POST /tipusVia {} → 400
  ✓ POST /barri {} → 400
  ✓ POST /codiPostal {} → 400
  ✓ POST /client/full idGenere=999 → error
  ✓ POST /client/full familia=999999 → error
  ✓ POST /client/full domicili=999999 → error
  ✓ POST /projectes centre=999 → error
  ✓ POST /domicili tipus=999 → error
  ✓ POST /domicili direccio=999999 → error
  ✓ POST /familia estr=999 → error
  ✓ POST /usuario nivell=999 → error
  ✓ POST /projectes/:id/clients clientId=999999 → error
  ✓ POST /usuario username=usuari (duplicat) → 409/500
  ✓ POST /familia Cognom=Garcia (duplicat) → 409/500
  ✓ POST /tipusVia Nom=CARRER (duplicat) → 409/500
  ✓ POST /barri Nom=CENTRE (duplicat) → 409/500
  ✓ POST /codiPostal Codi=08225 (duplicat) → 409/500
  ✓ POST /client/full SQL injection Nom → 201 o error (no crash)
  ✓ POST /client/full SQL injection OR → 201 o error (no crash)
  ✓ POST /projectes SQL injection → 201 o error (no crash)
  ✓ POST /familia SQL injection → 201 o error (no crash)
  ✓ GET /client?q=SQLi → 200 (no crash)
  ✓ GET /projectes?q=SQLi → 200 (no crash)
  ✓ POST /client/full XSS → 201 o error (no crash)
  ✓ POST /projectes XSS → 201 o error (no crash)
  ✓ POST /familia XSS → 201 o error (no crash)
  ✓ POST /client/full idGenere=string → 400
  ✓ POST /client/full Fecha=string → 400
  ✓ POST /projectes plazas=string → 400
  ✓ POST /domicili tipus=string → 400
  ✓ POST /familia estr=string → 400
  ✓ POST /client/full Fecha=2021-02-30 → 400
  ✓ POST /client/full Fecha='' → 400
  ✓ POST /projectes plazas=-1 → 400
  ✓ POST /projectes plazas=0 → 201
  ✓ POST /client/full Nom 10000 chars → 400
  ✓ POST /projectes Nom 10000 chars → 400
  ✓ POST /familia Cognom 10000 chars → 400
  ✓ POST /usuario username 10000 chars → 400
  ✓ POST /client/full raw text → 400
  ✓ POST /projectes Nom=null → 400
  ✓ POST /familia sense body → 400
  ✓ POST /client/full client=[] → 400
  ✓ POST /projectes sense token → 401
  ✓ PUT /projectes/1 sense token → 401
  ✓ DELETE /projectes/1 sense token → 401
  ✓ POST /projectes/:id/clients sense token → 401
  ✓ GET /auth/me sense token → 401
  ✓ GET /auth/me token invalid → 401
  ✓ DELETE /familia/1 amb clients → error (FK)
  ✓ DELETE /domicili/1 amb clients → error (FK)
  ✓ DELETE /projectes amb responsables → 200
  ✓ DELETE /usuario/3 (responsable) → 200
  ✓ POST /projectes fi<inici → 400
  ✓ POST /client/full Data_alta=2099 → 400
  ✓ POST /client/full Fecha_nac=2099 → 400
  ✓ PUT /client/1 sense body → 400
  ✓ PUT /familia/1 sense body → 400
  ✓ PUT /domicili/1 sense body → 400
  ✓ PUT /usuario/1 sense body → 400
  ✓ GET /client/0 → 404
  ✓ GET /client/-1 → 4xx
  ✓ GET /client/1.5 → 4xx
  ✓ GET /client/NaN → 4xx
  ✓ GET /client/overflow → 4xx
  ✓ POST /client/full idGenere=-1 → 4xx
  ✓ POST /client/full idGenere=1.5 → 4xx
  ✓ GET /client/null → 4xx
  ✓ GET /client/' (quote) → 4xx
  ✓ POST /projectes plazas=-999999 → 4xx
  ✓ DELETE /paisos/1 (readOnly) → 4xx
  ✓ PUT /paisos/1 (readOnly) → 4xx
  ✓ POST /paisos (readOnly) → 4xx
  ✓ DELETE /callejero/1 (readOnly) → 4xx
  ✓ PUT /resulAcad/1 (readOnly) → 4xx
  ✓ DELETE /genere/1 (readOnly) → 4xx
  ✓ POST /desplegables/barri → 4xx
  ✓ DELETE /projectes/:id/clients/:idClient sense token → 401
  ✓ POST /callejero sense token → 401
  ✓ POST /callejero with admin token → handled (no crash)
  ✓ GET /auth/me token malformed → 401
  ✓ POST /client/full __proto__ → 201 or 4xx (no crash)
  ✓ POST /projectes constructor.prototype → 201 or 4xx (no crash)
  ✓ POST /barri with extra id field → handled (no crash)
  ✓ POST /client/full deeply nested → handled (no crash)
  ✓ POST /familia emoji → 201 or 4xx (no crash)
  ✓ POST /projectes null byte → 201 or 4xx (no crash)
  ✓ POST /client/full unicode RTL override → 201 or 4xx (no crash)
  ✓ POST /tipusVia control chars → 201 or 4xx (no crash)
  ✓ POST /client/full whitespace Nom/Cognoms → 400
  ✓ POST /familia 1000 emojis → 201 or 4xx (no crash)
  ✓ POST /client/full accented chars → 201 or 4xx (no crash)
  ✓ GET /client?limit=-1 → 200 (no crash)
  ✓ GET /client?offset=-1 → 200 (no crash)
  ✓ GET /client?limit=0 → 200
  ✓ GET /client?limit=0 returns ≤0 results
  ✓ GET /client?limit=9999999 → 200 (no crash)
  ✓ GET /client?offset=999999999 → 200 (no crash)
  ✓ GET /client?offset=999999999 returns empty
  ✓ GET /client?sort=SQLi → 200 (no crash)
  ✓ GET /client?id[]= → 200 (no crash)
  ✓ GET /client?familia=1&familia=2 → 200 (no crash)
  ✓ GET /familia/search?q= → handled
  ✓ GET /client?q=XSS (query) → 200 (no crash)
  ✓ POST /client/full XML → 400
  ✓ POST /client/full multipart → 400
  ✓ POST /client/full text/html → 400
  ✓ POST /client/full no Content-Type → 400
  ✓ POST /client/full charset variation → handled (no crash)
  ✓ POST /client/full empty string body → 400
  ✓ POST /client/full body=null → 400
  ✓ POST /client/full body=number → 400
  ✓ POST /projectes duplicate keys → handled (no crash)
  ✓ POST /client/full body=boolean → 400
  ✓ POST /client/full body=array → 400
  ✓ DELETE /nivell-acces/1 (FK protected) → 4xx/5xx
  ✓ DELETE /centre-activitats/1 (FK protected) → 4xx/5xx
  ✓ DELETE /rol/4 (FK protected) → 4xx/5xx
  ✓ DELETE /sebas/11 (FK protected) → 4xx/5xx
  ✓ GET /client/999999 → 404
  ✓ PUT /client/999999 → 404
  ✓ DELETE /client/999999 → 404
  ✓ GET /projectes/999999 → 404
  ✓ PUT /projectes/999999 → 404
  ✓ DELETE /projectes/999999 → 404
  ✓ GET /usuario/999999 → 404
  ✓ PUT /usuario/999999 → 404
  ✓ DELETE /usuario/999999 → 404
  ✓ GET /familia/999999 → 404
  ✓ PUT /familia/999999 → 404
  ✓ DELETE /familia/999999 → 404
```

✅ **All DEVIL tests passed**