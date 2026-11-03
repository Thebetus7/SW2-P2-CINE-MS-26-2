# Specification: Módulo Vertical 04 — Servicio de Inteligencia Artificial y Servidor MCP (ms/ai-mcp)

> **Estado:** APPROVED  
> **Módulo:** `04-ai-mcp`  
> **Ubicación en Monorepo:** `/ms/ai-mcp` — *Repositorio Git Autónomo (Servicio Backend Headless)*  
> **Nube Asignada:** Google Cloud Platform (GCP - Levantamiento Estándar con Docker)  
> **Arquitectura:** Microservicio Cognitivo Headless (FastAPI + Servidor MCP + TensorFlow + OpenPyXL)  
> **Consumidores:** Portal de Administración Unificado (`ms/cinema-core/frontend`) y servicios del ecosistema  
> **Metodología:** SDD-Spec-Extended (Model Context Protocol, Dark Mode First y Gobernanza Estricta)  
> **Gobernanza:** Subordinado a [docs/constitution.md](docs/constitution.md)

---

## 1. Objetivo y Alcance del Módulo

- **Objetivo de Negocio**: Proveer un **motor cognitivo headless** de Inteligencia Artificial para el ecosistema CineCenter, compatible con el estándar **Model Context Protocol (MCP)**, modelos predictivos de Machine Learning, visión por computadora con Deep Learning para afiches cinematográficos, y motor de ensamblado de libros de cálculo en Microsoft Excel (.xlsx).
- **Enfoque de Integración Unificada**: **Este módulo no dispone de una consola o playground técnico independiente para el usuario final**. Todas sus capacidades analíticas, de procesamiento de lenguaje natural por voz/texto y de generación de reportes son consumidas de manera transparente por la **Interfaz Completa de Administración (`http://localhost:4200/admin`)**, brindando al administrador una experiencia amigable, ejecutiva y completamente integrada en un solo software.
- **In-Scope (Servicio Headless `ms/ai-mcp`)**:
  - Servidor FastAPI (Python 3.11) en el puerto `8001` conforme a la especificación oficial MCP.
  - Catálogo de herramientas MCP tipadas mediante esquemas Pydantic v2 inmutables.
  - Sanitizador léxico y semántico (`SecuritySanitizer`) contra Prompt Injection y SQL/NoSQL Injection (`INV-ARCH-07`, `RB-04.1`).
  - **Manejador de Dominio y Orientación**: Detección de consultas fuera del ámbito cinematográfico (ej: clima, noticias ajenas) emitiendo respuestas orientativas sin fallar con error 500.
  - Inferencia visual de afiches JPEG con TensorFlow sin descartes por resolución (`RB-04.2`), clasificando géneros y retornando tags con nivel de certeza.
  - Inferencia predictiva de demanda de funciones con Scikit-Learn.
  - Generador de reportes tabulares en Microsoft Excel (.xlsx) con OpenPyXL (encabezados corporativos, totales destacados, sin gráficos nativos pesados).
  - Servicio de transcripción STT para procesar notas de voz emitidas desde el Portal de Admin.
  - Endpoint de salud (`/health`) para semáforo visual en el Portal de Admin.
- **Out-of-Scope**:
  - Consolas técnicas o playgrounds aislados para desarrolladores (la interacción es 100% a través de la Interfaz de Admin).
  - Modificación directa de bases de datos mediante SQL crudo (las mutaciones se canalizan por los módulos dueños de los datos).
  - Descarga física de afiches fuera de MinIO S3.

---

## 2. Protocolo MCP y Catálogo de Tools Tipadas con Pydantic

El servidor expone herramientas conformes a la especificación oficial de MCP consumidas por el Portal de Administración:

| Nombre de Herramienta MCP | Parámetros Tipados (Pydantic) | Descripción Operativa y Retorno |
| :--- | :--- | :--- |
| `get_occupancy_report` | `complex_id: str`, `start_date: date`, `end_date: date` | Computa porcentaje de ocupación por sala y turnos horarios. |
| `get_revenue_breakdown` | `start_date: date`, `end_date: date`, `include_candy_bar: bool` | Desglosa ingresos brutos de taquilla y confitería en centavos. |
| `predict_showtime_demand` | `movie_id: str`, `hall_type: str`, `day_of_week: int`, `hour: int` | Inferencia Scikit-Learn: Retorna predicción de butacas vendidas y tasa esperada de ocupación (0.0 a 1.0). |
| `classify_movie_poster` | `poster_storage_path: str` | Carga el archivo JPEG desde MinIO, ejecuta modelo TensorFlow y retorna array de géneros (`tags`) y `confidence_score`. |
| `build_excel_export` | `report_type: str`, `data_matrix: List[Dict[str, Any]]` | Construye el archivo binario `.xlsx` con texto tabular formateado, encabezados corporativos y totales en negrita. |

---

## 3. Seguridad, Sanitización y Guía Fuera de Dominio (`RB-04.1`)

- **Filtro de Entrada (`SecuritySanitizer`)**: Todo texto de usuario pasa por verificación léxica estricta contra inyecciones y jailbreaks.
- **Manejo de Consultas Fuera de Dominio**: Si la consulta no coincide con ninguna herramienta o solicita información ajena (ej: *"¿Cuál es el pronóstico del clima?"*), el agente no falla con error interno 500; emite una respuesta estructurada concisa:
  > *"Esta consulta está fuera del dominio cinematográfico. Puedes consultar: ocupación de salas, recaudación por complejo, predicción de asistencia o clasificación de afiches."*

---

## 4. Procesamiento de Pósters JPEG con TensorFlow (`RB-04.2`)

- **Pipeline de Decodificación**: Se utiliza `tf.io.decode_jpeg` para decodificar imágenes directamente sin descarte por resolución ni umbrales de DPI.
- **Inferencia de Géneros**: El modelo procesa la imagen redimensionada internamente a 224x224 y devuelve los 3 géneros predominantes con sus puntuaciones de confianza (ej: `["Acción": 0.94, "Aventura": 0.88, "Ciencia Ficción": 0.72]`). Esta información se envía al Portal de Admin al momento de registrar la película.

---

## 5. Centralización de Variables de Entorno Preconfiguradas (.env.*) [INV-ARCH-09]

- **`ms/ai-mcp/.env.example` / `.env`**:
  - `API_PORT=8001`
  - `MINIO_ENDPOINT=http://localhost:9000`
  - `MINIO_ACCESS_KEY=minioadmin`
  - `MINIO_SECRET_KEY=minioadmin`
  - `MINIO_BUCKET=cinema-media`
  - `MODEL_WEIGHTS_PATH=app/ml/weights/poster_cnn.h5`
  - `ENVIRONMENT=development`

---

## 6. Requerimientos Funcionales del Servicio (Patrón EARS)

- **`HU-01`**: Como Servicio de IA, quiero procesar consultas en lenguaje natural provenientes del Portal de Admin para ejecutar la herramienta MCP adecuada y devolver datos tabulares.
  - `RF-01.1`: **Event-Driven**: Al recibir una petición POST `/api/mcp/execute-prompt`, el servicio sanitizará el prompt, determinará la intención y ejecutará la herramienta MCP tipada.
- **`HU-02`**: Como Servicio de IA, quiero estructurar los reportes en libros Excel (.xlsx) para que el Administrador los descargue con formato corporativo profesional.
  - `RF-02.1`: **Event-Driven**: Cuando se solicite la exportación, el servicio utilizará OpenPyXL para generar el archivo binario con totales calculados y devolverá la URL temporal de descarga.
- **`HU-03`**: Como Servicio de IA, cuando un Administrador suba un afiche de película, quiero clasificarlo automáticamente mediante TensorFlow sin rechazar imágenes por resolución.
  - `RF-03.1`: **Event-Driven**: Al recibir la ruta del afiche en MinIO, el pipeline TensorFlow analizará los tensores y devolverá las etiquetas de género predictivas.

---

## 7. Criterios de Aceptación (Gherkin BDD del Servicio)

### Escenario 1: Ejecución de herramienta MCP de recaudación semanal
```gherkin
Given que el Portal de Admin envía un prompt "Reporte de recaudación semanal por complejo"
When el servicio FastAPI recibe la petición POST en "/api/mcp/execute-prompt"
Then el SecuritySanitizer valida que el prompt no contiene inyecciones
And el DomainGuidanceService confirma que la consulta pertenece al dominio
And el servidor MCP ejecuta la herramienta "get_revenue_breakdown"
And OpenPyXL genera el archivo temporal "reporte-recaudacion.xlsx" con totales destacados
And el servicio responde 200 OK con el dataset tabular y la URL de descarga
```

### Escenario 2: Orientación amigable ante consulta fuera de dominio
```gherkin
Given que el usuario envía una consulta "Dime la receta de una hamburguesa"
When el servicio evalúa la consulta en el DomainGuidanceService
Then el servicio detecta que está fuera del ámbito cinematográfico
And retorna un código estructurado DOMAIN_GUIDANCE
And el mensaje orienta amigablemente: "Esta consulta está fuera del dominio cinematográfico..."
And no se genera error 500 en el servidor
```

### Escenario 3: Clasificación automática de póster JPEG con TensorFlow
```gherkin
Given que el Administrador subió un póster JPEG a MinIO en "posters/gladiator2.jpg"
When el servicio recibe la solicitud en "/api/vision/classify-poster"
Then el pipeline de TensorFlow decodifica los bytes de la imagen sin descarte por resolución
And retorna las etiquetas con su grado de confianza (ej: Acción: 0.92, Drama: 0.85)
```
