# Módulos del Sistema Cine Center (`ms/`)

> **Estrategia Arquitectónica:** Repositorios Git Autónomos por Módulo  
> **Invariante de Aislamiento:** El 100% del software ejecutable reside dentro de esta carpeta (`ms/`).  
> **Gobernanza:** Subordinado a [`docs/constitution.md`](../docs/constitution.md) y [`docs/operations-guide.md`](../docs/operations-guide.md).

---

## 🗺️ Mapa General de Módulos Autónomos

Cada módulo representa un subsistema desacoplado con su propia pila tecnológica, persistencia, variables de entorno y orquestación Docker soberana. Haz clic en cada módulo para ver su guía detallada de levantamiento:

| Módulo | Nombre / Directorio | Stack Tecnológico | Nube | Puerto(s) | README / Guía de Levantamiento |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **01** | [`cinema-core`](./cinema-core) | NestJS 10 (GraphQL) + Angular 17 + PostgreSQL 16 | Azure | `4200` (ERP) / `3002` (API) | [📘 Guía de Levantamiento](./cinema-core/README.md) |
| **02** | [`ticketing-auth`](./ticketing-auth) | Spring Boot 3.2 + React 18 + DynamoDB + RabbitMQ | AWS | `3000` (Cliente) / `8082` (API) | [📘 Guía de Levantamiento](./ticketing-auth/README.md) |
| **03** | [`media-hub`](./media-hub) | Laravel 11 + Inertia.js + Vue.js 3 + MongoDB + MinIO | GCP | `8080` (Fullstack) / `9001` (S3) | [📘 Guía de Levantamiento](./media-hub/README.md) |
| **04** | [`ai-mcp`](./ai-mcp) | FastAPI + MCP Server + TensorFlow + OpenPyXL | GCP | `8001` (Headless MCP) | [📘 Guía de Levantamiento](./ai-mcp/README.md) |
| **05** | [`mobile-app`](./mobile-app) | Flutter 3.x + Dart + SQLite + HMAC Offline | On-Device | App Móvil (Android/Web/Win) | [📘 Guía de Levantamiento](./mobile-app/README.md) |

---

## ⚡ Levantamiento Rápido por Módulo (Descentralización Docker)

Queda **prohibido** ejecutar Docker Compose en la raíz. Cada módulo se levanta de forma autónoma desde su propia carpeta:

```bash
# 1. Módulo 01: Cinema Core ERP
cd ms/cinema-core && docker compose up -d

# 2. Módulo 02: Portal de Cliente y Taquilla (URL Principal: http://localhost:3000)
cd ms/ticketing-auth && docker compose up -d

# 3. Módulo 03: Media Hub (Monolito Fullstack: http://localhost:8080)
cd ms/media-hub && docker compose up -d

# 4. Módulo 04: AI MCP Server (Headless: http://localhost:8001/docs)
cd ms/ai-mcp && docker compose up -d

# 5. Módulo 05: Aplicación Móvil
cd ms/mobile-app && flutter pub get && flutter run
```

---

## 🔐 Matriz de Credenciales de Prueba

| Rol Canónico | Correo | Contraseña | Destino Principal |
| :--- | :--- | :--- | :--- |
| **Cliente (`ROLE_CUSTOMER`)** | `cliente@test.com` | `Password123!` | Portal Cliente `http://localhost:3000/` y Billetera Móvil |
| **Gerente (`ROLE_MANAGER`)** | `operador@test.com` | `Password123!` | ERP Administración `http://localhost:4200/admin` |
| **Cajero Taquilla / Bar (`ROLE_CASHIER`)** | `cajero@test.com` | `Password123!` | Terminal POS Candy Bar `http://localhost:8080/pos/candy-scan` |
| **Portero / Acceso (`ROLE_GATEKEEPER`)** | `portero@test.com` | `Password123!` | Escáner Cámara App Móvil (`ms/mobile-app`) |
| **Superadministrador (`ROLE_SUPERADMIN`)** | `admin@test.com` | `Password123!` | Panel Global de Administración `http://localhost:4200/admin` |
