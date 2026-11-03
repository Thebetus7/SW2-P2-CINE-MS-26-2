import io
import base64
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app

client = TestClient(app)

def create_base64_jpeg(width: int = 400, height: int = 600, color=(190, 110, 40)) -> str:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def test_classify_poster_endpoint_success():
    b64_img = create_base64_jpeg(width=600, height=900, color=(200, 120, 50))
    response = client.post("/api/vision/classify-poster", json={
        "filename": "desert_movie.jpg",
        "image_base64": b64_img
    })
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "SUCCESS"
    assert res_data["data"]["original_resolution"] == "600x900"
    assert res_data["data"]["processed_dimensions"] == "224x224"
    assert len(res_data["data"]["suggested_tags"]) > 0

def test_classify_poster_endpoint_empty_payload():
    response = client.post("/api/vision/classify-poster", json={
        "filename": "empty.jpg",
        "image_base64": ""
    })
    assert response.status_code == 400
