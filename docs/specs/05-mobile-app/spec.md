# Specification: Proyecto Móvil 05 — Aplicación Móvil Independiente (ms/mobile-app)

> **Estado:** APPROVED  
> **Módulo:** `05-mobile-app`  
> **Ubicación en Monorepo:** `/ms/mobile-app` — *Repositorio Git Autónomo*  
> **Framework / Lenguaje:** Flutter 3.x (Dart 3.x) + SQLite Local + TensorFlow Lite  
> **Naturaleza:** Proyecto Móvil Autónomo Multiplataforma (Android, iOS y Web) al 100% dentro de `ms/`  
> **Metodología:** SDD-Spec-Extended (UI/UX Jetstream & Mobile, Dark Mode First y Gobernanza)  
> **Gobernanza:** Subordinado a [docs/constitution.md](docs/constitution.md)

---

## 1. Objetivo y Alcance Unificado del Módulo

- **Objetivo de Negocio**: Proveer una aplicación móvil unificada con arquitectura Offline-First para dos perfiles estrictamente excluyentes:
  1. **Clientes (`ROLE_CUSTOMER`)**: Al iniciar sesión (online u offline), su vista primaria es la **Cartelera Cinematográfica**. Dispone de una barra de navegación inferior fija (**Bottom Navigation Bar**) con 4 destinos: `Cartelera`, `Mis Boletos`, `Confitería` y `Configuración`. Visualiza sus boletos adquiridos proyectando en pantalla el **QR Llave** (acceso a sala) y el **QR de Confitería** sin requerir descargas de archivos a disco.
  2. **Porteros / Validadores de Puerta (`ROLE_GATEKEEPER`)**: Al iniciar sesión con `portero@test.com`, la app abre directamente la **interfaz dedicada de escaneo de cámara**, validando instantáneamente el **QR Llave** mediante verificación local de firma criptográfica HMAC-SHA256 y emitiendo una notificación simple de confirmación ("Acceso Permitido - Sala X").
- **In-Scope**:
  - **Sección A: Lógica, Persistencia y Criptografía Offline (`ms/mobile-app/lib/core`)**:
    - Persistencia local en SQLite cifrada (`local_tickets` y `gate_scans`).
    - Verificador criptográfico autónomo en Dart puro (`CryptoQrVerifier`) para tokens HMAC-SHA256 con clave secreta compartida.
    - Asistencia de enfoque y contraste con TensorFlow Lite para lectura de códigos en salas oscuras.
    - Cola transaccional de escaneos para sincronización diferida al reconectar.
    - Monitoreo del semáforo visual de salud de la API (badge verde/rojo) en la pantalla de inicio de sesión.
  - **Sección B: Experiencia de Usuario y Navegación Móvil (`/mobile-app/lib/features`)**:
    - **Enrutamiento por Rol Excluyente**: Pantalla de entrada condicional según el JWT del usuario autenticado.
    - **Navegación del Cliente (`ROLE_CUSTOMER`)**:
      - Vista primaria: Cartelera interactiva offline/online con horarios y sinopsis.
      - **Bottom Navigation Bar fija**: `Cartelera` (icono Home), `Mis Boletos` (icono Ticket), `Confitería` (icono Popcorn) y `Configuración` (icono Ajustes con Dark/Light Mode y Logout).
      - Billetera digital con visualización in-app en pantalla completa de ambos códigos QR con brillo de pantalla optimizado. Sin descargas locales a archivos.
    - **Experiencia del Portero (`ROLE_GATEKEEPER`)**:
      - Apertura directa de cámara con marco de escaneo.
      - Notificación simple de confirmación mediante banner toast verde ("Acceso Permitido") o rojo ("Boleto Inválido o Ya Utilizado").
- **Out-of-Scope**:
  - Pasarela transaccional de pago con tarjeta (delegada a la Web Taquilla `ms/ticketing-auth`).
  - Descarga física de boletos en PDF/JPEG a los archivos locales del teléfono móvil.

---

## 2. Sección A: Especificación de Lógica y Persistencia Local (SQLite)

### 2.1 Modelo Conceptual de Persistencia Local
- **Tabla `local_tickets`**:
  - `ticket_id` (UUID PK), `order_id` (UUID), `movie_title` (TEXT), `showtime_utc` (INTEGER).
  - `hall_name` (TEXT), `seat_label` (TEXT), `access_key_jwt` (TEXT HMAC), `candy_bar_qr_data` (TEXT).
  - `status` (`ACTIVE`, `USED`, `EXPIRED`), `cached_at_utc` (INTEGER).
- **Tabla `gate_scans`**:
  - `scan_id` (UUID PK), `ticket_id` (UUID), `scanned_at_utc` (INTEGER), `gatekeeper_id` (UUID).
  - `validation_result` (`AUTHORIZED`, `DUPLICATE_ENTRY`, `INVALID_SIGNATURE`, `EXPIRED_SHOWTIME`).
  - `is_synced` (INTEGER: 0 = pendiente, 1 = sincronizado).

### 2.2 Verificación Criptográfica Offline del QR Llave (`CryptoQrVerifier`)
- **Estructura del Payload QR Llave**:
  ```json
  {
    "tid": "UUID-BOLETO",
    "hid": "UUID-SALA",
    "st": 1728950400,
    "seats": ["F12", "F13"],
    "exp": 1728961200
  }
  ```
- **Algoritmo de Validación Local**:
  1. Decodifica el token HMAC-SHA256 contenido en el QR.
  2. Recomputa el hash utilizando la clave secreta institucional almacenada en el enclave seguro del dispositivo.
  3. Verifica que la hora actual esté dentro del rango `[showtime_utc - 30 min, showtime_utc + 45 min]`.
  4. Consulta en SQLite si `ticket_id` ya fue marcado como `USED`.
  5. Si es válido, inserta el escaneo en `gate_scans` y emite la notificación simple de confirmación.

---

## 3. Sección B: Especificación de Interfaz y Navegación Flutter

### 3.1 Vistas para el Rol Cliente (`ROLE_CUSTOMER`)
1. **Cartelera Cinematográfica (Vista Primaria)**:
   - Pantalla inicial obligatoria tras login.
   - Listado vertical y carrusel de películas disponibles con afiches en caché.
   - Indicador de módulo activo en barra superior: "Módulo 05: Mobile App".
2. **Barra de Navegación Inferior (Bottom Navigation Bar)**:
   - Elemento 1 (Extremo izquierdo): **Cartelera** (`Icons.movie`).
   - Elemento 2: **Mis Boletos** (`Icons.confirmation_number`).
   - Elemento 3: **Confitería** (`Icons.fastfood`).
   - Elemento 4 (Extremo derecho): **Configuración** (`Icons.settings` — Mi Perfil, Tema Dark/Light, Cerrar Sesión).
3. **Billetera de Boletos (`/wallet`)**:
   - Tarjetas de boletos adquiridos con fecha, película y sala.
   - Clic en boleto abre el visor en pantalla completa proyectando el QR Llave y el QR de confitería. Sin opciones de exportación o descarga a disco.

### 3.2 Interfaz Dedicada para el Rol Portero (`ROLE_GATEKEEPER`)
1. **Lector de Acceso Directo (`/gate-scanner`)**:
   - Al autenticarse el portero, la app salta la cartelera y despliega directamente el visor de cámara con marco de escaneo.
   - Contador visual discreto de asistentes validados en la parte superior.
   - Botón superior para cerrar sesión.
   - Notificación simple de confirmación:
     - Banner verde: *"Acceso Permitido — Sala 2"*
     - Banner rojo: *"Boleto Inválido o Ya Utilizado"*

---

## 4. Requisitos de UI/UX, Roles y Semillas (/extended)

### 4.1 Requisitos de Experiencia de Usuario Móvil
- **`RF-UX-01`**: Diseño con tema oscuro por defecto (Dark Mode First) en escala Slate.
- **`RF-UX-02`**: Barra de navegación inferior fija de 4 ítems táctiles para clientes.
- **`RF-UX-03`**: Enrutamiento directo al escáner sin pantallas intermedias para el rol portero.
- **`RF-UX-04`**: Semáforo visual de salud del backend (badge verde/rojo) en la pantalla de login.
- **`RF-UX-05`**: Visualización in-app de entradas sin descarga de archivos a disco local.
- **`RF-UX-06`**: Notificación simple de confirmación ante validaciones en puerta.

### 4.2 Matriz RBAC de Roles y Permisos (Perfiles Excluyentes)
| Acción Operativa | `ROLE_SUPERADMIN` | `ROLE_MANAGER` | `ROLE_CASHIER` | `ROLE_GATEKEEPER` | `ROLE_CUSTOMER` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Ver Cartelera en Móvil | Permitido | Permitido | Permitido | Denegado | Permitido |
| Ver Billetera (Mis Boletos) | Denegado | Denegado | Denegado | Denegado | Permitido |
| Escáner Directo en Puerta | Permitido | Denegado | Denegado | Permitido | Denegado |
| Sincronizar Escaneos Offline | Permitido | Denegado | Denegado | Permitido | Denegado |

### 4.3 Semilla de Datos y Credenciales de Prueba
- **Usuarios Precargados**:
  - `portero@test.com` / `Password123!` (`ROLE_GATEKEEPER` — Control de Acceso)
  - `cliente@test.com` / `Password123!` (`ROLE_CUSTOMER` — Cliente Billetera)
### 4.4 Centralización de Variables de Entorno y Credenciales Preconfiguradas (.env.*)
Conforme a `INV-ARCH-09`, la aplicación móvil cuenta con sus archivos de entorno y configuración preconfigurados y listos para ejecutar en emulador, dispositivo físico o navegador:
- **Mobile App (`mobile-app/.env.example` / `assets/config/env.json`)**:
  - `AUTH_API_BASE_URL=http://10.0.2.2:8082` (o `http://localhost:8082` para Chrome/Web)
  - `MEDIA_HUB_API_URL=http://10.0.2.2:8080`
  - `CINEMA_CORE_GRAPHQL_URL=http://10.0.2.2:3000/graphql`
  - `HMAC_SHARED_SECRET=cinecenter-hmac-shared-key-2026`
  - `OFFLINE_SYNC_INTERVAL_SECONDS=30`
  - `DEFAULT_THEME=dark`

---

## 5. Requerimientos Funcionales (Patrón EARS)

- **`HU-01`**: Como Cliente, quiero que al abrir la app móvil lo primero que vea sea la cartelera con navegación inferior para explorar películas fácilmente.
  - `RF-01.1`: **Event-Driven**: Cuando el usuario con `ROLE_CUSTOMER` inicie sesión, la app renderizará de inmediato la cartelera cinematográfica y la Bottom Navigation Bar con Cartelera, Mis Boletos, Confitería y Configuración.
- **`HU-02`**: Como Portero, quiero que al iniciar sesión se abra directamente el escáner de cámara para no perder tiempo navegando menús en la puerta de la sala.
  - `RF-02.1`: **Event-Driven**: Cuando el usuario con `ROLE_GATEKEEPER` inicie sesión, la app desplegará de inmediato la vista de escaneo de cámara.
- **`HU-03`**: Como Portero, quiero validar entradas offline mediante firma criptográfica y recibir una simple notificación de confirmación para agilizar el ingreso.
  - `RF-03.1`: **Event-Driven**: Cuando se lea un QR Llave, el verificador HMAC contrastará la firma en local y emitirá un banner simple de confirmación ("Acceso Permitido").

---

## 6. Criterios de Aceptación (Gherkin BDD de Punta a Punta)

### Escenario 1: Enrutamiento directo y validación offline para el rol Portero
```gherkin
Given que el usuario "portero@test.com" con rol "ROLE_GATEKEEPER" inicia sesión en la app Flutter
Then la app omite la vista de cartelera y abre directamente la pantalla de escaneo de cámara
When el portero enfoca el QR Llave de un cliente sin conexión a internet
Then el CryptoQrVerifier valida la firma HMAC-SHA256 contra la clave local
And registra el escaneo en la base SQLite interna
And despliega una notificación simple de confirmación en banner verde "Acceso Permitido — Sala 3"
```

### Escenario 2: Navegación de cliente con vista primaria de cartelera y barra inferior
```gherkin
Given que el usuario "cliente@test.com" con rol "ROLE_CUSTOMER" inicia sesión
Then la app muestra como vista primaria la cartelera cinematográfica
And la barra superior muestra el badge "Módulo 05: Mobile App"
And la barra inferior de navegación exhibe las 4 opciones: "Cartelera", "Mis Boletos", "Confitería" y "Configuración"
```

### Escenario 3: Rechazo de boleto ya utilizado previamente
```gherkin
Given que un boleto con ID "TICK-908" ya fue validado e ingresado a sala
When otro espectador presenta el mismo código QR ante el portero
Then el verificador local detecta el registro duplicado en la base SQLite
And emite una notificación simple en banner rojo "Boleto Inválido o Ya Utilizado"
And el contador de ingresos no se incrementa
```
