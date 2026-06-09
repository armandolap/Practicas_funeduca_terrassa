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

### `/client`
```
GET    /client          → client.getAllClients      → client.getAll
POST   /client          → client.createClient       → client.create
GET    /client/:id      → client.getClientById      → client.getById
PUT    /client/:id      → client.updateClient       → client.update
DELETE /client/:id      → client.deleteClient       → client.remove
```
TODO: ubicació — Client_has_Domicili no està gestionat encara.

---

## Unregistered (files exist, **not** wired in `server.js`)

### `/callejero`
```
GET    /callejero       → callejero.getAllCallejero    → callejero.getAll [commented out]
GET    /callejero/:id   → callejero.getCallejeroById   → callejero.getById [commented out]
```
Route file is empty; repository is fully commented out. Dead code.

### `/familia`
```
GET    /familia          → familia.getAllFamilias       → familia.getAll
POST   /familia          → familia.createFamilia        → familia.create
GET    /familia/:id      → familia.getFamiliaById       → familia.getById
PUT    /familia/:id      → familia.updateFamilia        → familia.update
DELETE /familia/:id      → familia.deleteFamilia        → familia.remove
```

### `/domicili`
```
GET    /domicili        → domicili.getAllDomicilis    → domicili.getAll
POST   /domicili        → domicili.createDomicili     → domicili.create
GET    /domicili/:id    → domicili.getDomiciliById    → domicili.getById
PUT    /domicili/:id    → domicili.updateDomicili     → domicili.update
DELETE /domicili/:id    → domicili.deleteDomicili     → domicili.remove
```

---

## Summary

| Category | Count | Endpoints |
|---|---|---|
| Read-only (GET only) | 9 | `paisos`, `estFamilia`, `motiuBaixa`, `resulAcad`, `risc`, `rol`, `sebas`, `sitEco`, `tipusDom` |
| Full CRUD | 6 | `neses`, `curso`, `usuario`, `famili`, `domicili`, `client` |
| Partial CRUD (no PUT/DELETE) | 1 | `projectes` |
| Dead code | 1 | `callejero` |
