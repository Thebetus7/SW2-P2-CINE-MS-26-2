from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title="Cine Center AI & MCP Service",
    description="Servicio Cognitivo Headless y Servidor MCP para Cine Center (Puerto 8001)",
    version="1.4.0",
)

# Configuración de CORS para permitir peticiones desde el Portal Admin (:4200) y el Portal Cliente (:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
