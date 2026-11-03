# Módulo 01: Cinema Core ERP (`ms/cinema-core`)

> **Nube Asignada:** Microsoft Azure  
> **Arquitectura:** NestJS 10 (GraphQL Apollo) + PostgreSQL 16 + Angular 17  
> **Gobernanza:** Subordinado a [`docs/constitution.md`](../../docs/constitution.md) y [`docs/specs/01-cinema-core/`](../../docs/specs/01-cinema-core/)

---

## 1. Visión y Propósito del Módulo

**Cinema Core ERP** es el sistema de gestión de backoffice centralizado y portal administrativo unificado del complejo cinematográfico. Consolida:

- **Portal de Administración Unificado (Angular 17, Puerto `4200`)**: Dashboard ejecutivo, diseño interactivo de salas y butacas, programación semanal de cartelera con detección de colisiones de horarios (buffer de 20 min), catálogo de películas con integración multimedia y centro de reportes inteligentes con IA.
- **Backend Core GraphQL (NestJS 10, Puerto `3002`)**: API orientada a GraphQL Apollo Server con tipado estricto, esquemas Code-First, control de acceso por roles (`ROLE_MANAGER`, `ROLE_SUPERADMIN`) y persistencia en PostgreSQL con TypeORM.
- **Base de Datos Soberana**: PostgreSQL 16 local en contenedor (`cinema-core-postgres`, Puerto `5432`).

---

## 2. Puertos y Servicios Expuestos

| Servicio | Entorno / Contenedor | Puerto Local | URL / Endpoint Principal |
| :--- | :--- | :---: | :--- |
| **Portal de Administración** | Angular 17 (`cinema-core-frontend`) | `4200` | `http://localhost:4200/admin` o `http://localhost:4200/` |
| **Backend GraphQL** | NestJS 10 (`cinema-core-backend`) | `3002` | `http://localhost:3002/graphql` |
| **Backend Health Check** | NestJS 10 REST | `3002` | `http://localhost:3002/health` |
| **PostgreSQL Database** | PostgreSQL 16 (`cinema-core-postgres`) | `5433` (Host) / `5432` (Docker) | `postgresql://postgres:postgres@localhost:5433/cinema_db` |

---

## 3. Prerrequisitos de Entorno

- **Node.js**: Versión 20.x LTS o superior.
- **npm**: Versión 10.x o superior.
- **Docker & Docker Compose**: Versión 24.x o superior (para levantamiento contenerizado).

---

## 4. Variables de Entorno (`.env`)

### Backend (`ms/cinema-core/backend/.env`)
Crear el archivo `.env` en `backend/` a partir de `.env.example`:

```bash
# ms/cinema-core/backend/.env
PORT=3002
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cinema_db
JWT_SECRET=cinema-core-secret-key-superadmin-test-2026
AI_MCP_URL=http://localhost:8001
MEDIA_HUB_URL=http://localhost:8080
RABBITMQ_URL=amqp://guest:guest@localhost:5672
UNIVERSAL_PASSWORD=Password123!
```

### Frontend (`ms/cinema-core/frontend/.env`)
Crear el archivo `.env` en `frontend/` a partir de `.env.example`:

```bash
# ms/cinema-core/frontend/.env
GRAPHQL_ENDPOINT=http://localhost:3002/graphql
BACKEND_HEALTH_URL=http://localhost:3002/health
AI_REPORTS_URL=http://localhost:8001/api/mcp
MEDIA_HUB_URL=http://localhost:8080
PUBLIC_CLIENT_PORTAL_URL=http://localhost:3000
DEFAULT_THEME=dark
```

---

## 5. Instrucciones de Levantamiento

### Opción A: Levantamiento Contenerizado con Docker Compose (Recomendada)

Desde la raíz del módulo `ms/cinema-core`:

```bash
# 1. Navegar al directorio del módulo
cd ms/cinema-core

# 2. Levantar la base de datos PostgreSQL y los servicios
docker compose up -d

# 3. Verificar el estado de los contenedores
docker compose ps
```

> **Verificación Observable:** Comprueba que `cinema-core-postgres` reporte estado `healthy` en el puerto `5432`.

### Opción B: Levantamiento para Desarrollo Local Paso a Paso

Si prefieres ejecutar el código fuente directamente con recarga en caliente (*Hot-Reload*):

#### Paso 1: Iniciar la Base de Datos PostgreSQL
```bash
cd ms/cinema-core
docker compose up -d cinema-db
```

#### Paso 2: Configurar y Ejecutar el Backend NestJS
```bash
cd ms/cinema-core/backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Ejecutar migraciones y semillero de datos iniciales
npm run seed

# Iniciar servidor en modo desarrollo
npm run start:dev
```
> El backend quedará listo en: `http://localhost:3002/graphql` y `http://localhost:3002/health`.

#### Paso 3: Configurar y Ejecutar el Frontend Angular
En una nueva terminal:
```bash
cd ms/cinema-core/frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo de Angular
npm start
```
> El Portal de Administración estará disponible en: `http://localhost:4200/`.

---

## 6. Credenciales de Prueba y Roles

| Rol Canónico | Usuario / Correo | Contraseña | Destino y Permisos |
| :--- | :--- | :--- | :--- |
| **Gerente de Complejo (`ROLE_MANAGER`)** | `operador@test.com` | `Password123!` | Acceso completo a `/admin`: Salas, Películas, Cartelera y Reportes. |
| **Superadministrador (`ROLE_SUPERADMIN`)** | `admin@test.com` | `Password123!` | Administración global y configuración del complejo. |

---

## 7. Comandos de Pruebas y Calidad

```bash
# Pruebas unitarias y de integración del Backend (NestJS + Jest)
cd ms/cinema-core/backend
npm test

# Pruebas del Frontend (Angular + Jest)
cd ms/cinema-core/frontend
npm test
```

---

## 8. Solución de Problemas Frecuentes (Troubleshooting)

- **Error: Puerto `5432` ocupado (`bind: address already in use`):**
  - **Causa:** Hay otra instancia de PostgreSQL local ejecutándose en tu equipo.
  - **Solución:** Detén la instancia local de Postgres o cambia el mapeo de puerto en `docker-compose.yml` (ej. `"5433:5432"` y actualiza `DATABASE_URL`).
- **Error: Fallo de conexión GraphQL (`ECONNREFUSED :3002`):**
  - **Causa:** El backend no ha terminado de iniciar o la base de datos no está lista.
  - **Solución:** Verifica los logs del backend con `npm run start:dev` y comprueba que `cinema-db` esté en estado `healthy`.
