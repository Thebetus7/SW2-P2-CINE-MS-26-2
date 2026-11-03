"""
app/seed.py: Seeder de datos de demostración, prompts canónicos y catálogo de pesos para ai-mcp.
"""
from typing import Dict, List, Any

CANONICAL_PROMPTS: List[Dict[str, Any]] = [
    {
        "id": "prompt-01",
        "category": "revenue",
        "text": "Generar balance de recaudación consolidada por complejo y sala",
        "expected_tool": "revenue_tool",
    },
    {
        "id": "prompt-02",
        "category": "occupancy",
        "text": "¿Cuál es la ocupación promedio de las salas VIP y MacroXE en La Paz?",
        "expected_tool": "occupancy_tool",
    },
    {
        "id": "prompt-03",
        "category": "candy",
        "text": "Reporte de ventas de confitería y ratio de conversión respecto a boletos",
        "expected_tool": "revenue_tool",
    },
    {
        "id": "prompt-04",
        "category": "prediction",
        "text": "Predecir demanda de boletos para el próximo fin de semana",
        "expected_tool": "demand_predictor_tool",
    },
]

DEMO_DATASET: Dict[str, Any] = {
    "complexes": ["Cine Center Central (La Paz)", "Cine Center Norte (Santa Cruz)"],
    "metrics": {
        "total_tickets_sold": 1970,
        "total_revenue_bs": 146450.0,
        "candy_revenue_bs": 51500.0,
        "avg_occupancy_percent": 91.2,
    }
}

def get_canonical_prompts() -> List[Dict[str, Any]]:
    return CANONICAL_PROMPTS

def get_demo_dataset() -> Dict[str, Any]:
    return DEMO_DATASET

if __name__ == "__main__":
    print(f"Seed cargado: {len(CANONICAL_PROMPTS)} prompts canónicos listos.")
