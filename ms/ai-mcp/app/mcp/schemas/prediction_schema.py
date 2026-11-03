from typing import List
from pydantic import BaseModel

class DemandPredictionInput(BaseModel):
    movie_title: str
    genre: str
    target_weekend_date: str = "2026-10-24"
    screen_format: str = "IMAX"

class MoviePredictionOutput(BaseModel):
    movie_title: str
    expected_occupancy_percent: float
    predicted_tickets_sold: int
    confidence_score: float
    recommended_showtimes_count: int
    rationale: str

class DemandPredictionResult(BaseModel):
    target_weekend: str
    predictions: List[MoviePredictionOutput]
    global_weekend_demand_trend: str
