import base64
from fastapi.testclient import TestClient
from app.main import app
from app.services.stt_service import SpeechToTextService

client = TestClient(app)

def test_stt_service_with_text_mock():
    res = SpeechToTextService.transcribe_text_mock("Reporte de ocupación general")
    assert res.success is True
    assert res.transcribed_text == "Reporte de ocupación general"
    assert res.confidence >= 0.95

def test_stt_service_with_audio_base64():
    dummy_b64 = base64.b64encode(b"RIFF....WAVEfmt ....data....").decode("utf-8")
    res = SpeechToTextService.transcribe_audio_base64(dummy_b64)
    assert res.success is True
    assert "reporte" in res.transcribed_text.lower()
    assert res.confidence > 0.9

def test_stt_service_empty_input_rejected():
    res = SpeechToTextService.transcribe_audio_base64("")
    assert res.success is False
    assert "no puede estar vacío" in res.error

def test_transcribe_endpoint():
    response = client.post("/api/mcp/transcribe", json={"text_mock": "Generar reporte de ocupación"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["transcribed_text"] == "Generar reporte de ocupación"
