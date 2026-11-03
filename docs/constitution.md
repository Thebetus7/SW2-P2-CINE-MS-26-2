# Constitution: Plataforma Integral de Gestión Cinematográfica (Cine Center)

> **Estado:** APPROVED  
> **Versión:** 1.4.0  
> **Última actualización:** 2026-10-15  
> **Gobernanza:** Nivel 1 en Jerarquía SDD (Precedencia Absoluta sobre Spec, Plan, Tasks y Code)

---

## 1. Visión, Dominio y Propósito del Sistema

- **Misión Principal**: Diseñar, especificar y desplegar una plataforma distribuida de gestión cinematográfica y venta de entradas inspirada en complejos comerciales (estilo "Cine Center"). La arquitectura se organiza estrictamente en **módulos autónomos verticales ordenados consecutivamente (01 a 05), ubicados al 100% dentro de la carpeta `ms/`**, donde cada módulo constituye un **repositorio Git independiente**, desplegable de forma desacoplada en un entorno **Multi-Cloud estándar** (AWS, Microsoft Azure y Google Cloud Platform), además de una aplicación móvil híbrida independiente en `ms/mobile-app`.
- **Invariante de Aislamiento de Software**: **Queda estrictamente prohibido alojar cualquier archivo de software, código fuente, scripts de levantamiento o configuraciones de orquestación fuera de la carpeta `ms/`**. La raíz del repositorio funciona exclusivamente como Hub de Gobernanza y Especificación (`docs/`). Se descartan y erradican del dominio las carpetas `infra/` e `iconix/`.
- **Estrategia de Contenerización Autónoma**: La ejecución en contenedores se gestiona de forma local y soberana dentro de cada módulo mediante su propio `docker-compose.yml` y sus respectivos `Dockerfile` en `ms/<modulo>/`. Queda terminantemente prohibido cualquier `docker-compose.yml` u orquestación global en la raíz.
- **Alcance Global del Sistema (In-Scope Macro por Módulos Consecutivos en `ms/`)**:
  - **Módulo 01 (`ms/cinema-core`) [Azure / Repo Propio]**: Backend NestJS 10 (GraphQL Apollo, Puerto 3002) + Frontend Angular 17 (**Portal de Administración Unificado**: Dashboard, Salas, Películas con póster integrado, Cartelera y Centro de Reportes IA amigable, Puerto 4200).
  - **Módulo 02 (`ms/ticketing-auth`) [AWS / Repo Propio]**: Backend Spring Boot 3.2 (DynamoDB + SAGA, Puerto 8082) + Frontend React 18 (**Portal Principal de Cliente**: Cartelera Pública, Login SSO, Compra y Billetera Web, Puerto 3000).
  - **Módulo 03 (`ms/media-hub`) [GCP / Repo Propio]**: **Monolito Modular Fullstack Unificado en Laravel 11 + Inertia.js + Vue.js 3** (MinIO S3 + MongoDB, Puerto 8080 unificado para consola de medios y terminal POS de confitería).
  - **Módulo 04 (`ms/ai-mcp`) [GCP / Repo Propio]**: **Microservicio Backend Headless de Inteligencia Artificial y Servidor MCP** en FastAPI + TensorFlow + OpenPyXL (Puerto 8001), consumido directamente por el Portal de Administración.
  - **Módulo 05 (`ms/mobile-app`) [Independiente / Repo Propio]**: Motor Local Dart (SQLite + CryptoQrVerifier HMAC + TFLite) + Frontend Flutter 3.x UI (Billetera Offline y Escáner de Acceso para Porteros).
- **Exclusiones Globales (Out-of-Scope Macro)**:
  - Cobros reales con dinero de producción (Stripe opera exclusivamente en Sandbox con tarjetas de prueba `4242...`).
  - Cancelación o reembolso voluntario por el cliente (las compras son firmes: compra, espera la función y vence).
  - Metodología ICONIX o carpetas de diagramación externa en la raíz (`iconix/`).
  - Servicios de infraestructura transversal fuera de `ms/` (`infra/` erradicada).

---

## 2. Lenguaje Ubicuo (Glosario Canónico del Dominio)

| Término Oficial (ES / Código) | Sinónimos Prohibidos | Definición Exacta en el Dominio e Invariante Conceptual |
| :--- | :--- | :--- |
| **Complejo** (`CinemaComplex`) | Sucursal, Cine, Local | Establecimiento físico del cine que agrupa salas, puntos de venta y confiterías. |
| **Sala** (`CinemaHall`) | Habitación, Room, Stage | Espacio físico acondicionado con pantalla, tipo de proyección (2D, 3D, CXC, VIP) y butacas fijas. |
| **Butaca** (`Seat`) | Asiento, Silla, Lugar | Unidad individual de acomodación física identificada por fila (letra) y número. |
| **Película** (`Movie`) | Film, Cinta, Título | Obra cinematográfica registrada con duración, sinopsis, clasificación y material multimedia. |
| **Función** (`Showtime`) | Horario, Sesión, Tanda | Programación de una película en una sala y fecha/hora específica con precio asignado. |
| **Bloqueo Temporal** (`SeatHold`) | Reserva provisoria, Hold | Retención transitoria de butacas en DynamoDB con TTL estricto de 60 segundos. |
| **Orden de Compra** (`TicketOrder`) | Pedido, Carrito, Venta | Transacción comercial que agrupa butacas, confitería, monto en centavos y pago en Stripe. |
| **Boleto Digital** (`DigitalTicket`) | Entrada, Ticket, Boleta | Comprobante electrónico inmutable en PDF/JPEG con doble código QR (Sala y Candy Bar). |
| **QR Llave** (`AccessKeyQR`) | Pase, Scan, Código | Código QR autónomo firmado digitalmente (JWT/HMAC) para validación offline en sala. |
| **Candy Bar / Confitería** (`CandyBarItem`) | Kiosco, Bar, Dulcería | Productos comestibles del cine con código QR de canje independiente. |
| **Orquestador SAGA** (`SagaOrchestrator`) | Coordinador | Mecanismo en Spring Boot que coordina la transacción distribuida y sus compensaciones. |
| **Herramienta MCP** (`McpTool`) | Plugin, Endpoint IA | Función tipada expuesta por el servidor MCP en Python para consultas seguras sin SQL crudo. |

---

## 3. Mapa Global de Actores y Matriz de Autorización

1. **Cliente (`ROLE_CUSTOMER`)**: Explora cartelera pública en `http://localhost:3000/`, se autentica en `/login`, bloquea butacas, compra en Stripe Sandbox y visualiza sus boletos en la billetera web (`/mis-tickets`) y móvil.
2. **Cajero de Taquilla / Candy Bar (`ROLE_CASHIER`)**: Opera el POS de mostrador para venta presencial y canje de productos de confitería en `ms/media-hub` (`http://localhost:8080/pos/candy-scan`).
3. **Validador de Puerta / Portero (`ROLE_GATEKEEPER`)**: Escanea el QR Llave en sala con la app móvil Flutter `ms/mobile-app` (online u offline).
4. **Gerente de Complejo (`ROLE_MANAGER`)**: Administra salas, cartelera, películas con póster integrado y reportes por voz/texto en el Portal de Administración Unificado `ms/cinema-core/frontend` (`http://localhost:4200/admin`).
5. **Superadministrador (`ROLE_SUPERADMIN`)**: Administrador global del ecosistema y de los módulos.

---

## 4. Invariantes y Reglas de Negocio Universales (`INV-BIZ-XX`)

- **`INV-BIZ-01` (Compra Definitiva e Inmutabilidad de Entradas)**: Las órdenes confirmadas son finales. No existe caso de uso de cancelación o reembolso voluntario por el cliente. El borrado físico de transacciones está prohibido (`DELETE` SQL prohibido).
- **`INV-BIZ-02` (Ventana de Bloqueo Temporal de 60 Segundos)**: Toda butaca seleccionada se retiene en DynamoDB Local/AWS con un atributo TTL estricto de 60 segundos antes de liberarse automáticamente, optimizado para demostración y evaluación ágil.
- **`INV-BIZ-03` (Compra Unificada con Vouchers QR Diferenciados)**: La orden agrupa entradas y confitería en un único cobro de Stripe, pero el boleto digital emite dos códigos QR independientes (QR Llave para sala y QR de confitería para mostrador).
- **`INV-BIZ-04` (QR Llave Autónomo en Control de Acceso)**: El QR de sala contiene un token firmado con JWT/HMAC que la app móvil valida localmente de forma instantánea, sin depender de conexión a internet.
- **`INV-BIZ-05` (Flujo de Navegación Unificada y Redirección Inteligente por Rol)**:
  - **URL Principal de Entrada**: `http://localhost:3000/` (`ms/ticketing-auth/frontend` en React).
  - **Ruta `/` (Welcome / Cartelera Pública)**: Los visitantes exploran libremente películas, horarios y sinopsis sin necesidad de credenciales.
  - **Punto de Autenticación Centralizado (`/login`)**: Todos los usuarios (clientes y administradores) inician sesión en la misma pantalla oficial de autenticación.
  - **Redirección para Clientes (`ROLE_CUSTOMER`)**: Tras autenticarse, si tenían una función seleccionada regresan automáticamente al flujo de compra y selección de butacas con temporizador de 60s; de lo contrario acceden a la Cartelera Autenticada o a su billetera en `/mis-tickets`.
  - **Redirección para Administradores (`ROLE_MANAGER`, `ROLE_SUPERADMIN`)**: Al autenticarse credenciales de gestión, el portal principal detecta el rol y redirige de inmediato al usuario al Portal de Administración Unificado en `http://localhost:4200/admin` transfiriendo la sesión JWT. La barra superior del panel administrativo incluye un botón permanente "Volver a Cartelera / Portal Público" (`http://localhost:3000/`) para garantizar una experiencia cohesiva de software único.
  - **Billetera de Cliente (`/mis-tickets`)**: Sección privada donde el cliente consulta el historial de compras y visualiza sus boletos con el doble código QR en pantalla.
- **`INV-BIZ-06` (Precisión Monetaria y Zonas Horarias)**: Los montos se manejan en enteros (centavos) y las marcas de tiempo en formato UTC ISO-8601.
- **`INV-BIZ-07` (Borrado Lógico y Auditoría Transversal)**: Entidades maestras utilizan desactivación lógica (`is_active: false` o `deleted_at`) con trazabilidad inmutable (`created_at`, `updated_at`).
- **`INV-BIZ-08` (Desacoplamiento Estricto entre Portal Cliente y Portal de Admin)**:
  - El frontend de `ms/ticketing-auth` (React, `http://localhost:3000`) es el **Portal de Cliente exclusivo** (Welcome -> Login -> Cartelera Autenticada -> Mis Tickets).
  - El frontend de `ms/cinema-core` (Angular, `http://localhost:4200`) es el **Portal de Administración Completo y Unificado** para roles `ROLE_MANAGER` y `ROLE_SUPERADMIN` (Dashboard, Salas, Películas con póster integrado, Cartelera y Centro de Reportes IA amigable).
- **`INV-BIZ-09` (Perfiles Estrictamente Excluyentes)**: La asignación de roles es mutuamente excluyente; cada usuario autenticado opera bajo un único rol activo por sesión (`ROLE_CUSTOMER`, `ROLE_CASHIER`, `ROLE_GATEKEEPER`, `ROLE_MANAGER`, `ROLE_SUPERADMIN`).

---

## 5. Estructura Física Oficial del Repositorio Hub y Módulos Autónomos

```text
/cine-platform                                 # Repositorio Hub de Gobernanza y Especificación SDD
├── /docs                                      # Documentación Centralizada del Sistema
│   ├── constitution.md                        # Constitución Oficial (Nivel 1 SDD)
│   ├── operations-guide.md                    # Guía Operativa Centralizada y Evaluación
│   └── /specs                                 # Especificaciones de la Tríada por Módulo
│       ├── /01-cinema-core                    # Spec, Plan y Tasks del Módulo 01
│       ├── /02-ticketing-auth                 # Spec, Plan y Tasks del Módulo 02
│       ├── /03-media-hub                      # Spec, Plan y Tasks del Módulo 03
│       ├── /04-ai-mcp                         # Spec, Plan y Tasks del Módulo 04
│       └── /05-mobile-app                     # Spec, Plan y Tasks del Módulo 05
│
└── /ms                                        # 100% DEL SOFTWARE DEL SISTEMA (Repositorios Autónomos)
    │
    ├── /cinema-core                           # MÓDULO 01 [Repo Git Propio] [Azure]: Core y Portal de Admin
    │   ├── /backend                           # NestJS 10 (GraphQL Apollo) + PostgreSQL (Puerto 3002)
    │   ├── /frontend                          # Angular 17 (Portal de Admin Unificado) (Puerto 4200)
    │   ├── /docs                              # Documentación técnica interna del módulo
    │   └── docker-compose.yml                 # Orquestación de contenedores y PostgreSQL local
    │
    ├── /ticketing-auth                        # MÓDULO 02 [Repo Git Propio] [AWS]: URL Principal, Taquilla y SAGA
    │   ├── /backend                           # Spring Boot 3.2 + DynamoDB + RabbitMQ (Puerto 8082)
    │   ├── /frontend                          # React 18 (Portal Cliente: Welcome -> Login -> Cartelera -> Mis Tickets) (Puerto 3000)
    │   ├── /docs                              # Documentación técnica interna del módulo
    │   └── docker-compose.yml                 # Orquestación de DynamoDB Local, RabbitMQ y servicios
    │
    ├── /media-hub                             # MÓDULO 03 [Repo Git Propio] [GCP]: Monolito Laravel 11 + Inertia + Vue 3
    │   ├── /app                               # Controladores, Modelos MongoDB y Servicios S3/HMAC (Puerto 8080)
    │   ├── /resources/js                      # Vistas y Componentes Vue 3 (Inertia Pages: Media Admin y POS)
    │   ├── /docs                              # Documentación técnica interna del módulo
    │   └── docker-compose.yml                 # Orquestación de MongoDB, MinIO y contenedor Laravel
    │
    ├── /ai-mcp                                # MÓDULO 04 [Repo Git Propio] [GCP]: Servicio Headless IA y Servidor MCP
    │   ├── /app                               # FastAPI, Servidor MCP, TensorFlow y OpenPyXL (Puerto 8001)
    │   ├── /docs                              # Documentación técnica interna del módulo
    │   └── docker-compose.yml                 # Orquestación de contenedor MCP y servicios
    │
    └── /mobile-app                            # MÓDULO 05 [Repo Git Propio] [Independiente]: App Móvil Flutter 3.x
        ├── /lib                               # Motor Local SQLite + CryptoQrVerifier HMAC + Lector TFLite
        ├── /docs                              # Documentación técnica interna de la app móvil
        └── pubspec.yaml                       # Configuración y dependencias móviles
```

---

## 6. Arquitectura y Despliegue Multi-Cloud Estándar

| Módulo Canónico | Nube Asignada | Backend y Persistencia | Frontend Asociado | Estrategia de Levantamiento Contenerizado |
| :--- | :--- | :--- | :--- | :--- |
| **`01 ms/cinema-core`** | **Microsoft Azure** | NestJS 10 (Puerto 3002) + **Azure Database for PostgreSQL** | Angular 17 (**Portal de Admin Unificado**, Puerto 4200) | `cd ms/cinema-core && docker compose up -d` |
| **`02 ms/ticketing-auth`** | **Amazon Web Services (AWS)** | Spring Boot 3.2 (Puerto 8082) + **Amazon DynamoDB** | React 18 (**Portal Cliente**, Puerto 3000) | `cd ms/ticketing-auth && docker compose up -d` |
| **`03 ms/media-hub`** | **Google Cloud (GCP)** | Laravel 11 + MongoDB + MinIO/GCS | Vue.js 3 integrado vía Inertia (Puerto 8080) | `cd ms/media-hub && docker compose up -d` |
| **`04 ms/ai-mcp`** | **Google Cloud (GCP)** | FastAPI (Puerto 8001) + TensorFlow + SDK MCP | *(Headless: Consumido por Portal de Admin)* | `cd ms/ai-mcp && docker compose up -d` |
| **`05 ms/mobile-app`** | **Independiente (On-Device)** | SQLite Local + CryptoQrVerifier Dart | Flutter 3.x UI (Billetera y Escáner) | Compilación nativa APK / Flutter Run |

### Comunicación Asíncrona SAGA
- En desarrollo local: Cada módulo levanta sus dependencias en su `docker-compose.yml` local. Para eventos SAGA se conecta a la instancia local de RabbitMQ en el puerto `5672`.
- En producción Multi-Cloud: Se utiliza un broker RabbitMQ gestionado con TLS (CloudAMQP) accesible con credenciales seguras, permitiendo que el orquestador SAGA en AWS interactúe asíncronamente con Azure y GCP con consistencia eventual.

---

## 7. Invariantes de Arquitectura Técnica (`INV-ARCH-XX`)

- **`INV-ARCH-01` (Aislamiento Total en `ms/` y Especialización Funcional)**: Todo el software de la plataforma reside estrictamente dentro de `ms/`. Cada uno de los 5 módulos (`01` al `05`) es un repositorio Git independiente. El **Módulo 01** consolida la **Interfaz Completa de Administración Unificada** (Dashboard, Salas, Películas con póster integrado, Cartelera y Centro de Reportes IA); el **Módulo 02** aloja el **Portal de Cliente** (Welcome, Compra y Mis Boletos); el **Módulo 03** opera como **Monolito Fullstack** (Multimedia y POS de Confitería); el **Módulo 04** es un **Microservicio Headless de IA/MCP** consumido por el Admin; y el **Módulo 05** opera como app móvil Flutter en `ms/mobile-app`.
- **`INV-ARCH-02` (Contenerización Descentralizada por Módulo)**: Cada módulo en `ms/` es completamente autónomo y cuenta con su propio `docker-compose.yml` y `Dockerfile` en su raíz interna. Se prohíbe cualquier archivo de ejecución o `docker-compose.yml` en la raíz del repositorio hub.
- **`INV-ARCH-03` (URL Principal Centralizada para el Cliente)**: El frontend de `ms/ticketing-auth` (React, `http://localhost:3000`) actúa como la URL principal del sistema para clientes. Implementa el ciclo completo: Welcome con Cartelera pública (`/`) -> Login (`/login`) -> Cartelera autenticada para compra -> Billetera web de boletos (`/mis-tickets`).
- **`INV-ARCH-04` (GraphQL en Core ERP y Separación de Puertos)**: `ms/cinema-core/backend` expone exclusivamente GraphQL en el puerto `3002` para evitar colisión con el portal de cliente en el puerto `3000`. Su frontend Angular (`http://localhost:4200`) actúa como el Portal de Administración Unificado.
- **`INV-ARCH-05` (Hexagonal y DynamoDB en Auth/Taquilla)**: `ms/ticketing-auth/backend` aísla su lógica en arquitectura hexagonal y utiliza DynamoDB para retenciones temporales (TTL 60s) e idempotencia.
- **`INV-ARCH-06` (MinIO Presigned URLs)**: `ms/media-hub` gestiona cargas y descargas exclusivamente mediante URLs prefirmadas temporales.
- **`INV-ARCH-07` (Tools MCP Tipadas e Inmunes a Inyección)**: `ms/ai-mcp` no ejecuta SQL dinámico; canaliza consultas mediante Tools MCP tipadas con Pydantic.
- **`INV-ARCH-08` (Edge AI Desacoplada)**: React ejecuta inferencias en cliente con TensorFlow.js, y la app móvil `ms/mobile-app` utiliza TensorFlow Lite para optimizar el escaneo de códigos QR.
- **`INV-ARCH-09` (Centralización y Preconfiguración de Entornos `.env.*`)**: Cada módulo autónomo en `ms/` posee sus archivos de variables de entorno (`.env.example` / `.env`) completamente preconfigurados y listos para ejecutar, eliminando la necesidad de adivinar configuraciones.

---

## 8. Comandos Oficiales del Entorno de Desarrollo

Cada módulo se gestiona de forma Soberana e Independiente desde su propio directorio en `ms/`:

```bash
# ===================================================================
# MÓDULO 01: ms/cinema-core (Azure / Repo Propio - Core & Portal Admin)
# ===================================================================
cd ms/cinema-core && docker compose up -d                      # Contenedores y Postgres local
cd ms/cinema-core/backend && npm install && npm run test       # Backend NestJS (Puerto 3002)
cd ms/cinema-core/frontend && npm install && npm run test      # Portal Admin Angular (Puerto 4200)

# ===================================================================
# MÓDULO 02: ms/ticketing-auth (AWS / Repo Propio - URL PRINCIPAL CLIENTE)
# ===================================================================
cd ms/ticketing-auth && docker compose up -d                   # Contenedores, DynamoDB local y RabbitMQ
cd ms/ticketing-auth/backend && ./gradlew test                 # Backend Spring Boot (Puerto 8082)
cd ms/ticketing-auth/frontend && npm install && npm run test   # Portal Cliente React (Puerto 3000)

# ===================================================================
# MÓDULO 03: ms/media-hub (GCP / Repo Propio - Monolito Laravel 11 + Inertia)
# ===================================================================
cd ms/media-hub && docker compose up -d                        # Contenedores, MongoDB y MinIO
cd ms/media-hub && composer install && npm install             # Dependencias PHP y Vue 3
cd ms/media-hub && php artisan test                            # Pruebas automatizadas del monolito (Puerto 8080)

# ===================================================================
# MÓDULO 04: ms/ai-mcp (GCP / Repo Propio - Servicio Headless IA)
# ===================================================================
cd ms/ai-mcp && docker compose up -d                           # Contenedor del Servidor MCP
cd ms/ai-mcp && poetry install && pytest                       # Backend FastAPI MCP (Puerto 8001)

# ===================================================================
# MÓDULO 05: ms/mobile-app (Flutter Independiente / Repo Propio)
# ===================================================================
cd ms/mobile-app && flutter test                               # Pruebas unitarias de Billetera y Validador
cd ms/mobile-app && flutter run                                # Ejecución en emulador o dispositivo físico
```

---

## 9. Historial de Enmiendas Constitucionales (Changelog)

| Versión | Fecha | Tipo de Cambio | Descripción de la Enmienda | Módulos Impactados |
| :--- | :--- | :--- | :--- | :--- |
| `1.0.0` | 2026-10-14 | Fundación | Creación de la Constitución inicial tras sesión /grill-me. | Todos |
| `1.1.0` | 2026-10-14 | Enmienda Arquitectónica | Reestructuración modular vertical: Módulos autónomos `ms/` conteniendo `backend/` y `frontend/`, estrategia Multi-Cloud estándar (AWS para Auth, Azure para Core, GCP para Media e IA), RabbitMQ con TLS para SAGA cross-cloud, y `mobile-app` como proyecto independiente. | Todos (`01` al `05`) |
| `1.2.0` | 2026-10-14 | Enmienda de Ordenamiento Canónico y Simetría Vertical | Formalización del orden consecutivo estricto 01 al 05 en specs y gobernanza; incorporación de `ms/ai-mcp/frontend` para garantizar simetría de Backend y Frontend. | Todos (`01` al `05`) |
| `1.3.0` | 2026-10-15 | Enmienda de Soberanía Modular, Descentralización Docker y URL Principal de Cliente | 1. Obligatoriedad absoluta de que el 100% del software resida en `ms/`, donde cada módulo es un repositorio Git autónomo.<br/>2. Eliminación definitiva de `infra/`, `iconix/` y del `docker-compose.yml` raíz.<br/>3. Formalización de la URL principal del sistema en `http://localhost:3000/` con flujo Welcome Cartelera -> Login -> Cartelera Autenticada -> Mis Tickets.<br/>4. Reubicación del backend NestJS al puerto `3002`. | Todos (`01` al `05`) |
| `1.3.1` | 2026-10-15 | Enmienda de Monolito Modular Fullstack en Módulo 03 | Consolidación de `ms/media-hub` como un proyecto monolítico fullstack unificado en Laravel 11 + Inertia.js + Vue.js 3 en el puerto `8080`. | Módulo `03` |
| `1.4.0` | 2026-10-15 | **Enmienda de Portal de Administración Unificado y Servicio Headless de IA** | 1. Consolidación de `ms/cinema-core/frontend` como la **Interfaz Completa y Unificada de Administración** del cine (`http://localhost:4200/admin`), integrando Dashboard, Salas, Películas con póster integrado, Cartelera y Centro de Reportes IA amigable.<br/>2. Reconversión de `ms/ai-mcp` a **Microservicio Backend Headless de IA y Servidor MCP** en el puerto `8001`, suprimiendo la consola/playground técnico independiente y canalizando su consumo a través del Portal de Admin. | Módulos `01` y `04` |
