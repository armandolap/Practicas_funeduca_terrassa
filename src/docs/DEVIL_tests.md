# DEVIL_tests — Edge-case & adversarial tests for FunEduca CRM

Objectiu: provar al màxim de casos d'error que un usuari podria causar (maliciós o accidental) per assegurar que la base de dades i el servidor no fallen mai.

Cada test ha de retornar un codi d'error HTTP (400+, 401, 403, 404, 409, 500) segons el cas. Un 200/201 en aquests tests és un **FALL**.

---

## 1. Missing required fields

Enviar POST/PUT sense els camps obligatoris.

| # | Endpoint | Payload | Expected |
|---|----------|---------|----------|
| 1.1 | POST /projectes | `{}` | 400 |
| 1.2 | POST /projectes | `{"projecte":{}}` | 400 |
| 1.3 | POST /projectes | `{"projecte":{"Nom_projecte":""}}` | 400 |
| 1.4 | POST /client/full | `{}` | 400 |
| 1.5 | POST /client/full | `{"client":{},"familia":{},"domicili":{}}` | 400 |
| 1.6 | POST /client | `{}` | 400 |
| 1.7 | POST /client | `{"Nom":""}` | 400 |
| 1.8 | POST /familia | `{"Cognom_familiar":""}` | 400 |
| 1.9 | POST /usuario | `{}` | 400 |
| 1.10 | POST /domicili | `{}` | 400 |
| 1.11 | POST /auth/login | `{}` | 400 |
| 1.12 | PUT /client/:id/full | `{}` (existing client) | 400 |
| 1.13 | POST /tipusVia | `{}` | 400 |
| 1.14 | POST /barri | `{}` | 400 |
| 1.15 | POST /codiPostal | `{}` | 400 |

## 2. Invalid foreign keys

Enviar IDs que no existeixen.

| # | Endpoint | Payload | Expected |
|---|----------|---------|----------|
| 2.1 | POST /client/full | client amb `idGenere: 999` | 400/500 |
| 2.2 | POST /client/full | `familia.idFamilia: 999999` | 400/500 |
| 2.3 | POST /client/full | `domicili.idDomicili: 999999` | 400/500 |
| 2.4 | POST /projectes | `projecte.idcentre_activitats: 999` | 400/500 |
| 2.5 | POST /domicili | `Tipus_domicili: 999` | 400/500 |
| 2.6 | POST /domicili | `Direccio: 999999` | 400/500 |
| 2.7 | POST /familia | `Estructura_familiar: 999` | 400/500 |
| 2.8 | POST /usuario | `idNivel_acceso: 999` | 400/500 |
| 2.9 | POST /projectes/:id/clients | `{clientIds:[999999]}` | 400/500 |

## 3. Duplicate unique constraints

| # | Endpoint | Payload | Expected |
|---|----------|---------|----------|
| 3.1 | POST /usuario | `{..., username:"usuari"}` (existing) | 409 |
| 3.2 | POST /familia | `{Cognom_familiar:"Garcia"}` (existing) | 409/500 |
| 3.3 | POST /tipusVia | `{Nom:"CARRER"}` (existing) | 409/500 |
| 3.4 | POST /barri | `{Nom:"CENTRE"}` (existing) | 409/500 |
| 3.5 | POST /codiPostal | `{Codi:"08225"}` (existing) | 409/500 |

## 4. SQL injection en camps de text

| # | Endpoint | Payload | Expected |
|---|----------|---------|----------|
| 4.1 | POST /client/full | `client.Nom: "Robert'; DROP TABLE client;--"` | 400/201 (no crash) |
| 4.2 | POST /client/full | `client.Nom: "' OR '1'='1"` | 400/201 (no crash) |
| 4.3 | POST /projectes | `projecte.Nom_projecte: "'; DELETE FROM proyectos;--"` | 400/201 (no crash) |
| 4.4 | POST /familia | `Cognom_familiar: "'; SELECT * FROM client;--"` | 400/201 (no crash) |
| 4.5 | GET /client?q= | `"' OR 1=1 --"` | 200 (no crash) |
| 4.6 | GET /projectes?q= | `"'; DROP TABLE --"` | 200 (no crash) |

## 5. XSS / HTML injection

| # | Endpoint | Payload | Expected |
|---|----------|---------|----------|
| 5.1 | POST /client/full | `client.Nom: "<script>alert('xss')</script>"` | 400/201 (no crash) |
| 5.2 | POST /projectes | `projecte.Nom_projecte: "<img src=x onerror=alert(1)>"` | 400/201 (no crash) |
| 5.3 | POST /familia | `Cognom_familiar: "<svg onload=alert(1)>"` | 400/201 (no crash) |

## 6. Tipus de dades incorrectes

| # | Endpoint | Payload | Expected |
|---|----------|---------|----------|
| 6.1 | POST /client/full | `client.idGenere: "string"` (no número) | 400 |
| 6.2 | POST /client/full | `client.Fecha_nacimiento: "not-a-date"` | 400 |
| 6.3 | POST /projectes | `projecte.plazas: "no numeric"` | 400 |
| 6.4 | POST /domicili | `Tipus_domicili: "string"` | 400 |
| 6.5 | POST /familia | `Estructura_familiar: "string"` | 400 |
| 6.6 | POST /client/full | `client.Fecha_nacimiento: "2021-02-30"` (invalid date) | 400 |
| 6.7 | POST /client/full | `client.Fecha_nacimiento: ""` (empty) | 400 |

## 7. Valors negatius i zero

| # | Endpoint | Payload | Expected |
|---|----------|---------|----------|
| 7.1 | POST /projectes | `projecte.plazas: -1` | 400 |
| 7.2 | POST /projectes | `projecte.plazas: 0` | 400 |
| 7.3 | POST /client/full | `client.C_edad: -5` (auto-calc, no hauria de poder) | ignore |

## 8. Strings extremadament llargues

| # | Endpoint | Payload | Expected |
|---|----------|---------|----------|
| 8.1 | POST /client/full | `client.Nom: "A".repeat(10000)` | 400 |
| 8.2 | POST /projectes | `projecte.Nom_projecte: "A".repeat(10000)` | 400 |
| 8.3 | POST /familia | `Cognom_familiar: "A".repeat(10000)` | 400 |
| 8.4 | POST /usuario | `username: "A".repeat(1000)` | 400 |

## 9. Payload malformat

| # | Endpoint | Payload | Expected |
|---|----------|---------|----------|
| 9.1 | POST /client/full | `not json` (raw text) | 400 |
| 9.2 | POST /projectes | `{projecte:{Nom_projecte:null}}` | 400 |
| 9.3 | POST /familia | `null` (body = null) | 400 |
| 9.4 | POST /client/full | `{client:[],familia:{},domicili:{}}` (client is array) | 400 |

## 10. Autorització

| # | Endpoint | Method | Expected |
|---|----------|--------|----------|
| 10.1 | POST /projectes | sense token | 401 |
| 10.2 | PUT /projectes/1 | sense token | 401 |
| 10.3 | DELETE /projectes/1 | sense token | 401 |
| 10.4 | POST /projectes/:id/clients | sense token | 401 |
| 10.5 | GET /auth/me | sense token | 401 |
| 10.6 | GET /auth/me | token invàlid | 401 |
| 10.7 | POST /projectes | token expired/malformat | 401 |

## 11. DELETE en cascada / FK conflicts

| # | Endpoint | Expected |
|---|----------|----------|
| 11.1 | DELETE /familia/:id (amb clients) | 500 (FK NO ACTION) |
| 11.2 | DELETE /domicili/:id (amb clients) | 500 (FK NO ACTION) |
| 11.3 | DELETE /projectes/:id (amb responsables) | 200 (esborra en cascada via repo) |
| 11.4 | DELETE /usuario/:id (és responsable) | 500 (FK NO ACTION) |

## 12. Datas invàlides / il·lògiques

| # | Endpoint | Payload | Expected |
|---|----------|---------|----------|
| 12.1 | POST /projectes | `{fecha_inicio_act:"2020-01-01",fecha_fin_act:"2019-01-01"}` (fi < inici) | 400 |
| 12.2 | POST /client/full | `client.Data_d_alta:"2099-01-01"` (data futura) | 400 |
| 12.3 | POST /client/full | `client.Fecha_nacimiento:"2099-01-01"` (no nascut) | 400 |
| 12.4 | POST /client/full | `client.Data_d_alta:"1900-01-01"` (massa antiga) | 400/201 |

## 13. POST/PUT amb body buit

| # | Endpoint | Expected |
|---|----------|----------|
| 13.1 | PUT /client/1 (sense body) | 400 |
| 13.2 | PUT /familia/1 (sense body) | 400 |
| 13.3 | PUT /domicili/1 (sense body) | 400 |
| 13.4 | PUT /usuario/1 (sense body) | 400 |

## 14. POST/PUT a entitats readonly

| # | Endpoint | Method | Expected |
|---|----------|--------|----------|
| 14.1 | POST /paisos | POST | 400+ |
| 14.2 | POST /estFamilia | POST | 400+ |
| 14.3 | POST /motiuBaixa | POST | 400+ |
| 14.4 | POST /risc | POST | 400+ |
| 14.5 | POST /rol | POST | 400+ |

## 15. Operacions en IDs inexistents

| # | Endpoint | Expected |
|---|----------|----------|
| 15.1 | GET /client/999999 | 404 |
| 15.2 | PUT /client/999999 | 404 |
| 15.3 | DELETE /client/999999 | 404 |
| 15.4 | GET /projectes/999999 | 404 |
| 15.5 | PUT /projectes/999999 (amb auth) | 404 |
| 15.6 | DELETE /projectes/999999 (amb auth) | 404 |
| 15.7 | GET /usuario/999999 | 404 |
| 15.8 | PUT /usuario/999999 | 404 |
| 15.9 | DELETE /usuario/999999 | 404 |
| 15.10 | GET /familia/999999 | 404 |
| 15.11 | PUT /familia/999999 | 404 |
| 15.12 | DELETE /familia/999999 | 404/500 (FK) |
