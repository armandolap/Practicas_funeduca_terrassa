# FunEduca CRM
FunEduca
Sistema de Gestión Socioeducativa y Seguimiento de Participantes

Aplicación web interna para la gestión socioeducativa de familias, niños, jóvenes y adultos participantes de los programas de la entidad.

El objetivo principal es sustituir la gestión actual basada en Excel por una plataforma centralizada que permita:

* Registrar y actualizar información de participantes y familias.
* Gestionar relaciones familiares y sociales.
* Realizar seguimiento educativo y socioeconómico.
* Registrar altas y bajas.
* Asociar participantes a proyectos.
* Obtener estadísticas e indicadores automáticamente.
* Reducir errores humanos mediante catálogos controlados.

---

# Tecnologías

## Frontend

* HTML5
* CSS3
* JavaScript

## Backend

- Node.js
- Express.js
- JWT Authentication
- MySQL
- mysql2

### Acceso a datos

El proyecto utiliza consultas SQL nativas.
No se utiliza ORM (Sequelize, TypeORM, Prisma, etc.).
---

# Estructura del proyecto

```text
/
├── front/
│   ├── pages/
│   ├── assets/
│   ├── css/
│   ├── js/
│   └── index.html
│
├── back/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── config/
│   │   └── utils/
│   │
│   ├── database/
│   │   ├── schema.sql
│   │   ├── seeds.sql
│   │   └── migrations/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

# Entidades principales

## Gestión de personas

* Client
* Familia
* Rol
* Gener

## Ubicación

* Domicili
* Tipus_domicili
* Pais

## Seguimiento educativo

* Curs_actual
* Resultat_academic

## Seguimiento social

* Sebas
* Risc
* Situacio_economica
* Necessitats_especials

## Gestión administrativa

* Motiu_baixa

## Proyectos

* Proyectos
* Proyectos_has_Usuarios_APP

---

# Catálogos maestros

Las siguientes tablas son consideradas catálogos estáticos:

* Gener
* Pais
* Risc
* Rol
* Sebas
* Situacio_economica
* Resultat_academic
* Motiu_baixa
* Curs_actual
* Tipus_domicili
* Necessitats_especials

Los usuarios NO deben crear ni modificar registros en estas tablas desde la aplicación.

Únicamente los administradores podrán gestionarlas en caso necesario.

---

# Objetivos funcionales

## Gestión de participantes

Permitir:

* Crear participantes.
* Editar participantes.
* Consultar participantes.
* Dar de baja participantes.

## Gestión familiar

Permitir:

* Asociar personas a familias.
* Gestionar roles familiares.
* Consultar composición familiar.

## Gestión de proyectos

Permitir:

* Asignar participantes a proyectos.
* Consultar participantes por proyecto.
* Obtener estadísticas por proyecto.

## Informes

Generar automáticamente información actualmente calculada mediante Excel:

* Participantes por género.
* Participantes por edad.
* Participantes por riesgo.
* Participantes por país de origen.
* Participantes por nacionalidad.
* Participantes por proyecto.
* Participantes por curso.
* Participantes por resultado académico.
* Participantes por situación socioeconómica.

---

# Variables de entorno

Crear un archivo `.env` a partir de `.env.example`

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=funeduca
DB_USER=root
DB_PASSWORD=password

JWT_SECRET=your_secret_key
```

---

# Instalación

Clonar repositorio:

```bash
git clone <repository-url>
```

Entrar al proyecto:

```bash
cd funeduca-crm
```

Instalar dependencias:

```bash
npm install
```

Crear archivo de entorno:

```bash
cp .env.example .env
```

Crear base de datos:

```bash
mysql -u root -p < database/schema.sql
```

Cargar datos iniciales:

```bash
mysql -u root -p < database/seeds.sql
```

Ejecutar aplicación:

```bash
npm run dev
```

---

# Flujo de trabajo Git

```text
main
 │
 └── develop
      │
      ├── feat/clientes
      ├── feat/familias
      ├── feat/proyectos
      ├── feat/dashboard
      └── feat/auth
```

## Reglas

1. Crear siempre ramas desde `develop`.
2. No trabajar directamente sobre `main`.
3. Realizar Pull Request hacia `develop`.
4. Resolver conflictos en la rama propia.
5. Mantener commits pequeños y descriptivos.

---

# Convención de commits

| Prefijo | Descripción           |
| ------- | --------------------- |
| feat:   | Nueva funcionalidad   |
| fix:    | Corrección de errores |
| ref:    | Refactorización       |
| style:  | Cambios visuales      |
| docs:   | Documentación         |
| chore:  | Mantenimiento         |

## Ejemplos

```bash
feat: crear endpoint de clientes
fix: corregir validacion de fecha de nacimiento
ref: simplificar consulta de familias
docs: actualizar README
```

---

# Futuras mejoras

* Dashboard de indicadores.
* Exportación a Excel.
* Gestión de relaciones familiares.
* Historial de modificaciones.
* Auditoría de cambios.
* Control de permisos por roles.
* Panel de administración de catálogos.

```
```
