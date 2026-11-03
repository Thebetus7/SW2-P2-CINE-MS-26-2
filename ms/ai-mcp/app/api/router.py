from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.prompt_execution import router as prompt_router
from app.api.routes.vision_routes import router as vision_router
from app.api.routes.reports_routes import router as reports_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(prompt_router)
api_router.include_router(vision_router)
api_router.include_router(reports_router)
