import base64
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.ml.tf_poster_pipeline import PosterClassificationPipeline

router = APIRouter(prefix="/api/vision", tags=["Vision Inferences"])

class ClassifyPosterRequest(BaseModel):
    filename: Optional[str] = "poster.jpg"
    image_base64: str

@router.post("/classify-poster")
def classify_poster(payload: ClassifyPosterRequest):
    if not payload.image_base64 or not payload.image_base64.strip():
        raise HTTPException(status_code=400, detail="Debe proporcionar la imagen en formato base64.")

    try:
        raw_b64 = payload.image_base64.split(",")[-1] if "," in payload.image_base64 else payload.image_base64
        image_bytes = base64.b64decode(raw_b64)
        result = PosterClassificationPipeline.process_and_classify_image_bytes(
            image_bytes=image_bytes,
            filename=payload.filename or "poster.jpg"
        )
        return {
            "status": "SUCCESS",
            "data": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en inferencia visual: {str(e)}")
