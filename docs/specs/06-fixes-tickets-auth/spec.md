# Specification: Mejoras de Taquilla Web, Billetera Digital, Gestión de Sesión y Terminal POS (Fixes & Enhancements)

> **Estado:** APPROVED  
> **Módulo:** `06-fixes-tickets-auth`  
> **Metodología:** SDD-Spec-Assisted  
> **Módulos Impactados:** `02-ticketing-auth`, `03-media-hub`, `05-mobile-app`  
> **Gobernanza:** Subordinado a [docs/constitution.md](docs/constitution.md)

---

## 1. Objetivo y Alcance

- **Objetivo de Negocio**: Optimizar la experiencia de usuario y eliminar fricciones en el flujo de compra y atención en mostrador, dotando al cliente de un portal web fluido sin notificaciones intrusivas, un módulo permanente de "Mis Boletos" con códigos QR reales y lectura óptica fiable (sin placeholders engañosos), control ágil de sesiones mediante un menú de configuración con cierre de sesión explícito, y una terminal POS de mostrador para cajeros profesional, moderna y ergonómica que supere la apariencia de HTML crudo.
- **In-Scope**:
  1. **Autenticación Limpia y Natural (Web)**: Supresión total de ventanas emergentes bloqueantes de bienvenida al iniciar sesión en el portal de cliente.
  2. **Control de Sesión y Configuración de Perfil (Web)**: Incorporación de un componente de usuario autenticado en la barra superior con menú desplegable de Configuración que ofrece el subbotón explícito "Cerrar Sesión", permitiendo alternar entre identidades y roles sin reiniciar el navegador.
  3. **Erradicación de Placeholders y Emisión de QR Reales (Web)**: Sustitución de los caracteres de bloques Unicode por renderizado dinámico de códigos QR reales (QR Llave de acceso a sala y QR de canje de confitería). En caso de pérdida de conectividad o falla con el servicio de taquilla, bloqueo total de la pantalla de emisión y despliegue del estado de desconexión sin simular éxito ficticio.
  4. **Módulo Web Permanente "Mis Boletos" (Web)**: Creación de la vista accesible y persistente `/mis-tickets` que lista las entradas del cliente autenticado, con soporte para estado vacío (*Zero-State* con llamada a la acción hacia la cartelera), persistencia local híbrida para consulta offline y visor in-app de detalle.
  5. **Confirmación y Trazabilidad del Módulo Móvil (App Flutter)**: Certificación de que la app móvil ya dispone del módulo de billetera (`WalletHomeView`) y botón de cierre de sesión en configuración, asegurando compatibilidad del modelo de datos de boletos.
  6. **Rediseño y Estilización Completa de la Terminal POS de Cajero (Media Hub)**: Transformación visual y funcional de la interfaz de canje en mostrador (`/pos/candy-scan`), implementando una hoja de estilos completa, paleta *Dark Mode First*, teclado táctil numérico, panel de lectura rápida con escáner láser y monitor de auditoría en vivo.
- **Out-of-Scope**:
  - Pasarelas de pago reales fuera de Stripe Sandbox.
  - Reembolsos o cancelaciones voluntarias solicitadas por clientes (`INV-BIZ-01`).
  - Descarga de archivos PDF o imágenes al sistema de archivos local del cliente (`INV-BIZ-04`).

---

## 2. Actores y Autorización

- **Cliente (`ROLE_CUSTOMER`)**:
  - Inicia sesión sin popups invasivos de bienvenida.
  - Accede a su menú de Configuración para visualizar su perfil y cerrar sesión.
  - Compra boletos recibiendo códigos QR reales (o mensaje de desconexión si el servicio no responde).
  - Consulta su historial de entradas en cualquier momento a través del módulo web "Mis Boletos" (`/mis-tickets`).
- **Cajero de Taquilla / Confitería (`ROLE_CASHIER`)**:
  - Opera la Terminal POS de mostrador en una interfaz estilizada con soporte táctil, lector óptico y validación en tiempo real.
  - Redime combos de confitería previniendo doble canje atómicamente.
- **Personal de Gestión (`ROLE_MANAGER`, `ROLE_SUPERADMIN`)**:
  - Al iniciar sesión en el portal centralizado, es transferido de forma transparente al Portal de Administración sin alertas bloqueantes.
- **Visitante Anónimo**:
  - Explora la cartelera pública; al intentar acceder a "Mis Boletos" o reservar asientos es invitado a autenticarse.

---

## 3. Modelo Funcional de Datos y Reglas de Negocio Específicas

### 3.1 Datos Conceptuales Requeridos

- **Boleto Emitido / Entrada Digital (`DigitalTicket`)**:
  - `Identificador`: Cadena única alfanumérica (ej. `TCK-BOL-9923`).
  - `Título de Película`: Nombre de la obra cinematográfica.
  - `Sala y Formato`: Nombre de la sala y tecnología de proyección (ej. `Sala 1 IMAX Laser`).
  - `Función`: Fecha y hora de exhibición.
  - `Butacas`: Lista de códigos de butaca (ej. `["A3", "A4"]`).
  - `Detalle de Confitería`: Objeto opcional con nombre de combo y lista de productos comestibles.
  - `Monto Total`: Valor entero positivo en centavos/moneda local.
  - `Payload QR Llave`: Cadena criptográfica firmada para validación de acceso a sala.
  - `Payload QR Confitería`: Token de canje único para mostrador de dulces.
  - `Fecha de Emisión`: Marca de tiempo UTC en formato ISO-8601.
  - `Email del Cliente`: Identificador del comprador titular.

- **Sesión de Usuario (`ActiveUserSession`)**:
  - `Email`: Dirección de correo del usuario activo.
  - `Rol`: Perfil del usuario (`ROLE_CUSTOMER`, `ROLE_CASHIER`, `ROLE_MANAGER`, `ROLE_SUPERADMIN`).
  - `Token de Autorización`: Credencial de acceso activa.

### 3.2 Reglas de Negocio (RB)

- **`RB-06.1` (Silencio en Autenticación Exitosa)**: El sistema nunca debe interrumpir el flujo del usuario con cuadros de diálogo emergentes bloqueantes (`alert`) anunciando su bienvenida o su perfil. La retroalimentación debe ser puramente visual y no intrusiva (actualización del indicador de perfil y transición fluida a la vista de destino).
- **`RB-06.2` (Cierre de Sesión Explícito y Limpieza de Estado)**: Todo usuario autenticado debe poder pulsar "Cerrar Sesión" dentro del submenú de Configuración. Esta acción debe:
  1. Purgar la sesión activa en memoria y las credenciales de navegación.
  2. Restablecer la barra de navegación al estado de visitante anónimo ("Iniciar Sesión").
  3. Redirigir al usuario a la Cartelera Pública (`/`).
- **`RB-06.3` (Erradicación Absoluta de Placeholders de QR)**: Queda terminantemente prohibido el uso de caracteres Unicode o imágenes estáticas de marcador de posición para simular códigos QR. Los códigos QR deben ser generados a partir de los datos criptográficos recibidos del servicio de taquilla.
- **`RB-06.4` (Comportamiento Estricto ante Fallo de Backend en Compra)**: Si el servicio de taquilla no responde o devuelve un error durante el procesamiento de la orden:
  1. El sistema no debe emitir ningún boleto ni mostrar la vista de éxito.
  2. Debe mantenerse al usuario en la vista de compra con un aviso visible y destacado: *"No se pudo conectar al servicio de taquilla. No se ha realizado ningún cobro."*
  3. El temporizador de butacas debe pausarse o alertar de la pérdida de comunicación.
- **`RB-06.5` (Disponibilidad Permanente de "Mis Boletos" en Web)**: El cliente autenticado debe contar con un enlace permanente en la cabecera ("Mis Boletos") para navegar a `/mis-tickets`.
  1. Si existen compras registradas para su correo, se despliegan en tarjetas interactivas ordenadas cronológicamente.
  2. Al pulsar sobre una tarjeta, se abre el modal de detalle proyectando el QR Llave y el QR de Confitería reales.
  3. Si el cliente no registra compras, se activa el estado *Zero-State* con botón directo a la cartelera.
- **`RB-06.6` (Arquitectura Visual Profesional para Terminal POS de Mostrador)**: La pantalla del cajero (`/pos/candy-scan`) debe operar con estilos completos de alto contraste, tipografía moderna monoespaciada para códigos y botones táctiles ergonómicos (mínimo 48px de alto para pantallas táctiles de mostrador), erradicando cualquier aspecto de HTML sin diseño.

---

## 4. Máquina de Estados

### 4.1 Ciclo de Sesión Web del Usuario
- **Estado Inicial**: `ANONYMOUS` (Visitante con botón "Iniciar Sesión").
- **Transición 1**: `ANONYMOUS` $\rightarrow$ Ingreso de credenciales válidas $\rightarrow$ `AUTHENTICATED` (Actualización de avatar/correo y activación de menú de Configuración).
- **Transición 2**: `AUTHENTICATED` $\rightarrow$ Clic en "Cerrar Sesión" $\rightarrow$ `ANONYMOUS` (Limpieza total de sesión y retorno a cartelera).

### 4.2 Proceso de Compra y Generación de Códigos QR
- **Estado Inicial**: `HOLDING_SEATS` (Butacas seleccionadas y temporizador activo).
- **Transición Exitosa**: `HOLDING_SEATS` $\rightarrow$ Confirmación de orden exitosa en backend $\rightarrow$ `TICKET_ISSUED` (Generación de QR reales y registro en "Mis Boletos").
- **Transición Fallida**: `HOLDING_SEATS` $\rightarrow$ Error de conexión o rechazo del servicio $\rightarrow$ `CHECKOUT_ERROR` (Pantalla de error explícita, sin emisión de boleto ni generación de QR ficticios).

---

## 5. Requerimientos Funcionales (Patrón EARS)

### HU-01: Autenticación Limpia y Cierre de Sesión Ágil
*Como usuario del portal web, quiero autenticarme sin popups intrusivos y contar con un submenú de Configuración para cerrar sesión, de modo que pueda alternar de cuenta y rol de forma práctica.*

- **`RF-01.1` (Event-Driven)**: Cuando el usuario ingresa sus credenciales y se valida su identidad, el sistema deberá actualizar la barra superior con los datos del usuario y navegar fluidamente a la vista correspondiente sin desplegar alertas bloqueantes de bienvenida.
- **`RF-01.2` (Ubiquitous)**: El sistema deberá presentar en la cabecera del portal un botón o menú de "Configuración" visible exclusivamente para usuarios con sesión activa.
- **`RF-01.3` (Event-Driven)**: Cuando el usuario pulsa el subbotón "Cerrar Sesión" dentro del menú de Configuración, el sistema deberá eliminar la sesión activa, restablecer los botones de navegación a su estado anónimo y dirigir al usuario a la Cartelera Pública.

### HU-02: Emisión Confiable de Entradas sin Códigos QR Falsos
*Como cliente comprador, quiero que al pagar mi entrada se muestren códigos QR reales y que, ante fallos de conexión, se me informe con claridad sin mostrar marcadores de posición engañosos.*

- **`RF-02.1` (Event-Driven)**: Cuando la transacción de compra es aprobada por el microservicio de taquilla, el sistema deberá generar y renderizar dinámicamente en pantalla los códigos QR reales correspondientes al QR Llave de acceso a sala y al QR de canje de confitería a partir de los datos recibidos.
- **`RF-02.2` (Unwanted Behavior)**: Si la comunicación con el servicio de taquilla falla o devuelve un error de red durante la compra, el sistema deberá impedir la apertura de la pantalla de boleto emitido, suprimir cualquier imagen de marcador de posición y desplegar un mensaje visible de advertencia informando que no hubo conexión con el backend.

### HU-03: Módulo Web de "Mis Boletos"
*Como cliente comprador, quiero una sección dedicada donde pueda consultar todas mis entradas compradas en la web con sus códigos QR correspondientes en cualquier momento.*

- **`RF-03.1` (Ubiquitous)**: El sistema deberá proveer un destino de navegación "Mis Boletos" (`/mis-tickets`) accesible desde la barra superior para usuarios autenticados con rol de cliente.
- **`RF-03.2` (Event-Driven)**: Cuando el cliente ingresa a "Mis Boletos", el sistema deberá listar todas las entradas adquiridas por su cuenta, ordenadas desde la más reciente.
- **`RF-03.3` (Event-Driven)**: Cuando el cliente pulsa sobre una entrada de la lista, el sistema deberá abrir un visor interactivo que proyecta el título de la película, sala, butacas, QR Llave real y QR de Confitería real.
- **`RF-03.4` (Ubiquitous)**: Si el cliente no posee entradas compradas, el sistema deberá presentar un estado vacío (*Zero-State*) con un mensaje amigable y un botón de acción principal para ir a la Cartelera.
- **`RF-03.5` (Unwanted Behavior)**: Si un visitante no autenticado intenta acceder a la sección "Mis Boletos", el sistema deberá redirigirlo a la pantalla de inicio de sesión.

### HU-04: Modernización de la Terminal POS de Confitería para Cajero
*Como cajero de mostrador, quiero operar una terminal POS rápida con interfaz estilizada, soporte táctil y validación instantánea para atender ágilmente a los clientes sin fallas visuales de estilo.*

- **`RF-04.1` (Ubiquitous)**: La interfaz de la terminal POS (`/pos/candy-scan`) deberá cargar con una hoja de estilos completa bajo estética *Dark Mode*, tipografía legible y diseño adaptable a monitores táctiles de mostrador.
- **`RF-04.2` (Event-Driven)**: Cuando el cajero escanea o ingresa un código de confitería válido, el sistema deberá proyectar una confirmación visual en verde con el detalle exacto de los productos a entregar.
- **`RF-04.3` (Unwanted Behavior)**: Si el código ingresado ya fue redimido previamente, el sistema deberá bloquear la entrega y desplegar una alerta visual en rojo indicando la hora, caja y cajero que procesó el canje anterior.
- **`RF-04.4` (Ubiquitous)**: La terminal POS deberá incluir un panel lateral con el registro en vivo de todos los canjes completados durante el turno de atención.

---

## 6. Comportamiento Observable y Criterios de Aceptación (Gherkin)

### Escenario 1: Inicio y Cierre de Sesión Limpio sin Popups (Happy Path)
```gherkin
Given que el usuario se encuentra en la pantalla de inicio de sesión "/login"
When ingresa el correo "cliente@test.com" y contraseña correcta y presiona "Ingresar"
Then el sistema actualiza la cabecera mostrando el perfil de "cliente@test.com"
And no se despliega ninguna ventana emergente o alerta bloqueante de bienvenida
When el usuario abre el menú de "Configuración" en la cabecera
And presiona el subbotón "Cerrar Sesión"
Then la sesión activa es eliminada
And la cabecera vuelve a mostrar el botón "Iniciar Sesión"
And el usuario es retornado a la Cartelera Pública
```

### Escenario 2: Compra Exitosa con Renderizado de QR Reales (Sin Placeholders)
```gherkin
Given que un cliente autenticado ha seleccionado 2 butacas en la función de "Gladiator II"
And el microservicio de taquilla responde satisfactoriamente a la solicitud de cobro
When el cliente presiona "Confirmar Compra"
Then el sistema transiciona a la vista de boleto confirmado
And se generan y renderizan en pantalla los códigos QR reales para Sala y Confitería
And ningún caracter de bloque o imagen estática de marcador de posición es visible
And la orden queda guardada en el historial de "Mis Boletos" del cliente
```

### Escenario 3: Fallo de Conectividad con el Backend en Taquilla (Manejo de Error)
```gherkin
Given que un cliente intenta confirmar la compra de sus butacas
And el microservicio de taquilla no responde o experimenta un corte de conexión
When el cliente presiona "Confirmar Compra"
Then el sistema no navega a la pantalla de boleto emitido
And el sistema no genera códigos QR ficticios
And se despliega un mensaje destacado de alerta: "No se pudo conectar al Backend de Taquilla"
And los asientos seleccionados permanecen retenidos hasta la expiración del temporizador
```

### Escenario 4: Consulta de "Mis Boletos" con Estado Vacío y Detalle Interactivo
```gherkin
Given que un cliente con sesión activa ingresa a "/mis-tickets"
When el cliente no ha comprado ninguna entrada previamente
Then se muestra el estado vacío con el mensaje "Aún no tienes boletos comprados"
And se presenta un botón prominente "Explorar Cartelera"
When el cliente realiza una compra posterior y vuelve a "/mis-tickets"
Then se visualiza la tarjeta de la nueva entrada con película, horario y butacas
When el cliente pulsa sobre la tarjeta del boleto
Then se abre el modal proyectando los códigos QR reales con contraste optimizado
```

### Escenario 5: Operación de Terminal POS de Cajero con Estilos Completos
```gherkin
Given que el cajero accede a la terminal POS en "/pos/candy-scan"
Then la pantalla carga con diseño Dark Mode completo, sin elementos HTML sin estilo
When el cajero ingresa un código de confitería activo mediante teclado o lector óptico
And presiona "Canjear"
Then se proyecta el recuadro de confirmación verde con los productos a despachar
And el canje se agrega inmediatamente al panel de auditoría de canjes en turno
```

---

## 7. Efectos Secundarios e Integraciones

- **Sincronización de Identidad**: El cambio de cuenta mediante "Cerrar Sesión" asegura que las compras realizadas queden estrictamente aisladas por correo de cliente, evitando mezclar boletos entre usuarios.
- **Interoperabilidad Móvil-Web**: Los datos de boletos emitidos y validados utilizan estructuras homologadas con el motor SQLite y verificador HMAC de `ms/mobile-app`, garantizando que un boleto comprado en web pueda ser visualizado y validado en la app móvil.
- **Integración con Terminal POS**: Los vouchers de confitería emitidos en las compras web alimentan el catálogo de canje atómico en `ms/media-hub/pos/candy-scan`, asegurando consistencia e impidiendo el doble despacho de productos.

