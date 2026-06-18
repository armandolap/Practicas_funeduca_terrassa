# DEVIL Test Report

**Date:** 2026-06-18T20:03:04.137Z

## Summary

- **Passed:** 84
- **Failed:** 0
- **Warnings:** 0
- **Total:** 84

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