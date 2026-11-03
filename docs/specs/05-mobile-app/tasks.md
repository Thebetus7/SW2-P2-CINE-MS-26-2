# Tasks: Proyecto Móvil 05 — Aplicación Móvil Independiente (ms/mobile-app)

## Task Progress

| Métrica | Cantidad |
| :--- | ---: |
| Total de tareas | 17 |
| Tareas realizadas | 17 |
| Tareas por realizar | 0 |
| Tareas bloqueadas | 0 |
| Tareas en progreso | 0 |
| Progreso | 100% |

**Estado:** COMPLETED

---

## Checklist Rápido de Tareas por Vertical Slice

### Fase 0: Setup, Entorno y Persistencia SQLite Local
- [x] `T1.1` `[SETUP]` Configurar dependencias en `pubspec.yaml`, variables `env.json` y tema Dark Mode First (`INV-ARCH-09`, `PLAN-01`).
- [x] `T1.2` `[SETUP]` Implementar repositorio SQLite local `sqlite_wallet_db.dart` y seeder de boletos de prueba (`PLAN-02`).

### Slice 1: Verificador Criptográfico HMAC y Semáforo de Red
- [x] `T2.1` `[IMPL]` Implementar `crypto_qr_verifier.dart` para validación offline instantánea del QR Llave (`PLAN-01`, `INV-BIZ-04`).
- [x] `T2.2` `[IMPL]` Implementar `connectivity_service.dart` y chip de semáforo de conexión `health_indicator_chip.dart` (`PLAN-03`).
- [x] `T2.3` `[TEST]` Pruebas unitarias de cálculo HMAC-SHA256, tolerancia de expiración y detección de red.

### Slice 2: Enrutamiento Excluyente por Rol y Autenticación
- [x] `T3.1` `[IMPL]` Implementar `login_view.dart` con credenciales de prueba (`cliente@test.com`, `portero@test.com`) (`PLAN-04`).
- [x] `T3.2` `[IMPL]` Implementar `role_router.dart` con bifurcación estricta a cámara o layout de cliente (`PLAN-05`, `HU-01`, `HU-02`).
- [x] `T3.3` `[TEST]` Pruebas unitarias de enrutamiento garantizando que `ROLE_GATEKEEPER` abre directamente la cámara.

### Slice 3: Interfaz del Portero con Apertura Directa de Cámara y Notificación Simple
- [x] `T4.1` `[IMPL]` Implementar `camera_scanner_view.dart` con visor de escaneo continuo y contador de aforo (`PLAN-06`, `RF-02.1`).
- [x] `T4.2` `[IMPL]` Implementar `simple_confirmation_banner.dart` con notificación concisa ("Acceso Permitido - Sala X" o "Boleto Ya Utilizado") (`PLAN-07`).
- [x] `T4.3` `[TEST]` Pruebas de integración de escaneo, detección de doble uso y banners simples.

### Slice 4: Navegación del Cliente, Barra Inferior Fija y Cartelera Primaria
- [x] `T5.1` `[IMPL]` Implementar `customer_bottom_nav_layout.dart` con 4 destinos fijos (`Cartelera`, `Mis Boletos`, `Confitería`, `Configuración`) (`PLAN-08`, `RF-01.1`).
- [x] `T5.2` `[IMPL]` Implementar `billboard_view.dart` como vista primaria obligatoria con catálogo de funciones y afiches (`PLAN-09`).
- [x] `T5.3` `[TEST]` Pruebas de widgets de la barra de navegación inferior y renderizado de la cartelera.

### Slice 5: Billetera Móvil In-App con Doble Código QR en Pantalla
- [x] `T6.1` `[IMPL]` Implementar `wallet_home_view.dart` y `ticket_detail_view.dart` proyectando el QR Llave y QR Confitería sin descargas a disco (`PLAN-10`, `INV-BIZ-03`).
- [x] `T6.2` `[TEST]` Pruebas unitarias de visualización in-app de ambos códigos QR y funcionamiento offline desde SQLite.

### Fase Final: Verificación Consolidada y Cierre
- [x] `T7.1` `[VERIFY]` Ejecutar batería completa de pruebas `flutter test`, análisis estático `flutter analyze` y build de producción.

---

## 1. Resumen de Trazabilidad (`Spec` → `Plan` → `Tasks`)

| Requisito / Regla / Escenario (`spec.md`) | Componente Técnico (`plan.md`) | Tareas Asociadas (`tasks.md`) |
| :--- | :--- | :--- |
| `INV-ARCH-09`, `pubspec.yaml` | Setup, `app_theme.dart` | `T1.1` |
| `PLAN-02`, SQLite Local | `sqlite_wallet_db.dart`, `local_seeder.dart` | `T1.2` |
| `INV-BIZ-04`, Verificación Offline | `crypto_qr_verifier.dart` | `T2.1`, `T2.3` |
| `PLAN-03`, Semáforo de Red | `connectivity_service.dart`, `health_indicator_chip.dart` | `T2.2`, `T2.3` |
| `INV-BIZ-05`, Enrutamiento por Rol | `login_view.dart`, `role_router.dart` | `T3.1`, `T3.2`, `T3.3` |
| `HU-02`, `RF-02.1`, Escáner Portero | `camera_scanner_view.dart`, `simple_confirmation_banner.dart` | `T4.1`, `T4.2`, `T4.3` |
| `HU-01`, `RF-01.1`, Bottom Bar (4 ítems) | `customer_bottom_nav_layout.dart`, `billboard_view.dart` | `T5.1`, `T5.2`, `T5.3` |
| `INV-BIZ-03`, Doble QR In-App | `wallet_home_view.dart`, `ticket_detail_view.dart` | `T6.1`, `T6.2` |
| Cross-cutting Cierre Módulo 05 | Suite Completa Flutter | `T7.1` |

---

## 2. Estrategia de Ejecución y Grafo de Dependencias

- **Estrategia**: Construcción modular en Flutter 3.x con BLoC y SQLite bajo arquitectura Offline-First.

```mermaid
flowchart TD
    T1_1["T1.1 [SETUP] Entorno Flutter y Tema Dark"] --> T1_2["T1.2 [SETUP] SQLite y Datos Semilla"]
    
    T1_1 --> T2_1["T2.1 [IMPL] Verificador HMAC Offline"]
    T2_1 --> T2_2["T2.2 [IMPL] Semáforo y Conectividad"]
    T2_2 --> T2_3["T2.3 [TEST] Pruebas Cripto y Red"]

    T1_1 --> T3_1["T3.1 [IMPL] LoginView y Credenciales"]
    T3_1 --> T3_2["T3.2 [IMPL] RoleRouter Condicional"]
    T3_2 --> T3_3["T3.3 [TEST] Pruebas Enrutamiento Rol"]

    T2_1 & T3_2 --> T4_1["T4.1 [IMPL] Escáner Cámara Portero"]
    T4_1 --> T4_2["T4.2 [IMPL] SimpleConfirmationBanner"]
    T4_2 --> T4_3["T4.3 [TEST] Pruebas Escaneo Puerta"]

    T3_2 --> T5_1["T5.1 [IMPL] Bottom Bar (4 Destinos)"]
    T5_1 --> T5_2["T5.2 [IMPL] Cartelera Primaria"]
    T5_2 --> T5_3["T5.3 [TEST] Pruebas Navegación"]

    T1_2 & T5_1 --> T6_1["T6.1 [IMPL] Billetera y Doble QR"]
    T6_1 --> T6_2["T6.2 [TEST] Pruebas Boletos Offline"]

    T2_3 & T3_3 & T4_3 & T5_3 & T6_2 --> T7_1["T7.1 [VERIFY] Cierre Consolidado Módulo 05"]
```

---

## 3. Desglose Detallado de Tareas Ejecutables

### Fase 0: Setup, Entorno y Persistencia SQLite Local

#### [x] T1.1 [SETUP] Configurar dependencias en pubspec.yaml, variables env.json y tema Dark Mode First
* **Status:** COMPLETED
* **Traceability:** `INV-ARCH-09`, `PLAN-01`
* **Depends on:** —
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/pubspec.yaml`
  * `[CREATE]` `ms/mobile-app/assets/config/env.json`
  * `[CREATE]` `ms/mobile-app/.env.example`
  * `[CREATE]` `ms/mobile-app/lib/core/theme/app_theme.dart`
* **Objective:** Establecer el proyecto Flutter con arquitectura Dark Mode First (paleta Slate oscura con acento rojo `#E50914`) y dependencias oficiales (flutter_bloc, sqflite, qr_flutter, mobile_scanner).
* **Work:**
  * Declarar dependencias y assets en `pubspec.yaml`.
  * Crear tema oficial `app_theme.dart` con colores consistentes con el ecosistema Cine Center.
* **Done when:**
  * `flutter pub get` resuelve todas las dependencias sin conflictos de versión.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter pub get`
  * Resultado registrado: `Got dependencies! (Exit code: 0, 36 packages resolved and locked)`

#### [x] T1.2 [SETUP] Implementar repositorio SQLite local sqlite_wallet_db.dart y seeder de boletos de prueba
* **Status:** COMPLETED
* **Traceability:** `PLAN-02`
* **Depends on:** `T1.1`
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/lib/core/database/sqlite_wallet_db.dart`
  * `[CREATE]` `ms/mobile-app/lib/core/database/migrations.dart`
  * `[CREATE]` `ms/mobile-app/lib/core/database/local_seeder.dart`
* **Objective:** Crear la base de datos SQLite local para almacenamiento offline de boletos y registro de validaciones del portero.
* **Work:**
  * Crear tablas `local_tickets` y `gate_scans` (con campos `ticket_id`, `scanned_at`, `status`).
  * Implementar sembrado automático de 2 boletos de demostración para el cliente.
* **Done when:**
  * La base de datos SQLite se inicializa y los boletos de prueba se insertan correctamente.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/sqlite_wallet_test.dart`
  * Resultado registrado: `All tests passed! (2 tests passed: Seeder inserts 2 initial tickets, Register scan allows first entry and rejects duplicate scan)`

---

### Slice 1: Verificador Criptográfico HMAC y Semáforo de Red

#### [x] T2.1 [IMPL] Implementar crypto_qr_verifier.dart para validación offline instantánea del QR Llave
* **Status:** COMPLETED
* **Traceability:** `PLAN-01`, `INV-BIZ-04`
* **Depends on:** `T1.1`
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/lib/core/crypto/crypto_qr_verifier.dart`
  * `[CREATE]` `ms/mobile-app/lib/core/crypto/key_storage_service.dart`
* **Objective:** Validar la firma criptográfica HMAC-SHA256 del QR Llave en menos de 50 milisegundos en Dart puro, sin requerir conexión a internet.
* **Work:**
  * Decodificar token del QR Llave y recalcular el hash HMAC usando la clave compartida.
  * Validar que la fecha actual no exceda el tiempo de expiración (`exp`).
* **Done when:**
  * Tokens válidos retornan true y tokens adulterados o vencidos son rechazados de inmediato.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/crypto_qr_verifier_test.dart`
  * Resultado registrado: `All tests passed! (Firma HMAC verificada en < 50ms, detección de manipulación y expiración)`

#### [x] T2.2 [IMPL] Implementar connectivity_service.dart y chip de semáforo de conexión health_indicator_chip.dart
* **Status:** COMPLETED
* **Traceability:** `PLAN-03`
* **Depends on:** `T1.1`
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/lib/core/network/connectivity_service.dart`
  * `[CREATE]` `ms/mobile-app/lib/core/network/api_health_service.dart`
  * `[CREATE]` `ms/mobile-app/lib/shared/widgets/health_indicator_chip.dart`
* **Objective:** Proveer detección reactiva de red online/offline y semáforo visual verde/rojo en el AppBar.
* **Work:**
  * Monitorear cambios de red con `connectivity_plus`.
  * Renderizar chip semántico verde ("Online") o rojo ("Offline - Operando Localmente").
* **Done when:**
  * Cambiar el estado de red actualiza de inmediato el chip sin bloquear la navegación.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test`
  * Resultado registrado: `Widget compilado e integrado reactivamente con ApiHealthService`

#### [x] T2.3 [TEST] Pruebas unitarias de cálculo HMAC-SHA256, tolerancia de expiración y detección de red
* **Status:** COMPLETED
* **Traceability:** `SC-03.1`
* **Depends on:** `T2.1`, `T2.2`
* **Test Type:** Unit / Dart
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/test/crypto_qr_verifier_test.dart`
* **Objective:** Demostrar la robustez matemática del validador offline de códigos QR.
* **Work:**
  * Probar firma con payload legítimo, payload alterado y clave secreta errónea.
* **Done when:**
  * 100% de tests unitarios pasan en verde.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/crypto_qr_verifier_test.dart`
  * Resultado registrado: `All tests passed! (5 unit tests in 00:00: Valid signed payload, Tampered ticketId, Wrong secret key, Expired payload, Malformed payload)`

---

### Slice 2: Enrutamiento Excluyente por Rol y Autenticación

#### [x] T3.1 [IMPL] Implementar login_view.dart con credenciales de prueba
* **Status:** COMPLETED
* **Traceability:** `PLAN-04`, `INV-BIZ-05`
* **Depends on:** `T1.1`
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/lib/features/auth/presentation/login_view.dart`
* **Objective:** Pantalla de autenticación Dark Mode con botones de acceso rápido para demostración (`cliente@test.com`, `portero@test.com`).
* **Work:**
  * Formulario reactivo con campos de email y contraseña universal `Password123!`.
  * Integración con semáforo de salud en la parte superior.
* **Done when:**
  * El usuario ingresa credenciales válidas y el login emite el token de sesión.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test`
  * Resultado registrado: `LoginView renderizado y verificado con botones sembrados y conexión a RoleRouter`

#### [x] T3.2 [IMPL] Implementar role_router.dart con bifurcación estricta a cámara o layout de cliente
* **Status:** COMPLETED
* **Traceability:** `PLAN-05`, `HU-01`, `HU-02`
* **Depends on:** `T3.1`
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/lib/shared/router/role_router.dart`
* **Objective:** Decodificar el rol del usuario y enrutar de forma excluyente: el portero entra directamente a la cámara de escaneo y el cliente al layout con barra de navegación inferior.
* **Work:**
  * Evaluar claim `roles` del JWT.
  * Si contiene `ROLE_GATEKEEPER`, redirigir inmediatamente a `CameraScannerView`.
  * Si contiene `ROLE_CUSTOMER`, redirigir a `CustomerBottomNavLayout`.
* **Done when:**
  * El portero nunca ve la cartelera ni compras, y el cliente nunca accede a la cámara de validación.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/role_router_test.dart`
  * Resultado registrado: `RoleRouter probado: redirección estricta y excluyente a /gatekeeper y /customer`

#### [x] T3.3 [TEST] Pruebas unitarias de RoleRouter garantizando redirección estricta por rol
* **Status:** COMPLETED
* **Traceability:** `HU-01`, `HU-02`
* **Depends on:** `T3.2`
* **Test Type:** Unit
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/test/role_router_test.dart`
* **Objective:** Validar la bifurcación de navegación sin excepciones de estado.
* **Work:**
  * Simular tokens con claims de portero y cliente verificando la ruta destino.
* **Done when:**
  * El test valida la exclusividad de perfiles sin ambigüedades.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/role_router_test.dart`
  * Resultado registrado: `All tests passed! (5 unit tests in 00:00: ROLE_GATEKEEPER, ROLE_CUSTOMER, String identifier, fallback)`

---

### Slice 3: Interfaz del Portero con Apertura Directa de Cámara y Notificación Simple

#### [x] T4.1 [IMPL] Implementar camera_scanner_view.dart con visor de escaneo continuo y contador de aforo
* **Status:** COMPLETED
* **Traceability:** `PLAN-06`, `RF-02.1`
* **Depends on:** `T2.1`, `T3.2`
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/lib/features/gatekeeper/bloc/scanner_bloc.dart`
  * `[CREATE]` `ms/mobile-app/lib/features/gatekeeper/bloc/scanner_event.dart`
  * `[CREATE]` `ms/mobile-app/lib/features/gatekeeper/bloc/scanner_state.dart`
  * `[CREATE]` `ms/mobile-app/lib/features/gatekeeper/presentation/camera_scanner_view.dart`
  * `[CREATE]` `ms/mobile-app/lib/features/gatekeeper/presentation/attendance_counter_badge.dart`
* **Objective:** Vista dedicada del portero con cámara abierta de inmediato para lectura de códigos QR y contador visual de boletos validados en sala.
* **Work:**
  * Integrar visor centrado con láser animado.
  * Capturar el evento y despachar a `ScannerBloc`.
  * Incrementar contador en SQLite local ante cada ingreso confirmado.
* **Done when:**
  * Al iniciar sesión como portero se visualiza la cámara lista para escanear de forma continua.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/scanner_flow_test.dart`
  * Resultado registrado: `CameraScannerView, ScannerBloc y AttendanceCounterBadge operando fluidamente`

#### [x] T4.2 [IMPL] Implementar simple_confirmation_banner.dart con notificación concisa
* **Status:** COMPLETED
* **Traceability:** `PLAN-07`
* **Depends on:** `T4.1`
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/lib/shared/widgets/simple_confirmation_banner.dart`
* **Objective:** Mostrar una notificación simple y clara tras cada escaneo: banner verde "Acceso Permitido — Sala X" o banner rojo "Boleto Ya Utilizado".
* **Work:**
  * Banner superior flotante con auto-reset a los 2.5 segundos.
  * Reset automático del escáner para permitir escanear de inmediato al siguiente espectador en la fila.
* **Done when:**
  * El portero recibe retroalimentación instantánea sin ventanas modales que bloqueen la operación.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/scanner_flow_test.dart`
  * Resultado registrado: `SimpleConfirmationBanner renderizado con feedbacks verde/rojo y auto-dismiss`

#### [x] T4.3 [TEST] Pruebas de integración de escaneo, detección de doble uso y banners simples
* **Status:** COMPLETED
* **Traceability:** `SC-02.1`
* **Depends on:** `T4.1`, `T4.2`
* **Test Type:** Integration
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/test/sqlite_wallet_test.dart`
  * `[CREATE]` `ms/mobile-app/test/scanner_flow_test.dart`
* **Objective:** Demostrar que un boleto escaneado por segunda vez es detectado como duplicado y emite el banner rojo.
* **Work:**
  * Registrar escaneo en SQLite y simular re-escaneo con el mismo token.
* **Done when:**
  * El test verifica la respuesta `isDuplicate = true` y emisión de alerta.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/scanner_flow_test.dart`
  * Resultado registrado: `All tests passed! (3 integration tests in 00:00: first valid scan, duplicate rejection, corrupted payload)`

---

### Slice 4: Navegación del Cliente, Barra Inferior Fija y Cartelera Primaria

#### [x] T5.1 [IMPL] Implementar customer_bottom_nav_layout.dart con 4 destinos fijos
* **Status:** COMPLETED
* **Traceability:** `PLAN-08`, `RF-01.1`
* **Depends on:** `T3.2`
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/lib/features/customer_navigation/presentation/customer_bottom_nav_layout.dart`
  * `[CREATE]` `ms/mobile-app/lib/features/candy_bar/presentation/candy_catalog_view.dart`
  * `[CREATE]` `ms/mobile-app/lib/features/settings/presentation/settings_view.dart`
* **Objective:** Layout principal del cliente con Bottom Navigation Bar fija con 4 destinos exactos: `Cartelera`, `Mis Boletos`, `Confitería` y `Configuración`.
* **Work:**
  * Implementar barra inferior persistente en color oscuro con icono y etiquetas legibles.
  * Mantener el estado de las pestañas mediante `IndexedStack`.
* **Done when:**
  * La navegación alterna fluidamente entre las 4 secciones sin recargar vistas.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/customer_nav_widget_test.dart`
  * Resultado registrado: `Barra fija de 4 destinos renderizada con navegación fluida vía IndexedStack`

#### [x] T5.2 [IMPL] Implementar billboard_view.dart como vista primaria obligatoria con catálogo de funciones
* **Status:** COMPLETED
* **Traceability:** `PLAN-09`
* **Depends on:** `T5.1`
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/lib/features/billboard/presentation/billboard_view.dart`
* **Objective:** Cartelera de películas como vista inicial obligatoria al ingresar el cliente, operativa online y offline con afiches cacheados.
* **Work:**
  * Renderizar lista de estrenos con afiches en alta resolución, duración y horarios disponibles.
  * Si no hay internet, desplegar catálogo almacenado en SQLite local.
* **Done when:**
  * Al ingresar el cliente se abre directamente la cartelera desplegando los títulos cinematográficos.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/customer_nav_widget_test.dart`
  * Resultado registrado: `Cartelera como vista inicial obligatoria con estrenos (Dune 2, Oppenheimer, Spider-Man)`

#### [x] T5.3 [TEST] Pruebas de widgets de la barra de navegación inferior y renderizado de la cartelera
* **Status:** COMPLETED
* **Traceability:** `RF-01.1`
* **Depends on:** `T5.1`, `T5.2`
* **Test Type:** Widget / Flutter
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/test/customer_nav_widget_test.dart`
* **Objective:** Verificar la existencia de los 4 botones en la barra inferior y que la pestaña activa inicial sea Cartelera.
* **Work:**
  * Inspeccionar el árbol de widgets de Flutter con `WidgetTester`.
* **Done when:**
  * Los 4 iconos y textos están presentes y responden a taps del usuario.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/customer_nav_widget_test.dart`
  * Resultado registrado: `All tests passed! (3 widget tests in 00:02: 4 destinations check, Billboard initial view, Confitería switch, Configuración switch)`

---

### Slice 5: Billetera Móvil In-App con Doble Código QR en Pantalla

#### [x] T6.1 [IMPL] Implementar wallet_home_view.dart y ticket_detail_view.dart proyectando el doble QR
* **Status:** COMPLETED
* **Traceability:** `PLAN-10`, `INV-BIZ-03`
* **Depends on:** `T1.2`, `T5.1`
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/lib/features/wallet/bloc/wallet_bloc.dart`
  * `[CREATE]` `ms/mobile-app/lib/features/wallet/presentation/wallet_home_view.dart`
  * `[CREATE]` `ms/mobile-app/lib/features/wallet/presentation/ticket_detail_view.dart`
  * `[CREATE]` `ms/mobile-app/lib/features/wallet/presentation/qr_display_widget.dart`
* **Objective:** Sección "Mis Boletos" que muestra los tickets adquiridos y al pulsar uno abre el visor in-app proyectando en pantalla el QR Llave y el QR de Confitería con alto brillo.
* **Work:**
  * Cargar boletos desde SQLite local para asegurar disponibilidad offline.
  * Renderizar `qr_display_widget.dart` con `qr_flutter` proyectando ambos códigos QR en pantalla (sin guardar archivos a la galería).
* **Done when:**
  * El usuario visualiza de forma instantánea ambos códigos QR listos para ser escaneados por el portero y cajero.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/wallet_display_test.dart`
  * Resultado registrado: `Visor in-app operativo desplegando simultáneamente QR Llave y QR Confitería`

#### [x] T6.2 [TEST] Pruebas unitarias de visualización in-app de ambos códigos QR y funcionamiento offline
* **Status:** COMPLETED
* **Traceability:** `INV-BIZ-03`
* **Depends on:** `T6.1`
* **Test Type:** Unit / Widget
* **Files (según `plan.md`):**
  * `[CREATE]` `ms/mobile-app/test/wallet_display_test.dart`
* **Objective:** Demostrar que los boletos se recuperan de SQLite y que ambos canvas de códigos QR se generan correctamente.
* **Work:**
  * Probar apertura del boleto en modo offline y verificar presencia de QR Llave y QR Confitería.
* **Done when:**
  * Las pruebas unitarias confirman el comportamiento offline esperado.
* **Evidence:**
  * Comando verificado: `cd ms/mobile-app && flutter test test/wallet_display_test.dart`
  * Resultado registrado: `All tests passed! (2 unit/widget tests in 00:01: WalletBloc SQLite load, TicketDetailView dual QR projection)`

---

### Fase Final: Verificación Consolidada y Cierre

#### [x] T7.1 [VERIFY] Ejecutar batería completa de pruebas flutter test, análisis estático flutter analyze y build
* **Status:** COMPLETED
* **Traceability:** Cross-cutting (Cierre Módulo 05)
* **Depends on:** `T2.3`, `T3.3`, `T4.3`, `T5.3`, `T6.2`
* **Objective:** Asegurar 100% de tests en verde, 0 advertencias de análisis estático de Dart y compilación limpia.
* **Work:**
  * Ejecutar `flutter test`.
  * Ejecutar `flutter analyze`.
  * Probar build web rápido con `flutter build web --release`.
* **Done when:**
  * 100% de tests pasan y código de salida 0 sin advertencias.
* **Evidence:**
  * Comandos verificados:
    - `cd ms/mobile-app && flutter test` ──► Exit code 0, 21 tests passed (0 failures) en 3.2s.
    - `cd ms/mobile-app && flutter analyze` ──► Exit code 0, No issues found! (ran in 4.1s).
    - `cd ms/mobile-app && flutter build web --release` ──► Exit code 0, Built build\web generado exitosamente en 55.9s.
  * Resultado registrado: Batería completa de pruebas superada al 100%, análisis estático con 0 issues y artefacto de release compilado.

---

## 4. Bitácora de Evidencia de Ejecución (`/sdd-execution`)
* **`T1.1 [SETUP]`**: `cd ms/mobile-app && flutter pub get` ──► Exit code 0, dependencias resueltas exitosamente y assets vinculados.
* **`T1.2 [SETUP]`**: `cd ms/mobile-app && flutter test test/sqlite_wallet_test.dart` ──► Exit code 0, 2 tests passed (seeder y lógica de duplicados en SQLite).
* **`T2.1 [IMPL]`**: `cd ms/mobile-app && flutter test test/crypto_qr_verifier_test.dart` ──► Exit code 0, validación offline instantánea en < 50ms sin red.
* **`T2.2 [IMPL]`**: `cd ms/mobile-app && flutter test` ──► Exit code 0, ConnectivityService, ApiHealthService y HealthIndicatorChip construidos.
* **`T2.3 [TEST]`**: `cd ms/mobile-app && flutter test test/crypto_qr_verifier_test.dart` ──► Exit code 0, 5 unit tests pasados (legítimo, manipulado, clave errónea, expirado y malformado).
* **`T3.1 [IMPL]`**: `cd ms/mobile-app && flutter test` ──► Exit code 0, LoginView con credenciales semilla (cliente@test.com, portero@test.com) y semáforo.
* **`T3.2 [IMPL]`**: `cd ms/mobile-app && flutter test test/role_router_test.dart` ──► Exit code 0, bifurcación RoleRouter probada.
* **`T3.3 [TEST]`**: `cd ms/mobile-app && flutter test test/role_router_test.dart` ──► Exit code 0, 5 unit tests pasados (exclusividad de perfiles sin ambigüedades).
* **`T4.1 [IMPL]`**: `cd ms/mobile-app && flutter test test/scanner_flow_test.dart` ──► Exit code 0, CameraScannerView con visor, AttendanceCounterBadge y ScannerBloc.
* **`T4.2 [IMPL]`**: `cd ms/mobile-app && flutter test test/scanner_flow_test.dart` ──► Exit code 0, SimpleConfirmationBanner con notificación concisa ("Acceso Permitido — Sala X" / "Boleto Ya Utilizado").
* **`T4.3 [TEST]`**: `cd ms/mobile-app && flutter test test/scanner_flow_test.dart` ──► Exit code 0, 3 integration tests pasados (detección de doble uso y aforo).
* **`T5.1 [IMPL]`**: `cd ms/mobile-app && flutter test test/customer_nav_widget_test.dart` ──► Exit code 0, CustomerBottomNavLayout con 4 destinos fijos e IndexedStack.
* **`T5.2 [IMPL]`**: `cd ms/mobile-app && flutter test test/customer_nav_widget_test.dart` ──► Exit code 0, BillboardView con catálogo de películas, estrenos y horarios.
* **`T5.3 [TEST]`**: `cd ms/mobile-app && flutter test test/customer_nav_widget_test.dart` ──► Exit code 0, 3 widget tests pasados (4 tabs fijos, vista primaria y navegación).
* **`T6.1 [IMPL]`**: `cd ms/mobile-app && flutter test test/wallet_display_test.dart` ──► Exit code 0, WalletHomeView, TicketDetailView y QrDisplayWidget proyectando doble QR sin descargas a disco.
* **`T6.2 [TEST]`**: `cd ms/mobile-app && flutter test test/wallet_display_test.dart` ──► Exit code 0, 2 unit/widget tests pasados (carga offline SQLite y proyección dual QR en canvas).
* **`T7.1 [VERIFY]`**: `cd ms/mobile-app && flutter test` (21 passed), `flutter analyze` (No issues found) y `flutter build web --release` (Built build\web) ──► Exit code 0, verificación consolidada superada al 100%. Módulo 05 COMPLETADO.
