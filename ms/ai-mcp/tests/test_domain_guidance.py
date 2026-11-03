import pytest
from app.core.domain_guidance_service import DomainGuidanceService

def test_guidance_accepts_valid_cinema_queries():
    valid_queries = [
        "¿Cuál fue la recaudación de la película Dune en la sala 1?",
        "Muéstrame la ocupación de las butacas del fin de semana",
        "Generar reporte de ventas de confitería y pipocas",
        "Predecir demanda de boletos para los estrenos del viernes",
    ]

    for q in valid_queries:
        response = DomainGuidanceService.evaluate_query(q)
        assert response.is_in_domain is True
        assert response.detected_topic == "Gestión Cinematográfica"

def test_guidance_detects_out_of_domain_topics_and_provides_suggestions():
    out_of_domain = [
        ("¿Cómo preparar una receta de pastel de chocolate?", "Gastronomía"),
        ("¿Qué dice mi horóscopo para hoy signo géminis?", "Astrología"),
        ("¿Quién ganará las elecciones presidenciales?", "Política"),
        ("Escribe un código java para ordenar un array", "Programación General"),
    ]

    for query, expected_topic in out_of_domain:
        response = DomainGuidanceService.evaluate_query(query)
        assert response.is_in_domain is False
        assert response.detected_topic == expected_topic
        assert len(response.suggested_actions) > 0
        assert "fuera del ámbito de operaciones" in response.guidance_message

def test_guidance_handles_unrecognized_queries_with_fallback_options():
    response = DomainGuidanceService.evaluate_query("xyz random completely meaningless statement abc 123")
    assert response.is_in_domain is False
    assert response.detected_topic == "Consulta Desconocida"
    assert len(response.suggested_actions) == 4
