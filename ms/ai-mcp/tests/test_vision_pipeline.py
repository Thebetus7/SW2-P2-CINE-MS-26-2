import io
import pytest
from PIL import Image
from app.ml.tf_poster_pipeline import PosterClassificationPipeline

def create_dummy_jpeg(width: int, height: int, color=(200, 120, 50)) -> bytes:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_pipeline_accepts_low_resolution_image_without_discarding():
    # Imagen baja resolución (300x400)
    low_res_bytes = create_dummy_jpeg(300, 400, color=(180, 120, 30))
    result = PosterClassificationPipeline.process_and_classify_image_bytes(
        low_res_bytes, filename="dune_low_res.jpg"
    )

    assert result["original_resolution"] == "300x400"
    assert result["processed_dimensions"] == "224x224"
    assert result["confidence_score"] > 0.8
    assert len(result["suggested_tags"]) > 0

def test_pipeline_accepts_4k_ultra_hd_image_without_discarding():
    # Imagen 4K (3840x2160)
    uhd_bytes = create_dummy_jpeg(3840, 2160, color=(20, 20, 30))
    result = PosterClassificationPipeline.process_and_classify_image_bytes(
        uhd_bytes, filename="horror_movie_4k.jpg"
    )

    assert result["original_resolution"] == "3840x2160"
    assert result["processed_dimensions"] == "224x224"
    assert result["predicted_genre"] == "Terror / Suspenso"
    assert "#Terror" in result["suggested_tags"]

def test_pipeline_rejects_empty_bytes():
    with pytest.raises(ValueError, match="está vacío"):
        PosterClassificationPipeline.process_and_classify_image_bytes(b"")
