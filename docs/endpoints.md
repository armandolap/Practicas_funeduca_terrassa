# Endpoints — FunEduca CRM

Base path: `/` (all registered directly on the root in `server.js`).

---

## Registered in `server.js` (active)

### `/paisos`
```
GET    /paisos          → paisos.getAllPais          → paisos.getAll
GET    /paisos/:id      → paisos.getPaisById         → paisos.getById
```

### `/estFamilia`
```
GET    /estFamilia          → estructura_familiar.getAllEstructura_familiar    → estructura_familiar.getAll
GET    /estFamilia/:id      → estructura_familiar.getEstructura_familiarById   → estructura_familiar.getById
```

### `/motiuBaixa`
```
GET    /motiuBaixa          → motiu_baixa.getAllMotiu_baixa    → motiu_baixa.getAll
GET    /motiuBaixa/:id      → motiu_baixa.getMotiu_baixaById   → motiu_baixa.getById
```

### `/neses`
```
GET    /neses           → NESES.getAllNESES        → NESES.getAll
POST   /neses           → NESES.createNESES        → NESES.create
GET    /neses/:id       → NESES.getNESESById       → NESES.getById
PUT    /neses/:id       → NESES.updateNESES        → NESES.update
DELETE /neses/:id       → NESES.deleteNESES        → NESES.remove
```

### `/resulAcad`
```
GET    /resulAcad          → resul_acad.getAllResul_acad    → resul_acad.getAll
GET    /resulAcad/:id      → resul_acad.getResul_acadById   → resul_acad.getById
```

### `/risc`
```
GET    /risc           → risc.getAllRisc          → risc.getAll
GET    /risc/:id       → risc.getRiscById         → risc.getById
```

### `/rol`
```
GET    /rol            → rol.getAllRol            → rol.getAll
GET    /rol/:id        → rol.getRolById           → rol.getById
```

### `/sebas`
```
GET    /sebas           → SEBAS.getAllSEBAS        → SEBAS.getAll
GET    /sebas/:id       → SEBAS.getSEBASById       → SEBAS.getById
```

### `/sitEco`
```
GET    /sitEco              → situacio_eco.getAllsituacio_eco    → situacio_eco.getAll
GET    /sitEco/:id          → situacio_eco.getsituacio_ecoById   → situacio_eco.getById
```

### `/tipusDom`
```
GET    /tipusDom              → tipus_domicili.getAlltipus_domicili    → tipus_domicili.getAll
GET    /tipusDom/:id          → tipus_domicili.getTipus_domiciliById   → tipus_domicili.getById
```

### `/curso`
```
GET    /curso           → curso.getAllcurso        → curso.getAll
POST   /curso           → curso.createCurso        → curso.create
GET    /curso/:id       → curso.getCursoById       → curso.getById
PUT    /curso/:id       → curso.updateCurso        → curso.update
DELETE /curso/:id       → curso.deleteCurso        → curso.remove
```

### `/projectes`
```
GET    /projectes          → projectes.getAllProjectes   → projectes.getAll
POST   /projectes          → projectes.createProject     → projectes.create
GET    /projectes/:id      → projectes.getProjectesById  → projectes.getById
```
No PUT/DELETE — noted as TODO in `controllers/projectes.js`.

### `/usuario`
```
GET    /usuario         → usuari.getAllUsuarios     → usuari.getAll
POST   /usuario         → usuari.createUsuario      → usuari.create
GET    /usuario/:id     → usuari.getUsuarioById     → usuari.getById
PUT    /usuario/:id     → usuari.updateUsuario      → usuari.update
DELETE /usuario/:id     → usuari.removeUsuario      → usuari.remove
```

### `/domicili`
```
GET    /domicili        → domicili.getAllDomicilis    → domicili.getAll
POST   /domicili        → domicili.createDomicili     → domicili.create
GET    /domicili/:id    → domicili.getDomiciliById    → domicili.getById
PUT    /domicili/:id    → domicili.updateDomicili     → domicili.update
DELETE /domicili/:id    → domicili.deleteDomicili     → domicili.remove
```

### `/familia`
```
GET    /familia          → familia.getAllFamilias       → familia.getAll
POST   /familia          → familia.createFamilia        → familia.create
GET    /familia/:id      → familia.getFamiliaById       → familia.getById
PUT    /familia/:id      → familia.updateFamilia        → familia.update
DELETE /familia/:id      → familia.deleteFamilia        → familia.remove
```

### `/client`
```
GET    /client          → client.getAllClients      → client.getAll
POST   /client          → client.createClient       → client.create
GET    /client/:id      → client.getClientById      → client.getById
PUT    /client/:id      → client.updateClient       → client.update
DELETE /client/:id      → client.deleteClient       → client.remove
```
TODO: ubicació — Client_has_Domicili no està gestionat encara.

### `/tipusVia`
```
GET    /tipusVia          → tipus_via.getAllTipus_via       → tipus_via.getAll
POST   /tipusVia          → tipus_via.createTipus_via       → tipus_via.create
GET    /tipusVia/:id      → tipus_via.getTipus_viaById      → tipus_via.getById
PUT    /tipusVia/:id      → tipus_via.updateTipus_via       → tipus_via.update
DELETE /tipusVia/:id      → tipus_via.deleteTipus_via       → tipus_via.remove
```

### `/barri`
```
GET    /barri             → barri.getAllBarri               → barri.getAll
POST   /barri             → barri.createBarri               → barri.create
GET    /barri/:id         → barri.getBarriById              → barri.getById
PUT    /barri/:id         → barri.updateBarri               → barri.update
DELETE /barri/:id         → barri.deleteBarri               → barri.remove
```

### `/codiPostal`
```
GET    /codiPostal        → codi_postal.getAllCodi_postal       → codi_postal.getAll
POST   /codiPostal        → codi_postal.createCodi_postal       → codi_postal.create
GET    /codiPostal/:id    → codi_postal.getCodi_postalById      → codi_postal.getById
PUT    /codiPostal/:id    → codi_postal.updateCodi_postal       → codi_postal.update
DELETE /codiPostal/:id    → codi_postal.deleteCodi_postal       → codi_postal.remove
```

### `/callejero`
```
GET    /callejero?tipus_via=X&q=abc   → callejero.searchCallejero    → callejero.search
GET    /callejero/:id                  → callejero.getCallejeroById   → callejero.getById
```
Search: `tipus_via` filtra per tipus de via (opcional). `q` cerca per nom complet (mínim 3 caràcters, debounce 500ms).
La taula `callejero` té una clau única sobre `(idTipus_via, Nom_calle, idBarri, idCodi_postal)` per evitar duplicats.
Per afegir-la a una BD existent: `src/sql/migrations/001_callejero_unique.sql`.

---

## Summary

| Category | Count | Endpoints |
|---|---|---|
| Read-only (GET only) | 10 | `paisos`, `estFamilia`, `motiuBaixa`, `resulAcad`, `risc`, `rol`, `sebas`, `sitEco`, `tipusDom`, `callejero` |
| Full CRUD | 9 | `neses`, `curso`, `usuario`, `domicili`, `familia`, `client`, `tipusVia`, `barri`, `codiPostal` |
| Partial CRUD (no PUT/DELETE) | 1 | `projectes` |
