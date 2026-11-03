# Specification: Módulo Vertical 03 — Multimedia y Boletos Digitales (ms/media-hub)

> **Estado:** APPROVED  
> **Módulo:** `03-media-hub`  
> **Ubicación en Monorepo:** `/ms/media-hub` — *Repositorio Git Autónomo (Monolito Fullstack Unificado)*  
> **Nube Asignada:** Google Cloud Platform (GCP - Levantamiento Estándar con Docker)  
> **Arquitectura:** Monolito Modular Fullstack Unificado (Laravel 11 + Inertia.js + Vue.js 3 Jetstream Stack)  
> **Metodología:** SDD-Spec-Extended (UI/UX Jetstream, Dark Mode First y Gobernanza Estricta)  
> **Gobernanza:** Subordinado a [docs/constitution.md](docs/constitution.md)

---

## 1. Objetivo y Alcance Unificado del Módulo

- **Objetivo de Negocio**: Centralizar la administración de activos multimedia digitales (afiches cinematográficos, trailers en video y banners publicitarios) mediante URLs prefirmadas en MinIO S3, emisión de boletos digitales inmutables con doble código QR (**QR Llave** con firma autónoma HMAC-SHA256 y **QR de Confitería**), gestión y auditoría estricta del canje de productos de Candy Bar en mostrador, y provisión de una consola web reactiva en **un único proyecto monolítico Laravel 11 con Inertia.js y Vue.js 3** para carga interactiva de pósters con límite de 5 MB, generación automática de miniaturas (*thumbnails*), visualizador in-app de entradas sin descarga física a disco local, y dashboards analíticos de asistencia.
- **In-Scope (Proyecto Unificado `ms/media-hub`)**:
  - **Capa Servidor y Servicios Backend (Laravel 11 + MongoDB)**:
    - Laravel 11 (PHP 8.3/8.4) con integración directa de MongoDB mediante driver oficial.
    - Generación de Presigned URLs directas para MinIO S3 (carga y visualización).
    - Pipeline de procesamiento multimedia con **validación estricta de peso (máximo 5 MB)** y generación de miniaturas optimizadas (300x450px) con GD/Imagick.
    - Emisión de Boletos Digitales con doble QR (`INV-BIZ-03`): QR Llave para sala (firmado con HMAC-SHA256) y QR de Candy Bar para mostrador.
    - **Auditoría Estricta de Canje de Confitería**: Registro en MongoDB del ID del cajero responsable, marca de tiempo UTC, ID del pedido y transición irreversible a estado `CANJEADO` con bloqueo atómico contra re-canje o doble canje.
    - Consumo de eventos SAGA en RabbitMQ para generar boletos tras confirmación de pago en taquilla.
    - Endpoint de salud (`/api/health`) para monitoreo del semáforo visual.
  - **Capa de Presentación e Interfaz Reactiva (Inertia.js + Vue.js 3 en `resources/js/`)**:
    - Componentes y vistas Vue.js 3 estructurados bajo Inertia.js en `resources/js/Pages/` y `resources/js/Components/` con Tailwind CSS Dark Mode First (paleta Slate con acento carmesí `#E50914`).
    - Barra de layout con indicador persistente de módulo activo ("Módulo 03: Multimedia & Boletos").
    - **Modal Interactivo `UploadMediaModal`**: Zona de carga *drag & drop* con barra de progreso, validación estricta de tamaño (< 5 MB) y previsualización inmediata.
    - **Terminal de Canje Candy Bar para Cajero (`/pos/candy-scan`)**: Interfaz para que el cajero escanee o ingrese el voucher, con feedback visual de canje exitoso y visualización de la traza de auditoría (completamente transparente para el cliente).
    - **Visualizador de Boletos In-App**: Despliegue en pantalla del boleto digital con ambos códigos QR dinámicos; sin opción de descarga de archivos a disco local.
    - Tablas de activos multimedia con filas intercaladas (zebra striping), botones explícitos de acción y buscador diacrítico multi-atributo.
    - **Puerto Unificado**: Todo el módulo opera en el **puerto HTTP 8080** (`http://localhost:8080/`), sirviendo tanto las vistas web de Inertia como las APIs internas.
- **Out-of-Scope**:
  - Descarga física de boletos en PDF/JPEG a disco local del cliente (`RB-03.4`).
  - Cobros transaccionales de entradas y pagos con tarjeta (delegado a `ms/ticketing-auth`).
  - Configuración matricial de salas y horarios de cartelera (delegado a `ms/cinema-core`).

---

## 2. Sección A: Modelo Conceptual y Reglas de Negocio

### 2.1 Persistencia en MongoDB
- **Colección `digital_tickets`**:
  - `order_id` (String UUID), `showtime_id` (String UUID), `user_id` (String UUID).
  - `access_key_qr`: Token JWT/HMAC firmado con clave secreta compartida para validación offline en sala.
  - `candy_bar_qr`: Código único de voucher de confitería (ej: `CB-VOUCHER-9821`).
  - `media_s3_key`: Clave del boleto generado en MinIO S3 (`tickets/<order_id>.json`).
  - `status`: `EMITIDO`, `USADO`, `EXPIRADA`.
  - `candy_bar_status`: `PENDIENTE`, `CANJEADO`.
  - `candy_redemption_audit`: Subdocumento con `cashier_id`, `redeemed_at_utc` (DateTime), `register_terminal_id`.
- **Colección `media_assets`**:
  - `movie_id` (String UUID), `asset_type` (`POSTER_JPEG`, `TRAILER_MP4`).
  - `s3_key`, `thumbnail_s3_key`, `bucket`, `mime_type`, `size_bytes` (Int <= 5,242,880 bytes).
  - `is_active` (Boolean), `created_at` (DateTime), `updated_at` (DateTime).

### 2.2 Reglas de Negocio (RB)
- **`RB-03.1` (Autonomía del QR Llave)**: El QR de sala contiene un token criptográfico HMAC-SHA256 con fecha de función, sala y butacas, permitiendo que la app móvil lo valide de forma instantánea sin conexión a internet.
- **`RB-03.2` (Separación Estricta de Vouchers)**: El canje de alimentos en el mostrador no invalida la entrada a sala, y el acceso a sala no consume automáticamente la confitería.
- **`RB-03.3` (Auditoría y Bloqueo de Doble Canje)**: Un voucher de confitería solo puede ser canjeado una única vez. Al ser procesado por el cajero, el estado muta de forma atómica a `CANJEADO`, guardando la fecha UTC y el ID del cajero. Intentos posteriores retornan el error `CANDY_ALREADY_REDEEMED`.
- **`RB-03.4` (Límite de Tamaño y Thumbnails)**: Se rechaza cualquier archivo multimedia que supere los 5 MB (`FILE_SIZE_EXCEEDED`). El sistema genera automáticamente una miniatura optimizada de 300x450px para el póster.
- **`RB-03.5` (Inmutabilidad In-System)**: Los boletos generados residen en MinIO y se consumen exclusivamente por visor in-app; no se exponen endpoints públicos para descarga local a disco.

---

## 3. Sección B: Vistas y Experiencia de Usuario (Inertia.js + Vue 3)

### 3.1 Vistas y Rutas Web Unificadas (`http://localhost:8080`)
1. **Consola Multimedia (`http://localhost:8080/admin/media`)**:
   - Renderizada por `MediaAssetController@index` vía `Inertia::render('Media/Index')`.
   - Tabla con diseño cebra (filas intercaladas) listando películas, tipo de activo, tamaño y miniatura.
   - Buscador diacrítico rápido que filtra por título de película y tipo de activo.
   - Botón superior "Nuevo Activo" abre el modal interactivo `UploadMediaModal`.
2. **Modal Interactivo `UploadMediaModal`**:
   - Selector de película asociada y tipo de medio.
   - Zona interactiva de arrastre de archivo (*drag & drop*) con indicador de límite (máximo 5 MB).
   - Previsualización inmediata de imagen y barra de progreso de carga hacia MinIO S3.
   - Botones concisos: "Cancelar" y "Subir Activo".
3. **Módulo de Canje Candy Bar para Cajero (`http://localhost:8080/pos/candy-scan`)**:
   - Renderizado por `TicketController@scanner` vía `Inertia::render('POS/CandyScan')`.
   - Campo de entrada rápido para lectura con escáner de código de barras / QR.
   - Al escanear, consulta el estado del voucher:
     - Si está `PENDIENTE`: marca como `CANJEADO`, emite un banner toast de éxito "Combo Entregado Satisfactoriamente" y registra la auditoría internamente.
     - Si está `CANJEADO`: muestra banner toast de advertencia "Voucher Ya Canjeado" con la hora y fecha del canje previo.
   - El cliente final no percibe mensajes técnicos ni detalles del log de auditoría.
4. **Visor de Boletos In-App**:
   - Modal interactivo `TicketViewerModal` que proyecta en alta fidelidad el QR Llave y el QR de confitería.

---

## 4. Requisitos de UI/UX, Roles y Semillas (/extended)

### 4.1 Requisitos de Experiencia de Usuario
- **`RF-UX-01`**: Interfaz con tema oscuro por defecto y contraste optimizado.
- **`RF-UX-02`**: Barra de layout con indicador del módulo activo ("Módulo 03: Multimedia & Boletos").
- **`RF-UX-03`**: Formulario de carga multimedia en modal interactivo con validación de peso (< 5 MB).
- **`RF-UX-04`**: Tabla cebra de activos con botones explícitos: "Previsualizar", "Copiar Enlace" y "Desactivar".
- **`RF-UX-05`**: Buscador en tiempo real que ignora acentos y mayúsculas.
- **`RF-UX-06`**: Semáforo visual de salud de la API (`/api/health`).
- **`RF-UX-07`**: Notificaciones mediante banners toasts temáticos (`toast-success`, `toast-error`).

### 4.2 Matriz RBAC de Roles y Permisos (Perfiles Excluyentes)
| Acción Operativa | `ROLE_SUPERADMIN` | `ROLE_MANAGER` | `ROLE_CASHIER` | `ROLE_GATEKEEPER` | `ROLE_CUSTOMER` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Subir Multimedia (Modal < 5 MB) | Permitido | Permitido | Denegado | Denegado | Denegado |
| Canjear QR Candy Bar | Permitido | Denegado | Permitido | Denegado | Denegado |
| Ver Auditoría de Canjes | Permitido | Permitido | Denegado | Denegado | Denegado |
| Ver Boleto In-App (Doble QR) | Denegado | Denegado | Denegado | Denegado | Permitido |
| Ver Dashboards de Asistencia | Permitido | Permitido | Denegado | Denegado | Denegado |

### 4.3 Semilla de Datos y Credenciales de Prueba
- **Usuarios Precargados**:
  - `cajero@test.com` / `Password123!` (`ROLE_CASHIER` — Operador de Mostrador y Canje)
  - `operador@test.com` / `Password123!` (`ROLE_MANAGER` — Gerente de Complejo)
  - `admin@test.com` / `Password123!` (`ROLE_SUPERADMIN` — Administrador Global)

### 4.4 Centralización de Variables de Entorno Preconfiguradas (.env.*) [INV-ARCH-09]
Conforme a `INV-ARCH-09`, el módulo cuenta con un único archivo `.env.example` preconfigurado en la raíz del proyecto monolítico:
- **`ms/media-hub/.env.example` / `.env`**:
  - `APP_NAME="CineCenter Media Hub"`
  - `APP_PORT=8080`
  - `APP_URL=http://localhost:8080`
  - `DB_CONNECTION=mongodb`
  - `MONGODB_URI=mongodb://localhost:27017/media_hub`
  - `MINIO_ENDPOINT=http://localhost:9000`
  - `MINIO_ACCESS_KEY=minioadmin`
  - `MINIO_SECRET_KEY=minioadmin`
  - `MINIO_BUCKET=cinema-media`
  - `RABBITMQ_HOST=localhost`
  - `HMAC_QR_SECRET=cinecenter-hmac-shared-key-2026`

---

## 5. Requerimientos Funcionales (Patrón EARS)

- **`HU-01`**: Como Gerente, quiero subir afiches de películas mediante un modal interactivo con validación de peso para asegurar tiempos de carga rápidos.
  - `RF-01.1`: **Event-Driven**: Cuando el usuario seleccione un archivo de imagen en el modal, el sistema verificará que su tamaño no exceda 5 MB antes de generar la URL prefirmada hacia MinIO S3.
  - `RF-01.2`: **Ubiquitous**: El backend generará automáticamente una miniatura (thumbnail) optimizada para cada póster procesado.
- **`HU-02`**: Como Cajero de Candy Bar, quiero validar el QR de confitería de los clientes en mostrador para despachar los productos y evitar duplicidades.
  - `RF-02.1`: **Event-Driven**: Cuando el cajero escanee el QR de confitería, el sistema cambiará el estado a `CANJEADO`, registrará el ID del cajero y la marca de tiempo UTC, y emitirá un toast de confirmación.
  - `RF-02.2`: **Unwanted Behavior**: Si el voucher ya fue entregado previamente, el sistema rechazará la acción informando que el código ya fue utilizado.
- **`HU-03`**: Como Cliente, quiero visualizar mi entrada con ambos códigos QR en pantalla sin que se descarguen archivos a mi teléfono o computadora.
  - `RF-03.1`: **Ubiquitous**: El sistema presentará el boleto en el modal interactivo `TicketViewerModal` proyectando el QR Llave y el QR de confitería.

---

## 6. Criterios de Aceptación (Gherkin BDD de Punta a Punta)

### Escenario 1: Carga exitosa de póster multimedia con validación de peso menor a 5 MB
```gherkin
Given que el Gerente con rol "ROLE_MANAGER" ingresa a la consola "http://localhost:8080/admin/media"
When pulsa el botón "Nuevo Activo"
Then el sistema abre el modal interactivo "UploadMediaModal"
When selecciona la película "Avatar 3" y arrastra una imagen JPEG de 3.2 MB
Then el modal muestra la previsualización y la barra de progreso de carga
When presiona el botón conciso "Subir Activo"
Then el backend Laravel genera la URL prefirmada y procesa la miniatura en MinIO
And la tabla cebra de activos se actualiza mostrando la nueva miniatura
And emite un toast de éxito "Activo multimedia publicado exitosamente"
```

### Escenario 2: Rechazo de archivo que supera el límite de 5 MB
```gherkin
Given que el usuario abre el modal "UploadMediaModal"
When intenta cargar un archivo de póster con un peso de 8.5 MB
Then el validador frontend bloquea la carga inmediata
And muestra un mensaje de error "El archivo excede el tamaño máximo permitido de 5 MB"
And el botón "Subir Activo" permanece deshabilitado
```

### Escenario 3: Canje de voucher de confitería por cajero con registro de auditoría
```gherkin
Given que el usuario "cajero@test.com" con rol "ROLE_CASHIER" se encuentra en "http://localhost:8080/pos/candy-scan"
When escanea el código de voucher "CB-VOUCHER-9821" en estado PENDIENTE
Then el backend Laravel actualiza el estado a "CANJEADO"
And registra en el subdocumento de auditoría el ID del cajero y la fecha actual UTC
And el frontend emite un banner toast de confirmación "Voucher canjeado con éxito: Combo Pipocas entregado"
```

### Escenario 4: Bloqueo de doble canje de confitería
```gherkin
Given que el voucher "CB-VOUCHER-9821" ya fue canjeado previamente
When otro cajero intenta escanear el mismo código en el mostrador
Then el backend Laravel rechaza la operación con el código CANDY_ALREADY_REDEEMED
And el frontend muestra un banner de advertencia "Este voucher ya fue entregado previamente"
And el cliente no recibe ninguna notificación técnica de la incidencia
```
