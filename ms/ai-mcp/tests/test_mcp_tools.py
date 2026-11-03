import pytest
from app.mcp.schemas.occupancy_schema import OccupancyQueryInput
from app.mcp.schemas.revenue_schema import RevenueQueryInput
from app.mcp.schemas.prediction_schema import DemandPredictionInput
from app.mcp.tools.occupancy_tool import run_occupancy_tool
from app.mcp.tools.revenue_tool import run_revenue_tool
from app.mcp.tools.demand_predictor_tool import run_demand_predictor_tool

def test_occupancy_tool_computes_average_and_totals():
    input_params = OccupancyQueryInput(format="ALL")
    result = run_occupancy_tool(input_params)

    assert result.total_active_seats == 1000
    assert result.total_sold_tickets == 918
    assert result.average_occupancy_percent == 91.8
    assert len(result.halls_breakdown) == 4

def test_occupancy_tool_filters_by_format():
    input_params = OccupancyQueryInput(format="IMAX")
    result = run_occupancy_tool(input_params)

    assert len(result.halls_breakdown) == 1
    assert result.halls_breakdown[0].projection_type == "IMAX"
    assert result.average_occupancy_percent == 95.0

def test_revenue_tool_computes_consolidated_monetary_metrics():
    input_params = RevenueQueryInput()
    result = run_revenue_tool(input_params)

    assert result.total_revenue_bs == 146450.0
    assert result.total_tickets_sold == 1970
    assert result.total_candy_bs == 51500.0
    assert len(result.items) == 3

def test_demand_predictor_tool_generates_weekend_predictions():
    input_params = DemandPredictionInput(
        movie_title="Dune: Part Two",
        genre="Ciencia Ficción",
        target_weekend_date="2026-10-24"
    )
    result = run_demand_predictor_tool(input_params)

    assert result.target_weekend == "2026-10-24"
    assert len(result.predictions) == 3
    assert result.predictions[0].expected_occupancy_percent > 90.0
    assert "ALTA DEMANDA" in result.global_weekend_demand_trend
