# Módulo Vertical 03: ms/media-hub (Multimedia & Boletos Digitales)

> **Arquitectura:** Monolito Modular Fullstack Unificado (Laravel 11 + Inertia.js + Vue.js 3 Jetstream Stack)  
> **Puerto HTTP Unificado:** `8080`  
> **Nube Asignada:** Google Cloud Platform (GCP)  
> **Gobernanza:** Subordinado a `docs/constitution.md`, `docs/specs/03-media-hub/spec.md` y `plan.md`  

---

## 1. Propósito y Alcance

El microservicio / monolito `ms/media-hub` centraliza:
1. **Administración de Activos Multimedia**: Almacenamiento en MinIO S3 con límite estricto de 5 MB (`RB-03.1`), generación reactiva de miniaturas de 300x450px y emisión de Presigned URLs con expiración programada.
2. **Terminal POS de Confitería (`http://localhost:8080/pos/candy-scan`)**: Interfaz para cajeros (`ROLE_CASHIER`) con escaneo láser de vouchers de confitería, checklist de entrega de productos y bloqueo atómico con código `CANDY_ALREADY_REDEEMED` (409 Conflict) ante intentos de doble canje.
3. **Emisión y Visor In-App de Boletos (`INV-BIZ-03`)**: Generación de boletos con doble código QR:
   - **QR Llave**: Token criptográfico firmado con HMAC-SHA256 para validación offline por la app móvil en sala.
   - **QR de Confitería**: Código de voucher individual para mostrador de Candy Bar.
   - Restricción estricta: Visualización in-app en pantalla sin descargas de PDFs a disco local (`RB-03.5`).
4. **Consumidor SAGA (`GenerateTicketSagaJob`)**: Deserializa eventos `order.paid.event` emitidos por el orquestador de `ticketing-auth` para persistir boletos inmutables.

---

## 2. Estructura del Repositorio

```text
ms/media-hub/
├── Dockerfile                  # Multi-stage: Node 20 (Vite) + PHP 8.3 CLI
├── docker-compose.yml          # MongoDB (27017), MinIO (9000/9001), Media Hub (8080)
├── composer.json               # Dependencias PHP y scripts
├── package.json                # Dependencias Vue 3, Inertia y Tailwind
├── vite.config.js              # Bundle Vite con entrypoint resources/js/app.js
│
├── app/
│   ├── Http/Controllers/
│   │   ├── HealthController.php        # Semáforo de salud /api/health
│   │   ├── MediaAssetController.php    # Listado, filtrado y subida de afiches < 5MB
│   │   └── TicketController.php        # Terminal POS y visualizador de boletos
│   ├── Models/
│   │   ├── DigitalTicket.php           # Modelo ODM de boletos y auditoría de canje
│   │   └── MediaAsset.php              # Modelo ODM de afiches y miniaturas
│   ├── Services/
│   │   ├── CryptoSignatureService.php  # Firma y verificación HMAC-SHA256
│   │   ├── CandyRedemptionService.php  # Bloqueo atómico contra doble canje
│   │   └── MinioStorageService.php     # Cliente S3, Presigned URLs y Thumbnails
│   └── Jobs/
│       └── GenerateTicketSagaJob.php   # Consumidor RabbitMQ de evento order.paid.event
│
├── database/seeders/
│   └── MediaHubDatabaseSeeder.php      # Datos de prueba para afiches y boletos
│
├── resources/
│   ├── views/app.blade.php             # Layout HTML raíz con @inertia
│   └── js/
│       ├── app.js                      # Entrypoint de Inertia / Vue 3
│       ├── Components/                 # Badges, modales, toasts y visor in-app
│       └── Pages/                      # Media/Index.vue y POS/CandyScan.vue
│
├── routes/
│   ├── web.php                         # Rutas web Inertia
│   └── api.php                         # Endpoints REST internos
│
└── tests/                              # 6 Suites consolidadas en tests/run_all.php
```

---

## 3. Comandos de Verificación y Ejecución

```bash
# 1. Compilación de Assets Frontend
npm run build

# 2. Ejecución de la Batería Completa de Pruebas (6 Suites, 23 Casos)
php tests/run_all.php

# 3. Validación de Docker Compose Soberano
docker compose config

# 4. Levantamiento de Contenedores Locales
docker compose up -d
```
