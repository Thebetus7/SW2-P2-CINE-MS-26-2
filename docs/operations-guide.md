# Guía Operativa Centralizada del Ecosistema CineCenter (docs/operations-guide.md)

> **Versión:** 1.4.0  
> **Metodología:** SDD-Extended (Principio 13 — Documentación Modular Centralizada & Invariante INV-ARCH-09)  
> **Público Objetivo:** Jurado Evaluador, Desarrolladores, Operadores y Administradores

---

## ⚡ 1. Flujo de Evaluación Rápida de 5 Minutos (Para Jurado y Demostración)

Esta guía permite al tribunal o evaluador comprobar el funcionamiento integral de la plataforma de punta a punta en **5 minutos**, recorriendo los 5 módulos verticales autónomos ubicados en `ms/` sin fricciones:

```mermaid
flowchart LR
    P1["1. Welcome Cartelera<br/>(React :3000 /)"] --> P2["2. Login Cliente<br/>(React :3000 /login)"]
    P2 --> P3["3. Compra Butacas & Stripe<br/>(React :3000 /cartelera)"]
    P3 --> P4["4. Mis Tickets QR<br/>(React :3000 /mis-tickets)"]
    P4 --> P5["5. ERP Gerente Salas<br/>(Angular :4200 /erp/*)"]
    P5 --> P6["6. Escaneo Portero HMAC<br/>(App Móvil ms/mobile-app)"]
```

### Paso a Paso de la Prueba de 5 Minutos:

1. **Paso 1: Explorar la Cartelera Pública en la URL Principal (Módulo 02 - React `http://localhost:3000/`)**
   - Ingresar a la URL principal `http://localhost:3000/` como visitante sin autenticación.
   - Explorar las películas en cartelera, sinopsis y horarios de funciones.
   - Observar el indicador de estado de conexión al backend Spring Boot (`http://localhost:8082`).

2. **Paso 2: Iniciar Sesión de Cliente (Módulo 02 - React `http://localhost:3000/login`)**
   - Presionar "Comprar Boletos" en una función o hacer clic en "Iniciar Sesión" en la barra superior: el sistema redirige automáticamente a `/login`.
   - Iniciar sesión con `cliente@test.com` / `Password123!` (`ROLE_CUSTOMER`).
   - El sistema autentica y redirige de vuelta a la cartelera en modo autenticado para continuar la compra de la función seleccionada.

3. **Paso 3: Selección de Butacas, Bloqueo de 60s y Checkout Stripe (Módulo 02 - React `http://localhost:3000/cartelera`)**
   - Seleccionar 2 butacas en el mapa de sala: verificar la activación del **temporizador circular regresivo de 60 segundos** respaldado por DynamoDB local.
   - Añadir productos de confitería (Candy Bar) al carrito unificado.
   - Procesar el pago con Stripe Sandbox utilizando la tarjeta de prueba `4242...`.

4. **Paso 4: Visualizar Boletos en Billetera Web (Módulo 02 - React `http://localhost:3000/mis-tickets`)**
   - Acceder a **Mis Tickets** en el portal de cliente.
   - Abrir el boleto recién comprado y comprobar en pantalla los dos códigos QR:
     - **QR Llave**: Para acceso a la sala.
     - **QR de Confitería**: Para canje en el mostrador del Candy Bar.

5. **Paso 5: Administrar Complejo y Salas como Gerente (Módulo 01 - Angular `http://localhost:4200/erp`)**
   - En una pestaña separada, acceder al ERP Administrativo en `http://localhost:4200/`.
   - Iniciar sesión con `operador@test.com` / `Password123!` (`ROLE_MANAGER`).
   - Ir a **Salas** (`/erp/halls`), abrir `CreateHallModal`, definir cuadrícula interactiva (A-D, 1-8) y guardar en PostgreSQL (Backend NestJS en `http://localhost:3002/graphql`).
   - Ir a **Cartelera** (`/erp/schedule`), agendar una función comprobando la detección visual de colisiones con buffer de 20 min de limpieza.

6. **Paso 6: Validación Offline en Puerta (Módulo 05 - Flutter `ms/mobile-app`)**
   - Iniciar sesión en la app móvil con `portero@test.com` / `Password123!` (`ROLE_GATEKEEPER`).
   - La app abre directamente la cámara de escaneo.
   - Escanear el QR Llave del cliente: verificar la confirmación inmediata *"Acceso Permitido — Sala X"* validada con firma HMAC local en SQLite sin conexión a internet.

---

## 📋 2. Fichas Técnicas Operativas por Módulo Autónomo (100% en `ms/`)

---

### Módulo 01: Cinema Core ERP (`ms/cinema-core`) [Azure / Repo Propio]

- **Propósito**: ERP de backoffice exclusivo para administradores y gerentes. Gestión de complejos, diseño matricial de salas, programación de funciones con detección de colisiones, y reportes analíticos asistidos por voz.
- **Archivos de Contenedorización Soberana**:
  - `ms/cinema-core/docker-compose.yml`: Levanta contenedor de PostgreSQL y servicios del módulo 01 de forma aislada.
  - `ms/cinema-core/backend/Dockerfile` y `ms/cinema-core/frontend/Dockerfile`.
- **Archivos de Entorno y Credenciales Preconfiguradas (`.env.*`) [INV-ARCH-09]**:
  - `ms/cinema-core/backend/.env.example` / `.env`: `PORT=3002`, `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cinema_db`, `RABBITMQ_URL=amqp://guest:guest@localhost:5672`, `JWT_SECRET=cinema-core-secret-key-superadmin-test-2026`, `AI_MCP_URL=http://localhost:8001`.
  - `ms/cinema-core/frontend/.env.example`: `GRAPHQL_ENDPOINT=http://localhost:3002/graphql`, `BACKEND_HEALTH_URL=http://localhost:3002/health`, `DEFAULT_THEME=dark`.
- **Rutas y URLs Asociadas**:
  - `http://localhost:4200/`: Redirección a login de ERP para personal administrativo.
  - `http://localhost:4200/login`: Inicio de sesión de Gerentes y Administradores.
  - `http://localhost:4200/erp/halls`: Gestión de salas y cuadrículas físicas de butacas.
  - `http://localhost:4200/erp/schedule`: Programador semanal de cartelera con detección de colisiones.
  - `http://localhost:4200/erp/movies`: Catálogo de películas con buscador diacrítico y soft-delete.
  - `http://localhost:4200/erp/ai-reports`: Consola de reportes por voz y descarga de Excel.
  - `http://localhost:3002/graphql`: Endpoint GraphQL Apollo Server del backend NestJS.
  - `http://localhost:3002/health`: Endpoint REST de salud del backend.
- **Roles y Credenciales de Prueba**:
  - **Gerente de Complejo**: `operador@test.com` / `Password123!` (`ROLE_MANAGER`).
  - **Superadministrador**: `admin@test.com` / `Password123!` (`ROLE_SUPERADMIN`).

---

### Módulo 02: Portal de Cliente, Taquilla y Autenticación (`ms/ticketing-auth`) [AWS / Repo Propio]

- **Propósito**: **Punto de Entrada y URL Principal del Ecosistema para Clientes (`http://localhost:3000/`)**. Portal público de cartelera, autenticación SSO centralizada, bloqueo transitorio de butacas con TTL estricto de 60 segundos en DynamoDB, cobro unificado en Stripe Sandbox y billetera web de tickets.
- **Archivos de Contenedorización Soberana**:
  - `ms/ticketing-auth/docker-compose.yml`: Levanta DynamoDB Local, RabbitMQ local y contenedores de backend/frontend de forma aislada.
  - `ms/ticketing-auth/backend/Dockerfile` y `ms/ticketing-auth/frontend/Dockerfile`.
- **Archivos de Entorno y Credenciales Preconfiguradas (`.env.*`) [INV-ARCH-09]**:
  - `ms/ticketing-auth/backend/.env.example` / `application.yml`: `SERVER_PORT=8082`, `DYNAMODB_ENDPOINT=http://localhost:8000`, `RABBITMQ_HOST=localhost`, `STRIPE_API_KEY=sk_test_51MockStripeKeyForTesting2026`, `SEAT_HOLD_TTL_SECONDS=60`.
  - `ms/ticketing-auth/frontend/.env.example`: `PORT=3000`, `VITE_API_BASE_URL=http://localhost:8082`, `VITE_STRIPE_PUBLIC_KEY=pk_test_51MockStripePublishableKey2026`, `VITE_BACKEND_HEALTH_URL=http://localhost:8082/api/v1/health`.
- **Rutas y URLs Asociadas (Flujo de Cliente)**:
  - `http://localhost:3000/`: **URL Principal / Welcome**. Muestra la Cartelera Pública interactiva abierta a visitantes.
  - `http://localhost:3000/login`: Pantalla de inicio de sesión de clientes con redirección inteligente al flujo previo.
  - `http://localhost:3000/cartelera`: Cartelera en modo autenticado con selección interactiva de butacas y temporizador regresivo de 60 segundos.
  - `http://localhost:3000/checkout`: Carrito unificado (entradas + confitería) y pasarela Stripe Elements.
  - `http://localhost:3000/mis-tickets`: Billetera web del cliente con visualización de boletos y doble código QR.
  - `http://localhost:8082/api/v1/health`: Endpoint REST de salud del backend Spring Boot.
  - `http://localhost:8082/api/v1/holds`: Endpoint de retención temporal de butacas (TTL 60s).
  - `http://localhost:8082/api/v1/orders/checkout`: Endpoint de procesamiento idempotente con Stripe.
- **Roles y Credenciales de Prueba**:
  - **Cliente Final**: `cliente@test.com` / `Password123!` (`ROLE_CUSTOMER`).
  - **Cajero de Taquilla**: `cajero@test.com` / `Password123!` (`ROLE_CASHIER`).
  - **Superadministrador**: `admin@test.com` / `Password123!` (`ROLE_SUPERADMIN`).

---

### Módulo 03: Multimedia y Boletos Digitales (`ms/media-hub`) [GCP / Repo Propio]

- **Propósito**: Monolito modular fullstack unificado en Laravel 11 + Inertia.js + Vue.js 3 en el puerto `8080`. Centraliza la administración de afiches y trailers en MinIO S3 con límite de 5 MB, emisión de boletos digitales con firma criptográfica HMAC-SHA256, y terminal POS de canje de confitería para cajeros con auditoría estricta.
- **Archivos de Contenedorización Soberana**:
  - `ms/media-hub/docker-compose.yml`: Levanta MongoDB, MinIO y el contenedor de Laravel monolítico en el puerto 8080.
  - `ms/media-hub/Dockerfile`: Multi-stage Dockerfile (PHP 8.3 + Node 20 para compilación de assets Inertia con Vite).
- **Archivos de Entorno y Credenciales Preconfiguradas (`.env.*`) [INV-ARCH-09]**:
  - `ms/media-hub/.env.example` / `.env`: `APP_NAME="CineCenter Media Hub"`, `APP_PORT=8080`, `APP_URL=http://localhost:8080`, `DB_CONNECTION=mongodb`, `MONGODB_URI=mongodb://localhost:27017/media_hub`, `MINIO_ENDPOINT=http://localhost:9000`, `MINIO_ACCESS_KEY=minioadmin`, `MINIO_SECRET_KEY=minioadmin`, `MINIO_BUCKET=cinema-media`, `RABBITMQ_HOST=localhost`, `HMAC_QR_SECRET=cinecenter-hmac-shared-key-2026`.
- **Rutas y URLs Asociadas (Puerto 8080 Unificado)**:
  - `http://localhost:8080/admin/media`: Consola de gestión multimedia con subida drag & drop y presigned URLs (Inertia).
  - `http://localhost:8080/pos/candy-scan`: Terminal de canje rápido de confitería para cajeros (Inertia).
  - `http://localhost:8080/api/health`: Endpoint REST de salud del monolito.
  - `http://localhost:8080/api/v1/candy/redeem`: Endpoint atómico de validación y canje de vouchers.
- **Roles y Credenciales de Prueba**:
  - **Cajero de Candy Bar**: `cajero@test.com` / `Password123!` (`ROLE_CASHIER`).
  - **Gerente de Complejo**: `operador@test.com` / `Password123!` (`ROLE_MANAGER`).

---

### Módulo 04: Servicio de Inteligencia Artificial y Servidor MCP (`ms/ai-mcp`) [GCP / Repo Propio]

- **Propósito**: Microservicio cognitivo headless en Python 3.11 (FastAPI, Puerto `8001`) compatible con Model Context Protocol (MCP). Provee clasificación visual de afiches JPEG con TensorFlow, inferencia predictiva de demanda de funciones con Scikit-Learn, y ensamblado de reportes en libros Excel (.xlsx) con OpenPyXL.
- **Consumo**: **Servicio Headless sin interfaz web propia**. Sus capacidades son consumidas directamente por el **Portal de Administración Unificado** (`http://localhost:4200/admin/reports` y `/admin/movies`).
- **Archivos de Contenedorización Soberana**:
  - `ms/ai-mcp/docker-compose.yml`: Levanta el contenedor de FastAPI MCP en el puerto `8001` de forma aislada.
  - `ms/ai-mcp/Dockerfile`: Contenedor Python 3.11-slim con dependencias de machine learning.
- **Archivos de Entorno y Credenciales Preconfiguradas (`.env.*`) [INV-ARCH-09]**:
  - `ms/ai-mcp/.env.example` / `.env`: `API_PORT=8001`, `MINIO_ENDPOINT=http://localhost:9000`, `MINIO_ACCESS_KEY=minioadmin`, `MINIO_SECRET_KEY=minioadmin`, `MINIO_BUCKET=cinema-media`, `MODEL_WEIGHTS_PATH=app/ml/weights/poster_cnn.h5`, `ENVIRONMENT=development`.
- **Rutas y URLs Asociadas**:
  - `http://localhost:8001/docs`: Documentación interactiva OpenAPI / Swagger del servidor MCP.
  - `http://localhost:8001/health`: Endpoint de salud para semáforo visual.
  - `http://localhost:8001/api/mcp/execute-prompt`: Ejecución de herramientas analíticas tipadas.
  - `http://localhost:8001/api/reports/download-excel`: Descarga directa de archivos Excel formateados.
- **Roles y Credenciales de Prueba**:
  - Consumo transparente para roles `ROLE_MANAGER` y `ROLE_SUPERADMIN` desde el Portal de Admin.

---

### Módulo 05: Aplicación Móvil Flutter (`ms/mobile-app`) [Independiente / Repo Propio]

- **Propósito**: Aplicación móvil multiplataforma Offline-First en `ms/mobile-app`, enrutamiento condicional por rol excluyente, visualización de boletos con doble código QR (QR Llave y QR Confitería) para clientes, y escáner directo de cámara para porteros con validación local HMAC-SHA256 sin internet.
- **Archivos de Configuración y Entorno (`.env.*`) [INV-ARCH-09]**:
  - `ms/mobile-app/.env.example` / `assets/config/env.json`: `AUTH_API_BASE_URL=http://10.0.2.2:8082`, `MEDIA_HUB_API_URL=http://10.0.2.2:8080`, `CINEMA_CORE_GRAPHQL_URL=http://10.0.2.2:3002/graphql`, `HMAC_SHARED_SECRET=cinecenter-hmac-shared-key-2026`, `OFFLINE_SYNC_INTERVAL_SECONDS=30`, `DEFAULT_THEME=dark`.
- **Rutas y Vistas Móviles**:
  - `/login`: Pantalla de inicio de sesión móvil con semáforo de salud de backend.
  - `/customer/layout`: Layout principal de cliente con Bottom Navigation Bar fija:
    - Pestaña 1: **Cartelera** (vista inicial con horarios y sinopsis sincronizada en SQLite local).
    - Pestaña 2: **Mis Boletos** (billetera digital in-app con proyección de doble QR en pantalla sin descarga física).
    - Pestaña 3: **Confitería** (catálogo de combos disponibles).
    - Pestaña 4: **Configuración** (perfil, modo oscuro y cerrar sesión).
  - `/gate-scanner`: Pantalla de escaneo directo con cámara exclusiva para `ROLE_GATEKEEPER` con contador de aforo.
- **Roles y Credenciales de Prueba**:
  - **Portero / Validador**: `portero@test.com` / `Password123!` (`ROLE_GATEKEEPER`).
  - **Cliente Billetera**: `cliente@test.com` / `Password123!` (`ROLE_CUSTOMER`).

---

## 🛠️ 3. Comandos de Levantamiento por Módulo (Descentralización Docker)

Queda **terminantemente prohibido** ejecutar un `docker compose` en la raíz. Cada módulo se levanta de forma soberana dentro de su propia carpeta:

```bash
# -------------------------------------------------------------------
# 1. MÓDULO 01: Cinema Core ERP (PostgreSQL + NestJS + Angular)
# -------------------------------------------------------------------
cd ms/cinema-core
docker compose up -d
# Frontend ERP accesible en: http://localhost:4200
# Backend GraphQL accesible en: http://localhost:3002/graphql

# -------------------------------------------------------------------
# 2. MÓDULO 02: URL Principal y Taquilla (DynamoDB + RabbitMQ + Spring Boot + React)
# -------------------------------------------------------------------
cd ms/ticketing-auth
docker compose up -d
# URL Principal (Portal Cliente) accesible en: http://localhost:3000
# Backend Auth/Taquilla accesible en: http://localhost:8082

# -------------------------------------------------------------------
# 3. MÓDULO 03: Media Hub (Monolito Laravel 11 + Inertia + Vue 3)
# -------------------------------------------------------------------
cd ms/media-hub
docker compose up -d
# Monolito Fullstack accesible en: http://localhost:8080
# Consola Multimedia: http://localhost:8080/admin/media
# Terminal de Canje POS: http://localhost:8080/pos/candy-scan

# -------------------------------------------------------------------
# 4. MÓDULO 04: AI MCP Server (Servicio Headless FastAPI :8001)
# -------------------------------------------------------------------
cd ms/ai-mcp
docker compose up -d
# Servidor MCP Headless accesible en: http://localhost:8001/docs
# (Consumido de forma transparente por el Portal de Admin en http://localhost:4200)

# -------------------------------------------------------------------
# 5. MÓDULO 05: Mobile App Flutter (Billetera y Validador Portero)
# -------------------------------------------------------------------
cd ms/mobile-app
flutter pub get
flutter run
```
