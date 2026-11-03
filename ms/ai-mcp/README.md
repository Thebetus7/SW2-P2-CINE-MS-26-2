# Módulo 04: Servicio Headless de IA y Servidor MCP (`ms/ai-mcp`)

> **Nube Asignada:** Google Cloud Platform (GCP)  
> **Arquitectura:** Python 3.11 + FastAPI + Model Context Protocol (MCP) + TensorFlow + OpenPyXL  
> **Puerto Headless:** `8001`  
> **Gobernanza:** Subordinado a [`docs/constitution.md`](../../docs/constitution.md) y [`docs/specs/04-ai-mcp/`](../../docs/specs/04-ai-mcp/)

---

## 1. Visión y Propósito del Módulo

**AI & MCP Server** es un microservicio backend cognitivo headless diseñado para brindar capacidades avanzadas de Inteligencia Artificial al ecosistema Cine Center:

- **Servicio Headless (Sin UI Propietaria)**: Sus herramientas analíticas son consumidas de forma transparente por el **Portal de Administración Unificado** (`http://localhost:4200/admin`).
- **Servidor MCP (Model Context Protocol)**: Expone herramientas (*MCP Tools*) tipadas con Pydantic que permiten consultar métricas operativas y generar reportes analíticos sin exponer consultas SQL crudas.
- **Procesamiento y Validación de Pósters**: Inspección visual de afiches con Pillow/TensorFlow para clasificación y control de calidad.
- **Exportación de Reportes Financieros en Excel**: Ensamblado automatizado de libros de cálculo `.xlsx` formateados con OpenPyXL para gerencia y auditoría.

---

## 2. Puertos y Servicios Expuestos

| Servicio | Proceso / Contenedor | Puerto Local | URL / Endpoint Principal |
| :--- | :--- | :---: | :--- |
| **API FastAPI & Servidor MCP** | `cine_ai_mcp_service` | `8001` | `http://localhost:8001/` |
| **Documentación Swagger / OpenAPI** | Uvicorn Docs UI | `8001` | `http://localhost:8001/docs` |
| **Endpoint de Salud (Health Check)** | FastAPI REST | `8001` | `http://localhost:8001/health` |
| **Endpoint de Herramientas MCP** | Endpoint MCP Router | `8001` | `http://localhost:8001/api/mcp` |

---

## 3. Prerrequisitos de Entorno

- **Python**: Versión 3.11 o superior.
- **pip**: Gestor de paquetes de Python.
- **Docker & Docker Compose**: Versión 24.x o superior.

---

## 4. Variables de Entorno (`.env`)

Crear el archivo `.env` en la raíz de `ms/ai-mcp` a partir de `.env.example`:

```bash
# ms/ai-mcp/.env
PORT=8001
ENVIRONMENT=development
CINEMA_CORE_URL=http://localhost:3002
MEDIA_HUB_URL=http://localhost:8080
LOG_LEVEL=INFO
MODEL_DEVICE=cpu
MAX_POSTER_SIZE_MB=5
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
```

---

## 5. Instrucciones de Levantamiento

### Opción A: Levantamiento Contenerizado con Docker Compose (Recomendada)

Desde la raíz del módulo `ms/ai-mcp`:

```bash
# 1. Navegar al directorio del módulo
cd ms/ai-mcp

# 2. Levantar el microservicio headless
docker compose up -d

# 3. Comprobar estado del servicio
docker compose ps
```

> **Verificación Observable:** Abre en el navegador `http://localhost:8001/docs` para explorar la documentación interactiva Swagger de las herramientas MCP.

### Opción B: Levantamiento para Desarrollo Local con Entorno Virtual

```bash
cd ms/ai-mcp

# 1. Crear y activar el entorno virtual
python -m venv venv

# En Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# O en Windows (CMD):
.\venv\Scripts\activate.bat
# En Linux / macOS:
source venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Copiar archivo de entorno
cp .env.example .env

# 4. Iniciar el servidor Uvicorn en modo recarga en vivo
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```
> El microservicio quedará listo y escuchando en: `http://localhost:8001/`.

---

## 6. Comandos de Pruebas y Verificación

```bash
# Ejecutar suite de pruebas con PyTest
cd ms/ai-mcp
pytest
```

---

## 7. Solución de Problemas Frecuentes (Troubleshooting)

- **Error: Puerto `8001` en uso:**
  - **Causa:** Hay otro proceso o contenedor ocupando el puerto 8001.
  - **Solución:** Revisa con `docker compose ps` o busca el proceso con `netstat -ano | findstr :8001` y detén la instancia previa.
- **Error: Permisos al activar el entorno virtual en PowerShell (`ExecutionPolicy`):**
  - **Causa:** Política de ejecución restringida de PowerShell en Windows.
  - **Solución:** Ejecuta `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` antes de correr el script de activación.
