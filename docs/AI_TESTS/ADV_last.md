# ADV Test Report

**Date:** 2026-06-18T20:02:53.036Z

## Summary

- **Passed:** 105
- **Failed:** 0
- **Warnings:** 0
- **Total:** 105

## Results

```
  ✓ POST /barri (first create)
  ✓ POST /barri duplicate Nom → 4xx
  ✓ POST /codiPostal (first create)
  ✓ POST /codiPostal duplicate Codi → 4xx
  ✓ POST /familia (first unique name)
  ✓ POST /familia duplicate Cognom → 4xx
  ✓ POST /usuario (first unique username)
  ✓ POST /usuario duplicate username → 4xx
  ✓ POST /barri empty Nom → 4xx
  ✓ POST /codiPostal missing Codi → 4xx
  ✓ POST /client/full empty client → 400
  ✓ POST /client/full missing Nom → 400
  ✓ POST /client/full missing Fecha_nacimiento → 400
  ✓ POST /familia missing Cognom_familiar → 400
  ✓ POST /domicili missing Tipus_domicili → 400
  ✓ POST /usuario missing password → 400
  ✓ POST /client invalid idFamilia → 4xx/5xx
  ✓ POST /client invalid idDomicili → 4xx/5xx
  ✓ PUT /client/:id invalid idFamilia → 4xx/5xx
  ✓ POST /client/full invalid idcallejero → 4xx/5xx
  ✓ DELETE /barri/1 (referenced by callejero) → 4xx/5xx
  ✓ DELETE /paisos/1 (referenced by client) → 4xx/5xx
  ✓ DELETE /tipusDom/1 (referenced by domicili) → 4xx/5xx
  ✓ POST /barri 100-char name handled
  ✓ GET /barri/60 after special chars create → 200
  ✓ POST /barri special chars handled
  ✓ POST /client/full future birth date → created or rejected
  ✓ POST /client/full newborn (age 0) handled
  ✓ POST /barri whitespace-only Nom → 4xx
  ✓ GET /client/abc (non-numeric) → 4xx
  ✓ DELETE /barri/:id (first delete)
  ✓ DELETE /barri/:id (second delete → 404)
  ✓ POST /codiPostal long Codi handled
  ✓ WORKFLOW: POST /familia
  ✓ WORKFLOW: POST /domicili
  ✓ WORKFLOW: POST /client (child 1)
  ✓ WORKFLOW: POST /client (parent)
  ✓ WORKFLOW: POST /projectes
  ✓ WORKFLOW: POST /projectes/:id/clients → 2xx
  ✓ WORKFLOW: project has participants
  ✓ WORKFLOW: DELETE projecte client
  ✓ WORKFLOW: family has members
  ✓ GET /client?q=Joan
  ✓ SEARCH client 'Joan' has results
  ✓ GET /familia?q=Garcia
  ✓ SEARCH familia 'Garcia' has results
  ✓ GET /client?familia=1
  ✓ FILTER client by familia=1 has results
  ✓ GET /client?genere=2
  ✓ FILTER client by genere=2 has results
  ✓ GET /client?offset=0&limit=3
  ✓ PAGINATION limit=3 returns ≤3 rows
  ✓ GET /client?edatMin=10&edatMax=20
  ✓ FILTER client age 10-20
  ✓ DESPLEGABLE barri → 200 + array
  ✓ DESPLEGABLE codi_postal → 200 + array
  ✓ DESPLEGABLE curso → 200 + array
  ✓ DESPLEGABLE genere → 200 + array
  ✓ DESPLEGABLE neses → 200 + array
  ✓ DESPLEGABLE pais → 200 + array
  ✓ DESPLEGABLE rol → 200 + array
  ✓ DESPLEGABLE sebas → 200 + array
  ✓ DESPLEGABLE tipus_domicili → 200 + array
  ✓ DESPLEGABLE tipus_via → 200 + array
  ✓ DESPLEGABLE estructura_familiar → 200 + array
  ✓ DESPLEGABLE situacio_eco → 200 + array
  ✓ DESPLEGABLE motiu_baixa → 200 + array
  ✓ DESPLEGABLE risc → 200 + array
  ✓ DESPLEGABLE resul_acad → 200 + array
  ✓ WORKFLOW: POST /client/full with existing family+domicili
  ✓ SEED: baixa client exists
  ✓ BAIXA client has Motiu_baixa
  ✓ BAIXA client has Data_baixa
  ✓ LOGIN empty fields → 4xx
  ✓ LOGIN wrong credentials → 401
  ✓ CALLEJERO search 2 chars
  ✓ CALLEJERO query < 3 chars → empty or all results
  ✓ CALLEJERO no query
  ✓ FAMILIA search non-existent
  ✓ FAMILIA search non-existent → empty
  ✓ FAMILIA checkName existing
  ✓ FAMILIA checkName Garcia exists
  ✓ FAMILIA checkName non-existing
  ✓ FAMILIA checkName XXXXXX not exists
  ✓ FAMILIA checkName missing param
  ✓ DOMICILI search
  ✓ DOMICILI search has results
  ✓ DOMICILI byFamily/1
  ✓ DOMICILI byFamily/1 has results
  ✓ DOMICILI byFamily/999999
  ✓ DOMICILI byFamily/999999 empty
  ✓ SEED: clients >= 12
  ✓ SEED: families >= 8
  ✓ SEED: domicilis >= 10
  ✓ SEED: projects >= 5
  ✓ SEED: users >= 3
  ✓ SEED: centres >= 3
  ✓ CALLEJERO has data
  ✓ DESPLEGABLE pais has data (≥3)
  ✓ DESPLEGABLE rol has data (≥3)
  ✓ DESPLEGABLE risc has data (≥3)
  ✓ DESPLEGABLE genere has data (≥3)
  ✓ DESPLEGABLE sebas has data (≥3)
  ✓ DESPLEGABLE tipus_via has data (≥3)
  ✓ DESPLEGABLE tipus_domicili has data (≥3)
```

✅ **All ADV tests passed**