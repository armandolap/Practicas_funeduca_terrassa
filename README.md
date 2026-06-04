# Project Template v2 - App Tareas con JWT

Aplicacion web de gestion de tareas con autenticacion JWT, Express y MySQL.

## Estructura del proyecto

```
/
├── front/                  # Frontend
│   ├── index.html          # Pagina principal (login/registro)
│   ├── styles.css          # Estilos
│   └── scripts.js          # Logica JS
├── back/                   # Backend
│   ├── server.js           # Servidor Express (sirve HTML + API)
│   ├── routes.js           # Rutas de la API
│   ├── auth.middleware.js   # Middleware de autenticacion
│   ├── mysql_conn.js       # Conexion a MySQL
│   ├── database.sql        # Schema de la base de datos
│   ├── .env.example        # Variables de entorno (ejemplo)
│   └── package.json        # Dependencias
```

## Setup inicial

```bash
git clone https://github.com/CIFO-IFCD0111-2526/project_template_v2.git
cd project_template_v2
cd back
cp .env.example .env        # Crear archivo de variables de entorno
npm install                  # Instalar dependencias
```

Ejecutar `database.sql` en MySQL para crear las tablas.

```bash
npm run dev                  # Arrancar servidor con auto-reload
```

Abrir http://localhost:3000

## Flujo de trabajo Git

```
main ──────────────────── solo releases estables (no tocar)
  │
  └── develop ─────────── integracion diaria
        │
        ├── feat/login-form
        ├── feat/signup-api
        └── feat/schema-users
```

### Reglas

1. **SIEMPRE** crear rama desde `develop` actualizado
2. Nombre de rama: `feat/descripcion-corta` (NO tu nombre)
3. Commits: `tipo: descripcion` (feat:, fix:, style:, ref:, chore:)
4. PR siempre a `develop`, NUNCA a `main`
5. Minimo 1 review de otro equipo antes de mergear
6. Si hay conflicto, lo resuelves TU en tu rama

### Comandos diarios

```bash
# Antes de empezar (SIEMPRE)
git checkout develop
git pull origin develop
git checkout -b feat/mi-feature    # Solo la primera vez
# o
git checkout feat/mi-feature       # Si ya existe
git merge develop                  # Traer ultimos cambios

# Trabajar y commitear
git add archivo.js
git commit -m "feat: formulario login con validacion"

# Cuando este listo para review
git push -u origin feat/mi-feature
# Crear Pull Request en GitHub -> base: develop
```

### Tipos de commit

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Correccion de bug |
| `style:` | Cambios de CSS/formato (no afecta logica) |
| `ref:` | Refactorizacion de codigo |
| `chore:` | Tareas de mantenimiento |

## Equipos

| Equipo | Responsabilidad | Archivos |
|--------|----------------|----------|
| Front HTML/CSS | Maquetacion de paginas | `front/*.html`, `front/styles.css` |
| Front JavaScript | Logica del cliente | `front/scripts.js` |
| Back Express | API, rutas, auth | `back/server.js`, `back/routes.js`, `back/auth.middleware.js` |
| Back SQL | Base de datos | `back/database.sql`, `back/mysql_conn.js` |
