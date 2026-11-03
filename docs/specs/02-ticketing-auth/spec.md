# Specification: Módulo Vertical 02 — Portal de Cliente, Taquilla, Pagos y Autenticación (ms/ticketing-auth)

> **Estado:** APPROVED  
> **Módulo:** `02-ticketing-auth`  
> **Ubicación en Monorepo:** `/ms/ticketing-auth` (`backend/` y `frontend/`) — *Repositorio Git Autónomo*  
> **Nube Asignada:** Amazon Web Services (AWS - Levantamiento Estándar con Docker)  
> **Arquitectura:** Módulo Autónomo Vertical (Backend Spring Boot + Frontend React PWA)  
> **Rol en el Ecosistema:** **URL Principal y Punto de Entrada Centralizado para Clientes (`http://localhost:3000/`)**  
> **Metodología:** SDD-Spec-Extended (UI/UX Jetstream, Dark Mode First y Gobernanza Estricta)  
> **Gobernanza:** Subordinado a [docs/constitution.md](docs/constitution.md)

---

## 1. Objetivo y Alcance Unificado del Módulo

- **Objetivo de Negocio**: Operar como la **URL Principal y Portal de Entrada Central del Ecosistema de CineCenter (`http://localhost:3000/`)**, concentrando el catálogo público de cartelera para visitantes, el proveedor de identidad centralizado (SSO con JWT y Refresh Tokens), el flujo de autenticación y redirección inteligente a compra, la retención temporal de butacas durante **60 segundos (1 minuto)** con TTL estricto en DynamoDB (`INV-BIZ-02`), el procesamiento de pagos en Stripe Sandbox (`4242...`), el control estricto de idempotencia (`Idempotency-Key`), la orquestación distribuida SAGA mediante RabbitMQ, y la billetera web de entradas (`/mis-tickets`) con visualizador in-app de doble código QR sin descarga a disco local.
- **In-Scope**:
  - **Backend (`ms/ticketing-auth/backend`)**:
    - Spring Boot 3.2 (Java 21) bajo Arquitectura Hexagonal estricta (Dominio, Puertos y Adaptadores). Puerto HTTP: `8082`.
    - Proveedor SSO con emisión y rotación de tokens (Access Token 15 min, Refresh Token 7 días en DynamoDB).
    - Bloqueo temporal de asientos (`SeatHold`) con atributo TTL estricto de 60 segundos (1 minuto) en DynamoDB Local/AWS.
    - Control de idempotencia con cabecera `Idempotency-Key` persistida por 24 horas en DynamoDB.
    - Integración con pasarela Stripe Sandbox y orquestación SAGA mediante RabbitMQ (publicación de eventos `TicketOrderPlaced` y consumo de compensaciones).
    - Endpoint de salud (`/api/v1/health`) para monitoreo del semáforo visual.
  - **Frontend (`ms/ticketing-auth/frontend`)**:
    - React 18 (TypeScript) con arquitectura Feature-First, Vite, Tailwind Dark Mode First (paleta Slate con acento carmesí `#E50914`) y soporte PWA. Puerto HTTP: `3000` (**URL Principal del Sistema**).
    - **Flujo de Entrada y Navegación de Cliente (`INV-BIZ-05`)**:
      - `http://localhost:3000/` (**Welcome / Cartelera Pública**): Catálogo interactivo de películas, horarios y sinopsis para visitantes anónimos sin registro previo.
      - **Redirección a Login**: Al presionar "Comprar Boletos" o seleccionar una función sin sesión activa, redirige inmediatamente a `/login` guardando el identificador de la función seleccionada en memoria/URL state.
      - `http://localhost:3000/login` (**Pantalla de Login SSO**): Autenticación centralizada con semáforo de salud de backend.
      - `http://localhost:3000/cartelera` (**Cartelera Autenticada y Selección de Butacas**): Retorno post-login al plano interactivo de la sala con **temporizador circular regresivo de 60 segundos**.
      - `http://localhost:3000/checkout` (**Checkout Unificado**): Resumen de compra (entradas + confitería fija) y pasarela Stripe Elements.
      - `http://localhost:3000/mis-tickets` (**Billetera Web de Boletos**): Consulta in-app de boletos comprados con el modal interactivo `TicketDetailModal` proyectando el **QR Llave** (acceso a sala) y el **QR de Confitería** con brillo optimizado.
    - **Contenerización Soberana**: Archivo `ms/ticketing-auth/docker-compose.yml` que levanta localmente DynamoDB Local, RabbitMQ local y los contenedores de backend y frontend de manera 100% aislada.
- **Out-of-Scope**:
  - Administración de complejos o diseño de salas de cine (responsabilidad exclusiva del ERP Angular `ms/cinema-core`).
  - Cancelaciones o reembolsos voluntarios solicitados por clientes (`INV-BIZ-01`).
  - Descarga física de boletos en PDF a disco local (la visualización es puramente interna mediante el modal).

---

## 2. Sección A: Especificación de Backend (`ms/ticketing-auth/backend`)

### 2.1 Modelo Conceptual y Persistencia en DynamoDB
- **Tabla `cinema_seat_holds`**:
  - `PK: SHOWTIME#<showtime_id>`, `SK: SEAT#<seat_id>`
  - `user_id` (String UUID), `order_id` (String UUID), `ttl` (Epoch Timestamp en segundos, fijado a `now() + 60s`).
- **Tabla `cinema_orders`**:
  - `PK: ORDER#<order_id>`
  - `user_id` (String UUID), `showtime_id` (String UUID), `seats` (List de IDs de butacas), `candy_bar` (List de productos y cantidades), `amount_cents` (Int > 0), `stripe_charge_id` (String), `status` (`PENDING_PAYMENT`, `PAYMENT_CONFIRMED`, `COMPLETED`, `FAILED_COMPENSATED`), `created_at` (ISO-8601 UTC).
- **Tabla `cinema_idempotency_keys`**:
  - `PK: KEY#<idempotency_key>`
  - `response_body` (String JSON), `status_code` (Int), `ttl` (Epoch Timestamp a 24 horas).

### 2.2 Reglas de Negocio del Backend (RB)
- **`RB-02.1` (Expiración Rígida de 60 Segundos)**: Toda retención temporal en `cinema_seat_holds` expira exactamente a los 60 segundos si la orden no pasa a `PAYMENT_CONFIRMED`. DynamoDB purga automáticamente el registro vía TTL.
- **`RB-02.2` (Retención de Asientos ante Fallo de Pasarela)**: Si la transacción en Stripe Sandbox es declinada, la orden permanece en `PENDING_PAYMENT` y los asientos permanecen bloqueados hasta que el temporizador de 60 segundos expire naturalmente, permitiendo al usuario ingresar otra tarjeta de prueba.
- **`RB-02.3` (Idempotencia Transaccional Obligatoria)**: Toda petición POST de checkout debe incluir la cabecera `Idempotency-Key`. Peticiones duplicadas retornan la respuesta en caché sin generar nuevos cargos ni duplicar eventos SAGA.
- **`RB-02.4` (Compensación SAGA Automática)**: Si tras el pago exitoso en Stripe falla la emisión de boletos en `ms/media-hub`, el orquestador SAGA revierte los asientos en PostgreSQL y emite el reembolso correspondiente en Stripe.

---

## 3. Sección B: Especificación de Frontend (`ms/ticketing-auth/frontend` - Puerto 3000)

### 3.1 Arquitectura de Vistas del Flujo de Cliente
1. **Welcome / Cartelera Pública (`http://localhost:3000/`)**:
   - Cabecera con selector de complejo, catálogo de películas con afiches, géneros, duración y botones de horarios disponibles.
   - Botón superior prominente: "Iniciar Sesión" y selector de tema (Dark/Light).
   - Semáforo de conexión al backend en el pie de página.
2. **Pantalla de Autenticación Centralizada (`http://localhost:3000/login`)**:
   - Formulario único de credenciales para todo tipo de usuarios (clientes y administradores).
   - **Bifurcación Inteligente por Rol**:
     - **Clientes (`ROLE_CUSTOMER`)**: Si el usuario venía con la intención de comprar una función específica, tras el login exitoso es dirigido inmediatamente a `/cartelera?showtimeId=...`; si inició sesión sin selección previa, accede a la cartelera autenticada o a `/mis-tickets`.
     - **Administradores (`ROLE_MANAGER`, `ROLE_SUPERADMIN`)**: El frontend inspecciona el claim `roles` del JWT emitido por Spring Boot y redirige automáticamente la ventana a `http://localhost:4200/admin?auth_token={jwt}`, integrando de forma transparente la experiencia administrativa.
3. **Plano de Butacas y Temporizador Circular (`http://localhost:3000/cartelera`)**:
   - Plano 2D interactivo de butacas con estados en tiempo real (Libre, Ocupada, Bloqueada por mí).
   - Temporizador circular interactivo con cuenta regresiva regresiva de 60 segundos desde la primera butaca seleccionada.
4. **Checkout Unificado y Stripe (`http://localhost:3000/checkout`)**:
   - Resumen de butacas y adición de combos de confitería.
   - Formulario Stripe Elements con tarjeta sandbox prellenada.
5. **Billetera Web Mis Boletos (`http://localhost:3000/mis-tickets`)**:
   - Lista interactiva de boletos adquiridos por el cliente autenticado.
   - Clic en boleto abre el modal interactivo `TicketDetailModal` proyectando el **QR Llave** (acceso a sala) y el **QR de Confitería**.

---

## 4. Requisitos de UI/UX, Roles y Semillas (/extended)

### 4.1 Requisitos de Experiencia de Usuario
- **`RF-UX-01`**: Puerto HTTP estandarizado en `3000` como URL Principal del sistema.
- **`RF-UX-02`**: Temporizador circular gráfico visible durante la selección de butacas y checkout.
- **`RF-UX-03`**: Banner superior informativo de contingencia ante pérdida de conexión con la API de Spring Boot.
- **`RF-UX-04`**: Visualización in-app de entradas mediante modal interactivo sin descarga de archivos a disco.
- **`RF-UX-05`**: Banners toasts temáticos para confirmar el bloqueo de butacas y el cobro exitoso.

### 4.2 Matriz RBAC de Roles y Permisos (Perfiles Excluyentes)
| Acción Operativa | `ROLE_SUPERADMIN` | `ROLE_MANAGER` | `ROLE_CASHIER` | `ROLE_GATEKEEPER` | `ROLE_CUSTOMER` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Ver Cartelera Pública (`/`) | Permitido | Permitido | Permitido | Permitido | Permitido |
| Bloquear Butacas (Hold 60s) | Permitido | Permitido | Permitido | Denegado | Permitido |
| Checkout con Stripe | Permitido | Denegado | Permitido | Denegado | Permitido |
| Ver Billetera de Boletos (`/mis-tickets`) | Denegado | Denegado | Denegado | Denegado | Permitido |
| Consultar Auditoría de Órdenes | Permitido | Permitido | Denegado | Denegado | Denegado |

### 4.3 Variables de Entorno Preconfiguradas (.env.*) [INV-ARCH-09]
- **Backend (`ms/ticketing-auth/backend/.env.example` / `application.yml`)**:
  - `SERVER_PORT=8082`
  - `DYNAMODB_ENDPOINT=http://localhost:8000`
  - `RABBITMQ_HOST=localhost`
  - `STRIPE_API_KEY=sk_test_51MockStripeKeyForTesting2026`
  - `SEAT_HOLD_TTL_SECONDS=60`
- **Frontend (`ms/ticketing-auth/frontend/.env.example`)**:
  - `PORT=3000`
  - `VITE_API_BASE_URL=http://localhost:8082`
  - `VITE_STRIPE_PUBLIC_KEY=pk_test_51MockStripePublishableKey2026`
  - `VITE_BACKEND_HEALTH_URL=http://localhost:8082/api/v1/health`

---

## 5. Requerimientos Funcionales (Patrón EARS)

- **`HU-01`**: Como Visitante, quiero acceder a la URL principal `http://localhost:3000/` y consultar las películas y horarios de cartelera sin autenticarme.
  - `RF-01.1`: **Ubiquitous**: El frontend renderizará la cartelera pública en `/` permitiendo explorar sinopsis y funciones.
- **`HU-02`**: Como Visitante no autenticado, cuando intente comprar un boleto, quiero ser redirigido a iniciar sesión para que mis compras queden registradas.
  - `RF-02.1`: **Event-Driven**: Cuando un usuario no autenticado presione "Comprar Boletos", el frontend lo redirigirá a `/login` preservando el ID de la función para retomar el flujo tras autenticarse.
- **`HU-03`**: Como Cliente autenticado, quiero seleccionar butacas y disponer de 60 segundos de retención temporal para pagar en Stripe Sandbox.
  - `RF-03.1`: **Event-Driven**: Cuando el Cliente seleccione asientos libres, el sistema creará un registro en DynamoDB con TTL de 60 segundos e iniciará el temporizador circular regresivo en pantalla.
- **`HU-04`**: Como Cliente, quiero acceder a "Mis Tickets" y abrir mis boletos dentro del sistema con ambos códigos QR sin descargar archivos.
  - `RF-04.1`: **Ubiquitous**: En `/mis-tickets`, el sistema proveerá el modal `TicketDetailModal` desplegando el QR Llave y el QR de Confitería directamente en pantalla.

---

## 6. Criterios de Aceptación (Gherkin BDD de Punta a Punta)

### Escenario 1: Flujo de Bienvenida, Intención de Compra y Redirección a Login
```gherkin
Given que un visitante anónimo ingresa a la URL principal "http://localhost:3000/"
Then visualiza la cartelera de cine con las películas y horarios disponibles
When hace clic sobre el botón "Comprar Boletos" de la función de las 19:00 UTC
Then el sistema detecta que no existe sesión activa y redirige a "/login"
And preserva en el estado de la URL el parámetro "?returnUrl=/cartelera&showtimeId=..."
When el usuario ingresa "cliente@test.com" con su contraseña e inicia sesión
Then el sistema lo redirige de inmediato a "/cartelera" con la función seleccionada lista para elegir butacas
```

### Escenario 2: Bloqueo de butacas con temporizador circular de 60 segundos
```gherkin
Given que el Cliente autenticado se encuentra en el mapa interactivo de sala
When selecciona las butacas "B4" y "B5"
Then el frontend envía la solicitud de bloqueo temporal al backend Spring Boot
And el backend persiste los registros en DynamoDB con TTL fijado a 60 segundos
And el frontend despliega el temporizador circular regresivo iniciando en "01:00"
```

### Escenario 3: Retención de butacas ante fallo de pago en Stripe
```gherkin
Given que el Cliente tiene 2 butacas bloqueadas con 40 segundos restantes en el temporizador
When ingresa una tarjeta de prueba rechazada (ej: fondos insuficientes) y presiona "Pagar Orden"
Then la pasarela Stripe rechaza el cobro
And el frontend muestra un banner toast de error "Pago declinado. Puedes reintentar con otra tarjeta"
And las butacas permanecen bloqueadas en pantalla continuando la cuenta regresiva desde los 40 segundos
And las butacas no son liberadas a otros clientes hasta que el temporizador llegue a "00:00"
```

### Escenario 4: Visualización interna de boletos en Mis Tickets sin descarga
```gherkin
Given que el Cliente completó exitosamente la compra de sus boletos
When navega a la ruta "/mis-tickets"
Then el sistema muestra la tarjeta del boleto confirmado
When el usuario hace clic sobre la tarjeta
Then el sistema abre el modal interactivo "TicketDetailModal"
And renderiza en pantalla el QR Llave para acceso a sala y el QR de Confitería para el mostrador
And la interfaz no ofrece opciones de descarga de archivos a disco local
```
