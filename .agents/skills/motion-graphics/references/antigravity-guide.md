# Guía de Adaptación de HyperFrames Motion Graphics para Google Antigravity

Esta guía documenta la traducción y equivalencia de operaciones entre la especificación genérica (diseñada originalmente para Bash/macOS) y el entorno de ejecución de **Google Antigravity en Windows**.

---

## 1. Tabla de Equivalencias de Entorno y Herramientas

| Concepto Genérico / Bash | Equivalencia Oficial en Google Antigravity | Razón Técnica |
| :--- | :--- | :--- |
| `(cd "$PROJECT_DIR" && ...)` | `run_command` con parámetro `Cwd = "videos/<project>"` | PowerShell en Windows no soporta la sintaxis de subshell de Bash `(cd ... && ...)`. |
| `mkdir -p` | `New-Item -ItemType Directory -Force` (o automático en tools) | Compatibilidad nativa de shell en Windows. |
| API Keys para Generación de Imágenes (`GEMINI_API_KEY`) | Herramienta nativa `generate_image` | Antigravity posee capacidad de síntesis visual nativa sin exigir tokens adicionales. |
| Inspección manual de Studio | `browser_subagent` sobre `http://localhost:3000` | Permite al agente interactuar con el visor interactivo de HyperFrames. |
| Slash Command `/motion-graphics` | `.agents/workflows/motion-graphics.md` | Registra el comando slash en el autocompletado y catálogo del chat. |

---

## 2. Comandos Esenciales en PowerShell para Antigravity

### 2.1 Inicialización de un nuevo gráfico animado
```powershell
npx -y hyperframes init "videos/<nombre-proyecto>" --non-interactive --example=blank --skill=motion-graphics
```

### 2.2 Verificación de sintaxis y contrato GSAP
```powershell
# Ejecutado con Cwd = "videos/<nombre-proyecto>"
npx hyperframes check .
```

### 2.3 Renderizado a MP4 de alta calidad
```powershell
# Ejecutado con Cwd = "videos/<nombre-proyecto>"
npx hyperframes render . --skill=motion-graphics -q high -o ./renders/video.mp4
```

### 2.4 Renderizado a WebM Transparente (Overlay para web o transmisiones)
```powershell
# Ejecutado con Cwd = "videos/<nombre-proyecto>"
npx hyperframes render . --skill=motion-graphics --format webm -o ./renders/overlay.webm
```
