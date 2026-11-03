from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "ai-mcp",
        "port": settings.PORT,
        "environment": settings.ENVIRONMENT,
        "models_loaded": {
            "poster_pipeline": "ready",
            "security_sanitizer": "active",
            "mcp_tools": ["occupancy_tool", "revenue_tool", "demand_predictor_tool"]
        }
    }
