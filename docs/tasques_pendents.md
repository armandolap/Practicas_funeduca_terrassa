# Tasques Pendents — FunEduca CRM

> Extret de `ESTAT_PROJECTE.md`. Actualitzat: 2026-06-09

---

## Funcionalitat pendent

### Autenticació i autorització
- `middlewares/auth.js` és un stub — cal implementar autenticació amb `express-session` + `MySQLStore`
- Definir rols d'usuari i protegir endpoints CRUD (només admin pot crear/editar/esborrar)
- **Prioritat:** Alta

### Interfície gràfica de gestió
- Pàgines CRUD visuals per a catàlegs (`tipus_via`, `barri`, `codi_postal`)
- Pàgina de gestió de clients, famílies, domicilis
- **Prioritat:** Mitjana

### Completar endpoints
#### `/projectes` (Parcial)
- Falten PUT (update) i DELETE
- Controlador té comentari `// FALTEN PUT I POST per crear i modificar projectes`
- **Prioritat:** Alta

#### `/client` (Parcial)
- Comentari `TODO: ubicacion — afegir gestió de Client_has_Domicili`
- **Prioritat:** Mitjana

#### `usuari.js` (Parcial)
- Normalitzar patró: afegir `console.error`, retornar `{ message }` en lloc de `{ error }`, retornar `null` en lloc de `undefined`
- **Prioritat:** Baixa

---

## Qualitat i manteniment

### Tests
- Afegir tests unitaris (jest, mocha, o similar)
- Afegir tests de càrrega/rendiment
- **Prioritat:** Mitjana

### Linter/Formatter
- Configurar ESLint + Prettier
- Afegir script a `package.json`
- **Prioritat:** Baixa

### Documentació de l'API
- Afegir exemples de peticions i respostes a `docs/endpoints.md`
- Documentar codis d'error possibles per cada endpoint
- **Prioritat:** Mitjana

---

## Infraestructura

### Docker
- Crear Dockerfile per al backend
- Crear docker-compose amb backend + MySQL
- **Prioritat:** Mitjana

### Base de dades
- Considerar canviar charset a `utf8mb4` per compatibilitat amb emojis
- Verificar que totes les FK estan correctament indexades per rendiment
- **Prioritat:** Baixa

---

## Suggerències i millores

- **Client_has_Domicili**: Implementar associació client ↔ domicili (actualment és només Domicili → Direccio)
- **Cerca callejero**: Afegir paginació o infinite scroll (actualment LIMIT 50)
- **Desplegament**: Configurar variables d'entorn per a producció
- **Seed data**: Afegir més dades de test realistes (clients, famílies, projectes)
- **CORS**: Si s'usa frontend des d'un altre origen, cal afegir `cors` middleware
- **Logging**: Afegir logger estructurat (pino, winston) en lloc de `console.log`

---

*Document separat de `ESTAT_PROJECTE.md` per mantenir el focus en l'estat actual vs. treball futur.*
