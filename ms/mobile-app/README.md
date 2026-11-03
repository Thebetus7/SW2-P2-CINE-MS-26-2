# Módulo 05: Aplicación Móvil Independiente (`ms/mobile-app`)

> **Ecosistema:** Aplicación Móvil Híbrida Multiplataforma (Flutter 3.x & Dart)  
> **Arquitectura:** Offline-First + SQLite + Criptografía HMAC-SHA256 en Dart + BLoC Pattern  
> **Gobernanza:** Subordinado a [`docs/constitution.md`](../../docs/constitution.md) y [`docs/specs/05-mobile-app/`](../../docs/specs/05-mobile-app/)

---

## 1. Visión y Propósito del Módulo

**Cine Center Mobile App** es la aplicación móvil del complejo diseñada con capacidades **Offline-First**, permitiendo operar tanto con conexión como en condiciones de red degradada o ausente. Implementa dos modos de experiencia según el rol del usuario:

1. **Clientes (`ROLE_CUSTOMER`)**:
   - Barra de navegación inferior (**Bottom Navigation Bar**) con 4 pestañas: `Cartelera`, `Mis Boletos`, `Confitería` y `Configuración`.
   - **Billetera Local de Boletos**: Proyección en pantalla simultánea del **QR Llave** (acceso a sala) y **QR de Confitería** (canje en mostrador), sin necesidad de descargar archivos PDF a la galería del dispositivo.
   - Sincronización transparente de compras con el backend cuando hay conectividad.

2. **Porteros y Validadores (`ROLE_GATEKEEPER`)**:
   - Apertura directa e instantánea de la interfaz de cámara para escaneo continuo de boletos en sala.
   - **Validación Criptográfica Offline en < 50ms**: Comprobación de firma HMAC-SHA256 (`CryptoQrVerifier`) y prevención de doble ingreso mediante SQLite local sin depender de internet.
   - Notificación visual inmediata: *"Acceso Permitido — Sala X"* o *"Boleto Ya Utilizado"*.
   - Contador de aforo de sala en tiempo real.

---

## 2. Pila Tecnológica

- **Framework**: Flutter 3.38+ / Dart 3.10+
- **Gestión de Estado**: BLoC Pattern (`flutter_bloc: ^8.1.3`)
- **Persistencia Local Offline**: SQLite (`sqflite: ^2.3.0` / `path_provider`)
- **Criptografía de Firma**: HMAC-SHA256 en Dart puro (`crypto: ^3.0.3`)
- **Generación de Códigos QR**: `qr_flutter: ^4.1.0`
- **Detección de Red**: `connectivity_plus`, `http`

---

## 3. Prerrequisitos de Entorno

- **Flutter SDK**: Versión 3.x estable instalada y añadida al PATH del sistema (`flutter doctor` en verde).
- **Entorno de Ejecución (Al menos uno)**:
  - Dispositivo físico Android conectado por USB con modo depuración activado.
  - Emulador de Android (Google Pixel / AVD) en Android Studio.
  - Navegador Google Chrome (para ejecución en modo Web de pruebas rápidas).
  - Soporte Desktop de Windows (`flutter config --enable-windows-desktop`).

---

## 4. Configuración de Entorno y Variables (`.env`)

Crear el archivo `.env` en la raíz de `ms/mobile-app` a partir de `.env.example`:

```bash
# ms/mobile-app/.env
APP_NAME=Cine Center Mobile
APP_ENV=development
API_BASE_URL=http://localhost:8082/api
AUTH_HEALTH_URL=http://localhost:8082/actuator/health
HMAC_SECRET_KEY=cine_center_hmac_secret_2026_super_secure_key_offline_verification
SYNC_INTERVAL_SECONDS=30
```

> [!IMPORTANT]
> **Nota para Emuladores de Android:**  
> Cuando ejecutes la app en el emulador oficial de Android Studio, la máquina local no es `localhost`, sino la IP especial `10.0.2.2`. Si deseas conectar el emulador a los backends de tu PC, configura:  
> `API_BASE_URL=http://10.0.2.2:8082/api`

---

## 5. Instrucciones de Levantamiento y Ejecución

Desde el directorio `ms/mobile-app`:

### Paso 1: Instalar dependencias de Flutter
```bash
cd ms/mobile-app
flutter pub get
```

### Paso 2: Listar los dispositivos disponibles
```bash
flutter devices
```
Identifica el identificador del dispositivo (ej. `chrome`, `windows`, o el identificador del emulador Android).

### Paso 3: Ejecutar la aplicación en modo desarrollo
```bash
# Ejecutar en el dispositivo predeterminado:
flutter run

# O especificar el dispositivo concreto:
flutter run -d chrome       # Modo web para pruebas rápidas de interfaz
flutter run -d windows      # Modo aplicación nativa de escritorio Windows
flutter run -d emulator-5554 # En emulador Android activo
```

### Paso 4: Compilación para Producción (Release)
```bash
# Generar paquete APK para Android
flutter build apk --release
```
El archivo compilado quedará ubicado en: `build/app/outputs/flutter-apk/app-release.apk`.

---

## 6. Credenciales de Prueba y Roles

| Rol Canónico | Usuario / Correo | Contraseña | Comportamiento en la App |
| :--- | :--- | :--- | :--- |
| **Portero / Validador (`ROLE_GATEKEEPER`)** | `portero@test.com` | `Password123!` | Abre directamente la cámara de escáner para validación offline continua. |
| **Cliente (`ROLE_CUSTOMER`)** | `cliente@test.com` | `Password123!` | Accede a la barra de navegación con Cartelera y Billetera de Boletos con doble QR. |

---

## 7. Comandos de Pruebas y Análisis Estático

```bash
cd ms/mobile-app

# 1. Batería completa de pruebas unitarias, de widgets y verificación criptográfica
flutter test

# 2. Análisis estático de linter y convenciones Dart
flutter analyze
```

---

## 8. Solución de Problemas Frecuentes (Troubleshooting)

- **Error: `Connection refused` al consultar el backend desde el emulador Android:**
  - **Causa:** El emulador intenta conectarse a su propio loopback al usar `localhost`.
  - **Solución:** Reemplaza `localhost` por `10.0.2.2` en la URL del backend (`http://10.0.2.2:8082`).
- **Error: Advertencias de dependencias desactualizadas o lockfiles incompatibles:**
  - **Solución:** Ejecuta `flutter clean && flutter pub get` para regenerar la caché local.
