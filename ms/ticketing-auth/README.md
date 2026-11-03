# Módulo 02: Portal de Cliente, Taquilla y Autenticación (`ms/ticketing-auth`)

> **Nube Asignada:** Amazon Web Services (AWS)  
> **Arquitectura:** Spring Boot 3.2 + Amazon DynamoDB + RabbitMQ + React 18  
> **URL Principal del Ecosistema:** `http://localhost:3000/`  
> **Gobernanza:** Subordinado a [`docs/constitution.md`](../../docs/constitution.md) y [`docs/specs/02-ticketing-auth/`](../../docs/specs/02-ticketing-auth/)

---

## 1. Visión y Propósito del Módulo

**Ticketing & Auth** es el corazón transaccional del sistema y aloja la **URL Principal de Entrada para el Cliente Final**. Consolida:

- **Portal Principal de Cliente (React 18 + Vite, Puerto `3000`)**:
  - `http://localhost:3000/`: Cartelera pública abierta a visitantes sin credenciales obligatorias.
  - `http://localhost:3000/login`: Punto centralizado de autenticación para clientes y personal.
  - `http://localhost:3000/cartelera`: Selección interactiva de butacas con temporizador visual regresivo de 60 segundos.
  - `http://localhost:3000/checkout`: Pasarela Stripe Sandbox y carrito unificado (entradas + confitería).
  - `http://localhost:3000/mis-tickets`: Billetera web donde el cliente consulta sus boletos y doble código QR (QR Llave + QR Confitería).
- **Backend Transaccional Hexagonal (Spring Boot 3.2, Puerto `8082`)**:
  - Retenciones temporales en DynamoDB con expiración estricta TTL de 60 segundos (`INV-BIZ-02`).
  - Orquestador de transacciones distribuidas SAGA con RabbitMQ y compensaciones automáticas.
  - Procesamiento seguro con Stripe Sandbox y emisión de tokens JWT.
- **Servicios de Persistencia y Mensajería**:
  - **DynamoDB Local** (Puerto `8000`): Almacenamiento rápido de holds y estados de compra.
  - **RabbitMQ 3.13** (Puertos `5672` y `15672`): Broker de eventos asíncronos y consola de gestión.

---

## 2. Puertos y Servicios Expuestos

| Servicio | Contenedor / Proceso | Puerto Local | URL / Endpoint Principal |
| :--- | :--- | :---: | :--- |
| **Portal de Cliente (URL Principal)** | React 18 (`cine_ticketing_frontend`) | `3000` | `http://localhost:3000/` |
| **Backend Taquilla & Auth** | Spring Boot (`cine_ticketing_backend`) | `8082` | `http://localhost:8082` |
| **Backend Health Check** | Spring Boot REST | `8082` | `http://localhost:8082/api/v1/health` |
| **DynamoDB Local** | DynamoDB Engine (`cine_ticketing_dynamodb`) | `8000` | `http://localhost:8000` |
| **RabbitMQ AMQP Broker** | RabbitMQ Alpine (`cine_ticketing_rabbitmq`) | `5672` | `amqp://localhost:5672` |
| **RabbitMQ Management UI** | RabbitMQ Web Console | `15672` | `http://localhost:15672` (`cinecenter_guest` / `cinecenter_rabbit_2026`) |

---

## 3. Prerrequisitos de Entorno

- **Node.js**: Versión 20.x LTS o superior.
- **Java**: JDK 21 (para ejecución directa del backend).
- **Docker & Docker Compose**: Versión 24.x o superior.

---

## 4. Variables de Entorno (`.env`)

### Backend (`ms/ticketing-auth/backend/.env`)
Crear el archivo `.env` en `backend/` a partir de `.env.example`:

```bash
# ms/ticketing-auth/backend/.env
SERVER_PORT=8082
SPRING_PROFILES_ACTIVE=dev
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=cinecenter_local
AWS_SECRET_ACCESS_KEY=Password123!
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=cinecenter_guest
RABBITMQ_PASS=cinecenter_rabbit_2026
JWT_SECRET=cinecenter_jwt_secret_key_2026_super_secure_for_ticketing_auth
STRIPE_API_KEY=sk_test_cinecenter_demo_key
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200
```

### Frontend (`ms/ticketing-auth/frontend/.env`)
Crear el archivo `.env` en `frontend/` a partir de `.env.example`:

```bash
# ms/ticketing-auth/frontend/.env
VITE_PORT=3000
VITE_API_URL=http://localhost:8082
VITE_ADMIN_ERP_URL=http://localhost:4200/admin
VITE_POS_URL=http://localhost:8080/pos/candy-scan
VITE_STRIPE_PUBLIC_KEY=pk_test_cinecenter_demo_key
VITE_APP_ENV=development
```

---

## 5. Instrucciones de Levantamiento

### Opción A: Levantamiento Contenerizado Completo con Docker Compose (Recomendada)

Desde la raíz del módulo `ms/ticketing-auth`:

```bash
# 1. Navegar al directorio del módulo
cd ms/ticketing-auth

# 2. Levantar todos los servicios (DynamoDB, RabbitMQ, Backend y Frontend)
docker compose up -d

# 3. Comprobar estado de los servicios
docker compose ps
```

> **Verificación Observable:** Accede a la URL principal `http://localhost:3000/` en tu navegador. Comprueba que la cartelera cargue correctamente y el indicador de backend reporte verde.

### Opción B: Levantamiento para Desarrollo Local Híbrido

#### Paso 1: Iniciar las Dependencias de Infraestructura (DynamoDB y RabbitMQ)
```bash
cd ms/ticketing-auth
docker compose up -d dynamodb-local rabbitmq
```

#### Paso 2: Ejecutar el Backend Spring Boot
```bash
cd ms/ticketing-auth/backend

# Ejecución con Java Runner compilado:
java -cp bin com.cinecenter.ticketing.TestRunner
```
> O si utilizas Gradle Wrapper: `./gradlew bootRun` (en Windows: `gradlew.bat bootRun`).

#### Paso 3: Configurar y Ejecutar el Frontend React
En una nueva terminal:
```bash
cd ms/ticketing-auth/frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo Vite
npm run start
```
> El Portal de Cliente estará disponible en: `http://localhost:3000/`.

---

## 6. Credenciales de Prueba y Roles

| Rol Canónico | Usuario / Correo | Contraseña | Comportamiento del Sistema |
| :--- | :--- | :--- | :--- |
| **Cliente (`ROLE_CUSTOMER`)** | `cliente@test.com` | `Password123!` | Compra boletos, temporizador de 60s en butacas y billetera `/mis-tickets`. |
| **Cajero de Taquilla (`ROLE_CASHIER`)** | `cajero@test.com` | `Password123!` | Acceso a operaciones de mostrador. |
| **Superadministrador (`ROLE_SUPERADMIN`)** | `admin@test.com` | `Password123!` | Redirección inteligente al ERP de Administración (`http://localhost:4200/admin`). |

---

## 7. Comandos de Pruebas y Verificación

```bash
# Pruebas automatizadas del Backend Java (Spring Boot)
cd ms/ticketing-auth/backend
java -cp bin com.cinecenter.ticketing.TestRunner

# Pruebas automatizadas del Frontend React (Node Test Runner)
cd ms/ticketing-auth/frontend
npm test
```

---

## 8. Solución de Problemas Frecuentes (Troubleshooting)

- **Error: Conflicto en el puerto `8000` o `5672`:**
  - **Causa:** Hay otra instancia de RabbitMQ o un servicio en el puerto 8000 en ejecución.
  - **Solución:** Revisa con `docker compose ps` y detén contenedores antiguos con `docker stop`.
- **Error: Fallo de conexión con DynamoDB Local:**
  - **Causa:** El contenedor `cine_ticketing_dynamodb` no ha iniciado completamente.
  - **Solución:** Verifica que el contenedor responda en `http://localhost:8000`.
