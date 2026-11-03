# Módulo 03: Multimedia, Boletos Digitales y POS Confitería (`ms/media-hub`)

> **Nube Asignada:** Google Cloud Platform (GCP)  
> **Arquitectura:** Monolito Fullstack Unificado en Laravel 11 + Inertia.js + Vue.js 3 + MongoDB 7.0 + MinIO S3  
> **Puerto Unificado:** `8080`  
> **Gobernanza:** Subordinado a [`docs/constitution.md`](../../docs/constitution.md) y [`docs/specs/03-media-hub/`](../../docs/specs/03-media-hub/)

---

## 1. Visión y Propósito del Módulo

**Media Hub** es un monolito modular fullstack que unifica la administración multimedia, el almacenamiento de objetos S3, la emisión de boletos digitales con firma HMAC y la terminal POS de confitería (Candy Bar):

- **Consola Multimedia (`http://localhost:8080/admin/media`)**: Subida drag & drop de pósters y trailers, validación de dimensiones, límite estricto de 5 MB por archivo y generación de URLs prefirmadas de MinIO/GCS.
- **Terminal POS Candy Bar (`http://localhost:8080/pos/candy-scan`)**: Interfaz ágil para cajeros con lector de código QR para validación y canje instantáneo de productos de confitería.
- **Emisión Criptográfica de Boletos Digitales**: Generación de boletos inmutables con firma digital HMAC-SHA256 para validación offline en puerta de sala y canje en mostrador.
- **Persistencia Híbrida**: Catálogos y auditoría en **MongoDB 7.0** (`media_mongo_data`) y archivos binarios en **MinIO S3** (`media_minio_data`).

---

## 2. Puertos y Servicios Expuestos

| Servicio | Contenedor / Proceso | Puerto Local | URL / Endpoint Principal |
| :--- | :--- | :---: | :--- |
| **Monolito Laravel 11 + Inertia** | `cine_media_hub_service` | `8080` | `http://localhost:8080/` |
| **Consola de Medios (Inertia)** | Laravel Inertia View | `8080` | `http://localhost:8080/admin/media` |
| **Terminal POS Candy Bar** | Vue.js 3 POS Component | `8080` | `http://localhost:8080/pos/candy-scan` |
| **Backend Health Check** | Laravel REST API | `8080` | `http://localhost:8080/api/health` |
| **MinIO S3 API** | MinIO Server (`cine_media_hub_minio`) | `9000` | `http://localhost:9000` |
| **MinIO Web Console** | MinIO Dashboard | `9001` | `http://localhost:9001` (`cinecenter_admin` / `cinecenter_secret_2026`) |
| **MongoDB Database** | MongoDB 7.0 (`cine_media_hub_mongodb`) | `27017` | `mongodb://localhost:27017/media_hub` |

---

## 3. Prerrequisitos de Entorno

- **PHP**: Versión 8.2 o 8.3 con extensiones `mongodb`, `curl`, `mbstring` y `openssl`.
- **Composer**: Versión 2.x o superior.
- **Node.js**: Versión 20.x LTS o superior y **npm** 10.x.
- **Docker & Docker Compose**: Versión 24.x o superior.

---

## 4. Variables de Entorno (`.env`)

Crear el archivo `.env` en la raíz de `ms/media-hub` a partir de `.env.example`:

```bash
# ms/media-hub/.env
APP_NAME="Cine Center Media Hub"
APP_ENV=development
APP_KEY=base64:eThpc0lzQVNlY3JldEtleUZvckNpbmVDZW50ZXIyMDI2=
APP_DEBUG=true
APP_URL=http://localhost:8080

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=media_hub
DB_USERNAME=
DB_PASSWORD=

AWS_ACCESS_KEY_ID=cinecenter_admin
AWS_SECRET_ACCESS_KEY=cinecenter_secret_2026
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=cinema-assets
AWS_ENDPOINT=http://localhost:9000
AWS_USE_PATH_STYLE_ENDPOINT=true

HMAC_SECRET_KEY=cinecenter_hmac_secret_key_2026_super_secure

CINEMA_CORE_URL=http://localhost:3002
TICKETING_AUTH_URL=http://localhost:8082
AI_MCP_URL=http://localhost:8001
```

---

## 5. Instrucciones de Levantamiento

### Opción A: Levantamiento Contenerizado Completo con Docker Compose (Recomendada)

Desde la raíz del módulo `ms/media-hub`:

```bash
# 1. Navegar al directorio del módulo
cd ms/media-hub

# 2. Levantar todos los servicios (MongoDB, MinIO y Monolito Laravel)
docker compose up -d

# 3. Comprobar estado de los servicios
docker compose ps
```

> **Verificación Observable:** Abre en el navegador `http://localhost:8080/api/health` para comprobar el estado saludable del servicio.

### Opción B: Levantamiento para Desarrollo Local Paso a Paso

#### Paso 1: Iniciar Bases de Datos y Almacenamiento (MongoDB y MinIO)
```bash
cd ms/media-hub
docker compose up -d mongodb minio
```

#### Paso 2: Instalar Dependencias y Configurar Laravel
```bash
cd ms/media-hub

# Instalar dependencias PHP
composer install

# Instalar dependencias frontend de Vue 3
npm install

# Configurar variables de entorno y generar clave si no existe
cp .env.example .env
php artisan key:generate
```

#### Paso 3: Compilar Assets e Iniciar Servidores de Desarrollo
En una terminal (compilación en vivo de Vue con Vite):
```bash
npm run dev
```

En una segunda terminal (servidor HTTP de Laravel):
```bash
php artisan serve --port=8080
```
> El servicio quedará accesible en: `http://localhost:8080/`.

---

## 6. Credenciales de Prueba y Roles

| Rol Canónico | Usuario / Correo | Contraseña | Destino y Operaciones |
| :--- | :--- | :--- | :--- |
| **Cajero de Candy Bar (`ROLE_CASHIER`)** | `cajero@test.com` | `Password123!` | Acceso directo a la terminal de canje en `/pos/candy-scan`. |
| **Gerente de Complejo (`ROLE_MANAGER`)** | `operador@test.com` | `Password123!` | Gestión de afiches y multimedia en `/admin/media`. |

---

## 7. Comandos de Pruebas y Calidad

```bash
# Batería de pruebas automatizadas PHPUnit / Pest en Laravel
cd ms/media-hub
php artisan test
```

---

## 8. Solución de Problemas Frecuentes (Troubleshooting)

- **Error: Fallo de conexión con MinIO (`Connection refused :9000`):**
  - **Causa:** El contenedor `cine_media_hub_minio` aún no ha terminado de inicializarse.
  - **Solución:** Revisa con `docker compose ps` y valida que la consola web en `http://localhost:9001` responda con las credenciales `cinecenter_admin` / `cinecenter_secret_2026`.
- **Error: Assets de Inertia/Vue no cargan:**
  - **Causa:** Vite no está corriendo o los assets no han sido construidos.
  - **Solución:** Ejecuta `npm run dev` para desarrollo o `npm run build` para generar el bundle estático.
