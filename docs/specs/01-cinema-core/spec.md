# Specification: Módulo Vertical 01 — Cinema Core y Portal de Administración Unificado (ms/cinema-core)

> **Estado:** APPROVED  
> **Módulo:** `01-cinema-core`  
> **Ubicación en Monorepo:** `/ms/cinema-core` (`backend/` y `frontend/`) — *Repositorio Git Autónomo*  
> **Nube Asignada:** Microsoft Azure (Levantamiento Estándar con Docker)  
> **Arquitectura:** Módulo Autónomo Vertical (Backend NestJS + Frontend Angular Portal de Administración)  
> **Rol en el Ecosistema:** **Portal de Administración Completo del Cine (`http://localhost:4200/admin`)**  
> **Metodología:** SDD-Spec-Extended (UI/UX Jetstream, Dark Mode First y Gobernanza Estricta)  
> **Gobernanza:** Subordinado a [docs/constitution.md](docs/constitution.md)

---

## 1. Objetivo y Alcance del Módulo

- **Objetivo de Negocio**: Centralizar la administración integral, operativa, de cartelera y analítica del complejo de cines mediante una **Interfaz Completa y Unificada de Administración (`http://localhost:4200/admin`)** para gerentes y administradores. Desde un solo software amigable (sin consolas técnicas ni herramientas desconectadas), el administrador puede:
  1. Monitorear el **Dashboard Ejecutivo** con métricas clave en tiempo real.
  2. Gestionar **Salas** con diseño matricial guiado celda por celda (`CreateHallModal`).
  3. Gestionar **Películas** con catálogo completo, borrado lógico (`deleted_at`), subida directa de póster integrada (a MinIO vía `media-hub`) y recepción de la clasificación predictiva de género por IA (`ai-mcp`).
  4. Programar la **Cartelera Semanal** con bloqueo estricto ante solapamientos de horario (+20 min de limpieza).
  5. Consultar el **Centro de Reportes Inteligentes (IA)** con una interfaz ejecutiva moderna: reportes rápidos en un clic, asistente conversacional amigable por texto o voz (Web Audio API), previsualización comprensible y descarga inmediata de libros corporativos en Microsoft Excel (`.xlsx`), respaldado por el microservicio headless `ms/ai-mcp`.
- **In-Scope**:
  - **Backend (`ms/cinema-core/backend`)**:
    - NestJS 10 (TypeScript) bajo Clean Architecture en el **puerto HTTP 3002**.
    - Exposición exclusiva de API GraphQL mediante Apollo Server (`/graphql`) para consultas relacionales y mutaciones tipadas.
    - Persistencia relacional en PostgreSQL con claves foráneas `RESTRICT`, índices de cartelera y borrado lógico (`deleted_at`).
    - Verificación algorítmica de no solapamiento de funciones (`[inicio, fin + 20 min de limpieza]`).
    - Consumo de eventos SAGA en RabbitMQ para transición atómica de asientos de libre a ocupado.
    - Endpoint de salud (`/health`) para monitoreo del semáforo visual.
  - **Frontend (`ms/cinema-core/frontend` - Puerto 4200)**:
    - Aplicación web construida en Angular 17 (TypeScript) con Apollo Client y diseño Dark Mode First (paleta Slate con acento carmesí `#E50914`).
    - **Portal de Administración Unificado (`/admin/*`)**:
      - Sidebar lateral fijo con acceso rápido a todas las secciones:
        - `Dashboard`: Tarjetas KPI de recaudación, funciones y ocupación.
        - `Salas`: Tabla cebra de salas y modal interactivo matricial `CreateHallModal`.
        - `Películas`: Catálogo con buscador diacrítico y modal de creación con subida de póster integrada.
        - `Cartelera`: Calendario semanal con detección visual de colisiones en rojo.
        - `Centro de Reportes IA`: Interfaz amigable para solicitar y descargar reportes en Excel.
      - Barra superior persistente con avatar, nombre de usuario, conmutador de tema (Dark/Light) y botón conciso "Cerrar Sesión".
    - **Contenerización Soberana**: Archivo `ms/cinema-core/docker-compose.yml` que levanta PostgreSQL local y los contenedores de backend y frontend de manera aislada.
- **Out-of-Scope**:
  - Portal de compras de clientes (alojado en `ms/ticketing-auth/frontend` en `http://localhost:3000/`).
  - Terminal de canje de confitería para cajeros (alojado en `ms/media-hub` en `http://localhost:8080/pos/candy-scan`).

---

## 2. Sección A: Especificación de Backend (`ms/cinema-core/backend` - Puerto 3002)

### 2.1 Modelo Conceptual de Datos y Persistencia Relacional
- **Complejo (`Complex`)**: `id` (UUID), `name` (String, Requerido), `address` (String), `city` (String), `is_active` (Boolean), `created_at` (DateTime), `updated_at` (DateTime).
- **Sala (`CinemaHall`)**: `id` (UUID), `complex_id` (UUID FK), `hall_number` (Int), `name` (String), `hall_type` (`2D`, `3D`, `CXC`, `VIP`), `total_capacity` (Int), `is_active` (Boolean), `created_at` (DateTime), `updated_at` (DateTime).
- **Butaca (`Seat`)**: `id` (UUID), `hall_id` (UUID FK), `row_letter` (String `A`-`Z`), `seat_number` (Int), `category` (`ESTANDAR`, `VIP`, `ACCESIBLE`), `status` (`LIBRE`, `OCUPADA`, `MANTENIMIENTO`), `is_active` (Boolean).
- **Película (`Movie`)**: `id` (UUID), `title` (String), `synopsis` (Text), `duration_minutes` (Int > 0), `rating` (`APT`, `P-13`, `R`), `genre` (String), `poster_url` (String Nullable), `is_active` (Boolean), `deleted_at` (DateTime Nullable), `created_at` (DateTime), `updated_at` (DateTime).
- **Función (`Showtime`)**: `id` (UUID), `movie_id` (UUID FK), `hall_id` (UUID FK), `start_utc` (DateTime ISO-8601), `end_utc` (DateTime ISO-8601), `base_price_cents` (Int > 0), `status` (`PROGRAMADA`, `EN_VENTA`, `INICIADA`, `FINALIZADA`, `CANCELADA`), `created_at` (DateTime), `updated_at` (DateTime).

### 2.2 Reglas de Negocio del Backend (RB)
- **`RB-01.1` (Prevención Estricta de Solapamientos)**: Ninguna función puede crearse si el rango `[start_utc, end_utc + 20 min]` colisiona con otra función en la misma sala. El backend rechaza la mutación emitiendo el código de error `SHOWTIME_SCHEDULE_CONFLICT` sin ofrecer sugerencias automáticas.
- **`RB-01.2` (Inmutabilidad de Asientos Vendidos)**: Toda butaca marcada como `OCUPADA` por un evento de compra confirmado por la SAGA no puede ser reasignada ni modificada.
- **`RB-01.3` (Butacas en Mantenimiento)**: Asientos marcados como `MANTENIMIENTO` se excluyen de la consulta pública de disponibilidad de cartelera.
- **`RB-01.4` (Integridad y Soft-Delete de Películas)**: Las películas utilizan borrado lógico (`deleted_at: DateTime`, `is_active: false`); las claves foráneas hacia funciones tienen política `ON DELETE RESTRICT`. No se permite eliminar físicamente registros de la base de datos.

---

## 3. Sección B: Interfaz Completa de Administración (`http://localhost:4200/admin`)

### 3.1 Estructura y Navegación del Portal de Admin
1. **Inicio de Sesión Administrativo (`http://localhost:4200/login`)**:
   - Acceso exclusivo para Gerente (`operador@test.com`) y Superadministrador (`admin@test.com`).
   - Semáforo de salud de backend (badge verde/rojo).
2. **Dashboard Ejecutivo (`http://localhost:4200/admin/dashboard`)**:
   - Tarjetas de KPIs clave: Recaudación acumulada, Entradas vendidas hoy, Ocupación promedio y Funciones activas.
   - Gráfico de tendencia semanal y accesos directos a programar función o generar reporte.
3. **Gestión de Salas (`http://localhost:4200/admin/halls`)**:
   - Tabla con filas intercaladas (zebra striping) con columnas: Complejo, Número, Nombre, Tipología, Capacidad y Estado.
   - Botón "Nueva Sala" abre el modal interactivo `CreateHallModal` (filas A-Z, columnas 1-N y alternancia interactiva de celdas).
4. **Catálogo de Películas & Multimedia (`http://localhost:4200/admin/movies`)**:
   - Tabla cebra con póster en miniatura, título, género, duración y acciones (Editar, Soft-Delete con `ConfirmationModal`).
   - Botón "Nueva Película" abre el modal `CreateMovieModal`:
     - Datos generales: título, sinopsis, duración, clasificación y género.
     - **Zona de subida de póster integrada**: Carga directa de archivo JPEG (< 5 MB), previsualización inmediata y obtención automática de sugerencias de género por IA (`ms/ai-mcp`).
5. **Programador de Cartelera Semanal (`http://localhost:4200/admin/schedule`)**:
   - Vista semanal interactiva por complejo y sala.
   - Detección de colisiones: borde rojo en el bloque y banner toast explicativo con el buffer de 20 min de limpieza.
6. **Centro de Reportes Inteligentes (`http://localhost:4200/admin/reports`)**:
   - **Barra de Filtros Globales**:
     - Selector de Complejo Cinematográfico (con opción "Todos los Complejos").
     - Selector de Rango de Fechas (DateRange Picker: "Últimos 7 días", "Este mes", "Personalizado").
     - Los filtros globales inyectan automáticamente el contexto temporal y geográfico a todas las consultas y exportaciones.
   - **Tarjetas de Reporte Rápido (1 Clic)**:
     - "Recaudación del Período" (desglose por taquilla y confitería).
     - "Ocupación por Sala" (porcentaje de aforo por función).
     - "Predicción de Demanda" (estimación de butacas con Machine Learning).
   - **Asistente de Lenguaje Natural**:
     - Barra de texto conversacional y botón de micrófono (Web Audio API) para dictar consultas (ej: *"¿Cuál fue la función más taquillera en Ventura Mall?"*).
     - Tarjeta modal amigable de confirmación previa ("Entendí que deseas consultar: ...") con botones "Generar Reporte" y "Editar".
   - **Presentación de Resultados y Estado Orientativo**:
     - Renderizado de tabla cebra con totales destacados e indicadores monetarios en bolivianos.
     - Botón prominente de acción: **"Descargar Reporte en Excel (.xlsx)"** para obtener el archivo corporativo formateado.
     - En caso de consultas sin datos o fuera de dominio, se despliega una tarjeta de orientación amable con sugerencias de preguntas frecuentes operativas (sin alertas rojas ni errores técnicos).

---

## 4. Requisitos de UI/UX, Roles y Semillas (/extended)

### 4.1 Requisitos de Experiencia de Usuario
- **`RF-UX-01`**: Tema oscuro por defecto (Dark Mode First) en toda la consola de administración.
- **`RF-UX-02`**: Sidebar lateral de navegación unificada y barra superior con botón persistente "Volver a Cartelera / Portal Público" (`http://localhost:3000/`) para garantizar la cohesión del ecosistema como un solo software.
- **`RF-UX-03`**: Formulario interactivo matricial para diseño de salas.
- **`RF-UX-04`**: Subida de póster multimedia integrada dentro de la creación de películas.
- **`RF-UX-05`**: Centro de reportes con interfaz ejecutiva amigable (sin pantallas técnicas ni consolas de comandos).
- **`RF-UX-06`**: Banners toasts temáticos (`toast-success`, `toast-error`).
- **`RF-UX-07`**: Recepción automática del token JWT vía query param `?auth_token=` o almacenamiento de sesión tras la redirección desde el portal de login centralizado en el puerto 3000.

### 4.2 Matriz RBAC de Roles y Permisos (Perfiles Excluyentes)
| Acción Operativa | `ROLE_SUPERADMIN` | `ROLE_MANAGER` | `ROLE_CASHIER` | `ROLE_GATEKEEPER` | `ROLE_CUSTOMER` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Acceder al Portal Admin (`/admin/*`) | Permitido | Permitido | Denegado | Denegado | Denegado |
| Gestionar Salas y Matrices | Permitido | Permitido | Denegado | Denegado | Denegado |
| Crear Películas con Póster | Permitido | Permitido | Denegado | Denegado | Denegado |
| Programar Cartelera Semanal | Permitido | Permitido | Denegado | Denegado | Denegado |
| Consultar y Descargar Reportes IA | Permitido | Permitido | Denegado | Denegado | Denegado |

### 4.3 Variables de Entorno Preconfiguradas (.env.*) [INV-ARCH-09]
- **Backend (`ms/cinema-core/backend/.env.example` / `.env`)**:
  - `PORT=3002`
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cinema_db`
  - `RABBITMQ_URL=amqp://guest:guest@localhost:5672`
  - `JWT_SECRET=cinema-core-secret-key-superadmin-test-2026`
  - `AI_MCP_URL=http://localhost:8001`
  - `MEDIA_HUB_URL=http://localhost:8080`
- **Frontend (`ms/cinema-core/frontend/.env.example` / `environment.ts`)**:
  - `GRAPHQL_ENDPOINT=http://localhost:3002/graphql`
  - `BACKEND_HEALTH_URL=http://localhost:3002/health`
  - `AI_REPORTS_URL=http://localhost:8001/api/mcp`
  - `DEFAULT_THEME=dark`

---

## 5. Requerimientos Funcionales (Patrón EARS)

- **`HU-01`**: Como Gerente, quiero acceder al Portal de Administración en un solo entorno unificado para gestionar todo el complejo cinematográfico.
  - `RF-01.1`: **Ubiquitous**: El sistema proveerá en `/admin/*` un sidebar unificado con acceso a Dashboard, Salas, Películas, Cartelera y Centro de Reportes.
- **`HU-02`**: Como Gerente, quiero crear una película y cargar su póster directamente en el mismo formulario para que quede publicada con su imagen y análisis de género.
  - `RF-02.1`: **Event-Driven**: Al subir el archivo en el modal de película, el sistema lo remitirá a MinIO a través de `media-hub` y solicitará las etiquetas predictivas a `ai-mcp`.
- **`HU-03`**: Como Gerente, quiero consultar reportes analíticos mediante tarjetas directas o lenguaje natural amigable y descargar el libro Excel correspondiente.
  - `RF-03.1`: **Event-Driven**: Al dictar o presionar una tarjeta de reporte, el sistema mostrará la confirmación previa, renderizará la tabla cebra y habilitará el botón "Descargar Reporte en Excel (.xlsx)".

---

## 6. Criterios de Aceptación (Gherkin BDD de Punta a Punta)

### Escenario 1: Flujo completo de administración en el Portal Unificado
```gherkin
Given que el usuario "operador@test.com" con rol "ROLE_MANAGER" inicia sesión en "http://localhost:4200/login"
Then el sistema lo redirige al Dashboard Ejecutivo en "http://localhost:4200/admin/dashboard"
And visualiza el sidebar de navegación con las opciones: Salas, Películas, Cartelera y Reportes
And el semáforo visual muestra punto verde "Servicios Conectados"
```

### Escenario 2: Creación de película con carga de póster integrada
```gherkin
Given que el Gerente se encuentra en "http://localhost:4200/admin/movies"
When presiona el botón "Nueva Película"
Then se despliega el modal interactivo "CreateMovieModal"
When completa los datos y arrastra un póster JPEG de 2.5 MB en la zona de subida integrada
Then el sistema previsualiza el póster y muestra las etiquetas predictivas sugeridas por IA
When presiona "Guardar Película"
Then la película queda registrada atómicamente con su imagen vinculada
And emite un toast de éxito "Película creada exitosamente"
```

### Escenario 3: Generación amigable de reporte y descarga en Excel
```gherkin
Given que el Gerente se encuentra en el Centro de Reportes en "http://localhost:4200/admin/reports"
When hace clic en la tarjeta de reporte rápido "Recaudación Semanal"
Then el sistema despliega la tarjeta de previa amigable confirmando los parámetros
When presiona "Generar Reporte"
Then el frontend invoca al servicio "ms/ai-mcp" en segundo plano
And renderiza en pantalla la tabla cebra con los totales de taquilla y confitería
And muestra activo el botón "Descargar Reporte en Excel (.xlsx)"
When presiona "Descargar Reporte en Excel (.xlsx)"
Then el navegador inicia la descarga inmediata del archivo ".xlsx" corporativo
```
