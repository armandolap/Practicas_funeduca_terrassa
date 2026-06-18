1.- el boton de editar me lleva a la pagina de crear usuario,
    pero no me carga los campos,con los campos vacios ni recuerdo los datos de la persona
    entonces al darle actualizar tendra variacion en campos que no querian variar
2.- la lista de personas (http://localhost:3000/clients.html) aun muestra proyectos pasados,
     en la vista de persona-detalle(http://localhost:3000/client.html?id=14 :id ) 
    es donde ahora sale activo en vez de tots
PROMPT:
### Bugs detectados tras última iteración del agente
Se han identificado dos problemas funcionales que deben corregirse sin modificar el resto del sistema.
---
## 1. Edición de persona no carga datos correctamente
### Problema
El botón de editar en la lista de personas redirige correctamente a la página de creación/edición de usuario, pero **no carga los datos existentes de la persona**.
Esto provoca que:
* Los campos aparecen vacíos.
* El usuario no puede saber qué datos está modificando.
* Al guardar, se pueden sobrescribir campos existentes con valores vacíos.
### Comportamiento esperado
* Al pulsar "Editar" sobre una persona:
  * Debe abrir la misma vista de creación de persona.
  * Debe recibir el `id` de la persona.
  * Debe cargar los datos desde backend antes de renderizar o al iniciar el formulario.
  * Debe rellenar todos los campos con los valores existentes.
* El usuario puede editar y guardar solo los campos que desee.
---
## 2. Inconsistencia en vista de proyectos en personas
### Problema
Existe una incoherencia en cómo se muestran los proyectos según la vista:
* En la lista de personas (`clients.html`):
  * Se están mostrando proyectos pasados/cerrados cuando no deberían aparecer en ese listado.
* En la vista de detalle de persona (`client.html?id=14`):
  * El comportamiento es correcto.
  * Existe un filtro por defecto llamado **"tots" (todos)** que debe mostrar:
    * Proyectos activos
    * Proyectos futuros
    * Proyectos pasados/cerrados
### Comportamiento esperado (CORRECTO)
* En `client.html`:
  * El estado por defecto debe ser **"tots"**.
  * "tots" debe mostrar TODOS los proyectos (activos, futuros y pasados).
  * Los botones/filtros existentes deben permitir filtrar por estado (activos, futuros, cerrados, etc.) como ya está implementado.
* En `clients.html`:
  * Debe revisarse el comportamiento actual porque está mostrando proyectos donde no debería (posible mezcla de lógica con detalle de persona).
  * La vista de listado debe tener su propio criterio de visualización independiente del detalle.
### Acción requerida
* Separar claramente la lógica de:
  * Vista de listado de personas (`clients.html`)
  * Vista de detalle de persona (`client.html`)
* Asegurar que el filtro "tots" del detalle funcione como “sin filtro” (todos los proyectos).
---
## Prioridad
1. Corrección del cargado de datos en edición de persona (crítico).
2. Corrección de consistencia de vistas de proyectos (evitar mezcla de lógica entre listado y detalle).
---
## Nota general
No introducir nuevas pantallas ni refactorizaciones grandes. Solo corregir lógica existente y reutilizar funciones actuales cuando sea posible.