# Guía de Levantamiento en Desarrollo Nativo / Local (ms/docs/levantar_x_nativo/README.md)

> **Estado:** APPROVED  
> **Versión:** 1.4.0  
> **Entorno:** Desarrollo Local Nativo (`development`)  
> **Estrategia:** Ejecución directa en máquina Host con Runtimes Locales y Hot-Reload  
> **Gobernanza:** Subordinado a [`docs/constitution.md`](../../../docs/constitution.md) y [`ms/README.md`](../../README.md)  
> **Metodología:** Spec-Driven Development (Formato Step Cards `/doc-deploy`)

---

## 🗺️ 1. Arquitectura de Desarrollo Nativo en el Host

En la modalidad **Nativa / Local**, los servicios de backend y frontend no se empaquetan dentro de contenedores de Docker; se ejecutan directamente sobre el sistema operativo de tu máquina mediante sus respectivos runtimes (`node`, `java`, `php`, `python`, `flutter`).

Para la persistencia (motores de base de datos y brokers de mensajería), se levantan únicamente los servicios de infraestructura liviana mediante contenedores Docker dedicados:

```mermaid
flowchart TD
    subgraph Host["Máquina de Desarrollo (Host Local)"]
        direction TB

        subgraph Infra["1. Infraestructura de Persistencia (Docker Ligero)"]
            PG[("PostgreSQL 16\nPuerto: 5433")]
            DDB[("DynamoDB Local\nPuerto: 8000")]
            MQ[("RabbitMQ\nPuertos: 5672 / 15672")]
            MGO[("MongoDB 7.0\nPuerto: 27017")]
            S3[("MinIO S3\nPuertos: 9000 / 9001")]
        end

        subgraph Apps["2. Procesos Nativos con Hot-Reload (Terminales Host)"]
            BE1["NestJS 10 (Node.js)\nhttp://localhost:3002"]
            FE1["Angular 17 (Node.js)\nhttp://localhost:4200/admin"]
            APP3["Laravel 11 + Inertia (PHP 8.3)\nhttp://localhost:8080"]
            AI4["FastAPI MCP (Python 3.11)\nhttp://localhost:8001"]
            BE2["Spring Boot 3.2 (Java 21)\nhttp://localhost:8082"]
            FE2["React 18 + Vite (Node.js)\nhttp://localhost:3000 (URL Principal)"]
            MOB["Flutter 3.x App (Dart)\n(Chrome / Emulador Android)"]
        end

        PG -.-> BE1
        DDB -.-> BE2
        MQ -.-> BE2
        MGO -.-> APP3
        S3 -.-> APP3
        BE1 --> FE1
        BE2 --> FE2
    end
```

---

## 📊 2. Matriz de Runtimes y Puertos en Modo Nativo

### Runtimes y Herramientas del Sistema Requeridas en el Host:
| Runtime / CLI | Versión Mínima | Propósito en el Ecosistema |
| :--- | :---: | :--- |
| **Node.js & npm** | `v20.x LTS` (npm 10+) | NestJS (`cinema-core`), Angular (`erp`), React (`ticketing`) |
| **Java JDK** | `21` (Amazon Corretto / Temurin) | Backend Spring Boot (`ticketing-auth`) |
| **PHP & Composer** | `PHP 8.3` + Composer 2.x | Monolito Laravel 11 (`media-hub`) con extensión `mongodb` |
| **Python** | `3.11.x` + `venv` + `pip` | Microservicio FastAPI MCP (`ai-mcp`) |
| **Flutter SDK** | `3.19+` / Dart 3.x | Billetera y validador móvil (`mobile-app`) |
| **Docker Desktop** | `>= 24.0.0` | Exclusivamente para levantar las bases de datos de apoyo |

### Matriz de Endpoints y Puertos Locales:
| Módulo | Componente | Puerto Local | Endpoint Principal |
| :--- | :--- | :---: | :--- |
| **01 Cinema Core** | Backend NestJS | `3002` | `http://localhost:3002/graphql` y `/health` |
| **01 Cinema Core** | Frontend Angular | `4200` | `http://localhost:4200/admin` (Portal ERP) |
| **02 Ticketing** | Backend Spring Boot | `8082` | `http://localhost:8082/api/v1/health` |
| **02 Ticketing** | Frontend React | `3000` | `http://localhost:3000/` (**URL Principal de Cliente**) |
| **03 Media Hub** | Monolito Laravel | `8080` | `http://localhost:8080/pos/candy-scan` |
| **04 AI MCP** | Servidor FastAPI | `8001` | `http://localhost:8001/docs` (Swagger) |
| **05 Mobile App** | Flutter Web/Android | *Variable* | App en navegador Chrome o emulador |

---

## ⚡ 3. Secuencia de Levantamiento Nativo Paso a Paso (Step Cards)

---

### 🚀 Paso 1: Verificar Runtimes Locales en el Sistema

> [!NOTE]
> **Propósito:** Validar que los intérpretes y compiladores requeridos estén instalados y configurados en el PATH de tu máquina host.  
> **Contexto de Ejecución:** `[PC LOCAL]` (Terminal del Host)  
> **Ruta de Trabajo:** Cualquier directorio

```bash
# Comprobar versiones instaladas
node -v
npm -v
java -version
php -v
python --version
flutter --version
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> - Node.js: `v20.x`
> - Java: `openjdk version "21.x"`
> - PHP: `PHP 8.3.x`
> - Python: `Python 3.11.x`
> - Flutter: `Flutter 3.x`

---

### 🚀 Paso 2: Preparar Archivos de Entorno (`.env`) para Modo Localhost

> [!NOTE]
> **Propósito:** Configurar las variables para que apunten a `localhost` en lugar de nombres de contenedor Docker.  
> **Contexto de Ejecución:** `[PC LOCAL]`  
> **Ruta de Trabajo:** Raíz del proyecto

```bash
# 1. Módulo 01: Cinema Core
cp ms/cinema-core/backend/.env.example ms/cinema-core/backend/.env
cp ms/cinema-core/frontend/.env.example ms/cinema-core/frontend/.env

# 2. Módulo 02: Ticketing & Auth
cp ms/ticketing-auth/backend/.env.example ms/ticketing-auth/backend/.env
cp ms/ticketing-auth/frontend/.env.example ms/ticketing-auth/frontend/.env

# 3. Módulo 03: Media Hub
cp ms/media-hub/.env.example ms/media-hub/.env

# 4. Módulo 04: AI MCP
cp ms/ai-mcp/.env.example ms/ai-mcp/.env

# 5. Módulo 05: Mobile App
cp ms/mobile-app/.env.example ms/mobile-app/.env
```

> [!TIP]
> **Verificación Observable:**
> En `ms/cinema-core/backend/.env`, comprueba que `DATABASE_URL` sea:
> ```ini
> DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cinema_db
> ```

---

### 🚀 Paso 3: Levantar Bases de Datos de Soporte en Docker

> [!NOTE]
> **Propósito:** Levantar de forma ágil y aislada únicamente los contenedores de bases de datos y colas requeridas por los backends nativos.  
> **Contexto de Ejecución:** `[PC LOCAL]`  
> **Ruta de Trabajo:** `ms/`

```bash
# 1. PostgreSQL para Cinema Core (Puerto 5433)
cd ms/cinema-core
docker compose up -d cinema-db

# 2. MongoDB (27017) y MinIO S3 (9000/9001) para Media Hub
cd ../media-hub
docker compose up -d mongodb minio

# 3. DynamoDB Local (8000) y RabbitMQ (5672/15672) para Ticketing
cd ../ticketing-auth
docker compose up -d dynamodb-local rabbitmq
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> Comprueba que los 5 contenedores de persistencia estén activos:
> ```bash
> docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
> ```

---

### 🚀 Paso 4: Levantar Módulo 01 — Cinema Core ERP (`ms/cinema-core`)

> [!NOTE]
> **Propósito:** Instalar dependencias, sembrar datos de prueba (salas y cartelera) y arrancar NestJS y Angular en modo recarga en caliente (*Hot-Reload*).  
> **Contexto de Ejecución:** `[PC LOCAL]` (Terminal 1 y Terminal 2)

#### Terminal 1 — Backend NestJS:
```bash
cd ms/cinema-core/backend
npm install
npm run seed
npm run start:dev
```
*Salud:* `curl -I http://localhost:3002/health` (HTTP 200)

#### Terminal 2 — Frontend Angular:
```bash
cd ms/cinema-core/frontend
npm install
npm start
```
*Acceso ERP:* Abre `http://localhost:4200/admin` (Credenciales: `operador@test.com` / `Password123!`).

---

### 🚀 Paso 5: Levantar Módulo 03 — Media Hub (`ms/media-hub`)

> [!NOTE]
> **Propósito:** Instalar dependencias PHP/Node, generar clave de cifrado y servir el monolito Laravel con Inertia.  
> **Contexto de Ejecución:** `[PC LOCAL]` (Terminal 3)  
> **Ruta de Trabajo:** `ms/media-hub`

```bash
cd ms/media-hub
composer install
npm install
npm run build
php artisan key:generate
php artisan serve --port=8080
```

> [!TIP]
> **Verificación Observable & Salida Esperada:**
> ```bash
> curl -I http://localhost:8080/api/health
> # Salida esperada: HTTP/1.1 200 OK
> ```
> *Acceso POS Dulcería:* `http://localhost:8080/pos/candy-scan` (Credenciales: `cajero@test.com` / `Password123!`).

---

### 🚀 Paso 6: Levantar Módulo 04 — AI MCP Service (`ms/ai-mcp`)

> [!NOTE]
> **Propósito:** Crear entorno virtual de Python, instalar dependencias analíticas y levantar servidor ASGI Uvicorn en el puerto 8001.  
> **Contexto de Ejecución:** `[PC LOCAL]` (Terminal 4)  
> **Ruta de Trabajo:** `ms/ai-mcp`

```bash
cd ms/ai-mcp

# En Windows PowerShell:
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# En Linux / macOS:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

> [!TIP]
> **Verificación Observable:**
> Comprueba `http://localhost:8001/health` o visita `http://localhost:8001/docs`.

---

### 🚀 Paso 7: Levantar Módulo 02 — Ticketing & Auth (`ms/ticketing-auth`) [URL Principal]

> [!NOTE]
> **Propósito:** Compilar y arrancar la API Spring Boot con Gradle y el Portal de Cliente React con Vite en el puerto 3000 (**URL Principal**).  
> **Contexto de Ejecución:** `[PC LOCAL]` (Terminal 5 y Terminal 6)

#### Terminal 5 — Backend Spring Boot:
```bash
cd ms/ticketing-auth/backend
# En Windows:
.\gradlew.bat bootRun

# En Linux / macOS:
./gradlew bootRun
```
*Salud:* `curl -I http://localhost:8082/api/v1/health` (HTTP 200)

#### Terminal 6 — Frontend React:
```bash
cd ms/ticketing-auth/frontend
npm install
npm run dev
```

> [!TIP]
> **Verificación Observable:**
> Abre tu navegador en la **URL Principal**: `http://localhost:3000/`. Explora la cartelera pública e inicia sesión con `cliente@test.com` / `Password123!`.

---

### 🚀 Paso 8: Ejecutar Módulo 05 — Aplicación Móvil (`ms/mobile-app`)

> [!NOTE]
> **Propósito:** Iniciar la app móvil Flutter para validar el escaneo offline de boletos mediante la cámara o billetera digital.  
> **Contexto de Ejecución:** `[PC LOCAL]` (Terminal 7)  
> **Ruta de Trabajo:** `ms/mobile-app`

```bash
cd ms/mobile-app
flutter pub get
flutter run -d chrome
```

---

## 🛠️ 4. Guía de Solución de Problemas Frecuentes en Modo Nativo

1. **Error: `JAVA_HOME is not set` al ejecutar `./gradlew bootRun`**:
   - *Causa:* El JDK 21 no está declarado en las variables de entorno del sistema.
   - *Solución:* Configura `JAVA_HOME` apuntando al directorio de instalación de tu JDK 21 (ej. `C:\Program Files\Eclipse Adoptium\jdk-21...`).
2. **Error de conexión MongoDB en PHP (`Class 'MongoDB\Client' not found`)**:
   - *Causa:* Falta la extensión nativa `mongodb` en `php.ini`.
   - *Solución:* Habilita `extension=mongodb` en tu archivo `php.ini` o utiliza el contenedor oficial de Laravel con `docker compose up media-hub-laravel -d` si no deseas compilar librerías PHP C en Windows.
3. **Conflicto de puerto con NestJS (`port 3002 already in use`)**:
   - *Causa:* Quedó un proceso de Node huérfano en segundo plano.
   - *Solución:* En PowerShell: `Get-Process node | Stop-Process -Force` o localiza el PID con `netstat -ano | findstr 3002`.
4. **Detención Rápida de las Bases de Datos al terminar el día**:
   ```bash
   cd ms/cinema-core && docker compose stop cinema-db
   cd ../media-hub && docker compose stop mongodb minio
   cd ../ticketing-auth && docker compose stop dynamodb-local rabbitmq
   ```

