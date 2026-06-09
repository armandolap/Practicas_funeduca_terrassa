# Passos Següents

## Pendents d'implementar

### 1. Autenticació i autorització
- `src/middlewares/auth.js` és un stub — cal implementar autenticació amb `express-session` + `MySQLStore`
- Definir rols d'usuari i protegir endpoints CRUD (només admin pot crear/editar/esborrar)

### 2. Interfície gràfica
- Ampliar `index.html` amb un llistat complet (taula) i cerques avançades
- Pàgines de gestió (CRUD) per a les taules de catàleg (`tipus_via`, `barri`, `codi_postal`)
- Revisar l'estructura de `public/css/css/` i `public/js/js/` — s'ha detectat anidació accidental (cal aplanar)

### 3. Documentació de l'API
- Afegir exemples de peticions i respostes a `docs/endpoints.md`
- Documentar els codis d'error possibles per cada endpoint

### 4. Testing
- Ampliar `AI_test.js` per provar casos límit (caràcters especials, SQL injection, valors buits)
- Afegir test per als endpoints de cerca de `callejero` amb diferents combinacions de paràmetres
- Verificar que la clau única de `Direccio` funciona (no es permeten duplicats)

### 5. Base de dades
- `[fet]` Taula `Direccio` normalitzada amb FK a `tipus_via`, `barri`, `codi_postal`
- `[fet]` Clau única a `Direccio` sobre `(idTipus_via, Nom_calle, idBarri, idCodi_postal)`
- `[fet]` Càrrega automàtica del schema + dades estáticas a l'arrencar `server.js`
- Verificar que totes les FK estan correctament indexades per rendiment
- Considerar canviar charset a `utf8mb4` per compatibilitat amb emojis

### 6. Desplegament
- Configurar variables d'entorn per a producció (DB, secrets, port)
- Dockeritzar l'aplicació (Dockerfile + docker-compose)

### 7. Millores al callejero
- [`fet`] Taula `Direccio` amb combinacions úniques reals (1648 files) — substitueix `callejero`
- [`fet`] ORDER BY per `tv.Nom, d.Nom_calle, b.Nom, cp.Codi`
- [`fet`] Desambiguació al dropdown: mostrar barri i CP quan hi ha noms repetits
- [`fet`] Barra de previsualització del carrer seleccionat
- [`fet`] `server.js` executa `callejero_schema.sql` + `inserts_tablas_estaticas.sql` a l'inici
- [`fet`] Eliminada `carrega_callejero.js` — dades integrades al seeder principal

---
*Generat automàticament — revisa i actualitza quan avancis.*
