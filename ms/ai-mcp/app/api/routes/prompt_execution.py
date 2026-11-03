from typing import Optional, List, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.security_sanitizer import SecuritySanitizer
from app.core.domain_guidance_service import DomainGuidanceService
from app.services.stt_service import SpeechToTextService
from app.mcp.schemas.occupancy_schema import OccupancyQueryInput
from app.mcp.schemas.revenue_schema import RevenueQueryInput
from app.mcp.schemas.prediction_schema import DemandPredictionInput
from app.mcp.tools.occupancy_tool import run_occupancy_tool
from app.mcp.tools.revenue_tool import run_revenue_tool
from app.mcp.tools.demand_predictor_tool import run_demand_predictor_tool

router = APIRouter(prefix="/api/mcp", tags=["MCP Operations"])

class ExecutePromptRequest(BaseModel):
    prompt: str
    confirm_action: Optional[bool] = False

class TranscribeRequest(BaseModel):
    audio_base64: Optional[str] = None
    text_mock: Optional[str] = None

@router.post("/transcribe")
def transcribe_audio(payload: TranscribeRequest):
    if payload.text_mock:
        res = SpeechToTextService.transcribe_text_mock(payload.text_mock)
        return res

    if payload.audio_base64:
        res = SpeechToTextService.transcribe_audio_base64(payload.audio_base64)
        return res

    raise HTTPException(status_code=400, detail="Debe proporcionar audio_base64 o text_mock.")

@router.post("/execute-prompt")
def execute_prompt(payload: ExecutePromptRequest):
    # 1. Sanitización de seguridad (RB-04.1)
    sanitization = SecuritySanitizer.sanitize_prompt(payload.prompt)
    if not sanitization.is_safe:
        return {
            "status": "BLOCKED",
            "is_safe": False,
            "rejection_reason": sanitization.rejection_reason,
            "flagged_threats": sanitization.flagged_threats
        }

    # 2. Evaluación de dominio (HU-03 / RB-04.1)
    guidance = DomainGuidanceService.evaluate_query(sanitization.sanitized_text)
    if not guidance.is_in_domain:
        return {
            "status": "OUT_OF_DOMAIN",
            "is_in_domain": False,
            "detected_topic": guidance.detected_topic,
            "message": guidance.guidance_message,
            "suggested_actions": guidance.suggested_actions
        }

    # 3. Enrutamiento a Tools MCP
    clean_prompt = sanitization.sanitized_text.lower()
    selected_tool = "revenue_tool"
    tool_output: Any = None

    if "ocupaci" in clean_prompt or "aforo" in clean_prompt or "butaca" in clean_prompt:
        selected_tool = "occupancy_tool"
        tool_output = run_occupancy_tool(OccupancyQueryInput())
    elif "predic" in clean_prompt or "demanda" in clean_prompt or "ia" in clean_prompt:
        selected_tool = "demand_predictor_tool"
        tool_output = run_demand_predictor_tool(DemandPredictionInput(
            movie_title="Estrenos Fin de Semana",
            genre="General"
        ))
    else:
        selected_tool = "revenue_tool"
        tool_output = run_revenue_tool(RevenueQueryInput())

    return {
        "status": "SUCCESS",
        "is_safe": True,
        "is_in_domain": True,
        "prompt_executed": sanitization.sanitized_text,
        "selected_tool": selected_tool,
        "confirmation_summary": f"Entendido: Consulta de {selected_tool} procesada con éxito.",
        "download_url": "/api/reports/download-excel",
        "data": tool_output
    }
