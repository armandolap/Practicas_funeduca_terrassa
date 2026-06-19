# LLista Pendent — FunEduca CRM

> Fusió de `llistat de feines.md` (refactorització) i `prompt_final.md` (build original). Només items NO fets.

---

## Refactorització — No fet / Postergat

### ❌ Unificar estils de controllers de catàleg (25 fitxers)
Hi ha 3 patrons: **Inline** (genere, barri, tipus_via...) i **Verbós** (NESES, SEBAS, paisos...). Risc alt, benefici estètic. Decisió: **NO REFACTORITZAR**.

Anotació per si es vol fer en el futur:
1. ReadOnly → patró `genere.js` (inline, 8-10 línies per funció)
2. CRUD → patró `barri.js` (inline, 8-12 línies per funció)
3. Mantenir `desplegables.js` com a cas especial

### ➡️ Mantenir `idCodi_postal` / `idCodiPostal` a `callejero.js`
Workaround perquè frontend envia camelCase i BD usa snake_case. No canviar.

### ➡️ Mantenir noms `NESES` / `SEBAS` en majúscules
Reflecteixen noms de taula SQL. Canviaria massa fitxers.

---

## Qualitat i manteniment

### Tests
- Afegir tests unitaris (jest, mocha o similar)
- Afegir tests de càrrega/rendiment
- **Prioritat:** Mitjana

### Linter/Formatter
- Configurar ESLint + Prettier
- Afegir script a `package.json`
- **Prioritat:** Baixa

### Documentació de l'API
- Afegir exemples de peticions i respostes a `docs/endpoints.md`
- Documentar codis d'error per cada endpoint
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

- **Cerca callejero**: Afegir paginació o infinite scroll (actualment LIMIT 50)
- **Seed data**: Afegir més dades de test realistes (clients, famílies, projectes)
- **CORS**: Si s'usa frontend des d'un altre origen, cal afegir `cors` middleware
- **Logging**: Afegir logger estructurat (pino, winston) en lloc de `console.log`
