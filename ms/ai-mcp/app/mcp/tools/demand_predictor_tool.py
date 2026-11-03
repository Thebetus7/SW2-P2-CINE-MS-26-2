from app.mcp.schemas.prediction_schema import DemandPredictionInput, DemandPredictionResult, MoviePredictionOutput

def run_demand_predictor_tool(input_params: DemandPredictionInput) -> DemandPredictionResult:
    predictions = [
        MoviePredictionOutput(
            movie_title="Dune: Part Two",
            expected_occupancy_percent=96.5,
            predicted_tickets_sold=1120,
            confidence_score=0.94,
            recommended_showtimes_count=12,
            rationale="Alta retención de audiencia en salas IMAX y CXC con preventa activa sostenida."
        ),
        MoviePredictionOutput(
            movie_title="Gladiator II",
            expected_occupancy_percent=89.0,
            predicted_tickets_sold=840,
            confidence_score=0.91,
            recommended_showtimes_count=10,
            rationale="Creciente interés del público adulto en horarios nocturnos de fin de semana."
        ),
        MoviePredictionOutput(
            movie_title="Moana 2",
            expected_occupancy_percent=93.0,
            predicted_tickets_sold=980,
            confidence_score=0.95,
            recommended_showtimes_count=14,
            rationale="Pico de audiencia familiar en funciones matutinas y vespertinas de sábado y domingo."
        )
    ]

    return DemandPredictionResult(
        target_weekend=input_params.target_weekend_date,
        predictions=predictions,
        global_weekend_demand_trend="ALTA DEMANDA (+18% vs. fin de semana previo)"
    )
