# AI Test 001 — Test d'Endpoints

Primera bateria de tests automatitzats per als endpoints del CRM.

## Què cobreix

Tots els 16 endpoints registrats a `server.js`:

### Read-only (GET)
- `/paisos`, `/estFamilia`, `/motiuBaixa`, `/resulAcad`
- `/risc`, `/rol`, `/sebas`, `/sitEco`, `/tipusDom`

### CRUD complet (GET, POST, PUT, DELETE)
- `/neses`, `/curso`, `/usuario`, `/domicili`, `/familia`, `/client`

### CRUD parcial (GET, POST)
- `/projectes`

## Què testa cada endpoint

| Prova | Read-only | CRUD |
|-------|-----------|------|
| `GET /` → 200 + array | ✓ | ✓ |
| `GET /:id` (vàlid) → 200 | ✓ | ✓ |
| `GET /:id` (invàlid) → 404 | ✓ | ✓ |
| `POST /` → 201 + id | – | ✓ |
| `PUT /:id` → 200 | – | ✓ |
| `DELETE /:id` → 200 | – | ✓ |
| `GET /:id` (after delete) → 404 | – | ✓ |

## Com executar

```bash
# Assegurar-se que la BD existeix i té les taules creades
mysql -u root -p < src/sql/Base_datos.sql

# Executar tests
node src/AI_test.js
```

## Requisits

- Base de dades `mydb` accessible (configurada a `.env`)
- Taules creades (des de `Base_datos.sql`)
- Node.js 18+ (per `fetch` natiu)

## Ordre de neteja (seeder)

El seeder buida les taules en ordre invers de dependències FK:

1. `Persona_relacionada`
2. `Proyectos_has_Usuarios APP`
3. `Necessitats_especials_has_Client`
4. `Nacionalitat`
5. `Client_has_Domicili`
6. `Client`
7. `Familia`
8. `Proyectos`
9. `Domicili`
10. `Centre_coordinacio`
11. `Direccio`
12. I després les taules estàtiques (catàlegs)
