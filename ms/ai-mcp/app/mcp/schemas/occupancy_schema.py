from typing import Optional, List
from pydantic import BaseModel, Field

class OccupancyQueryInput(BaseModel):
    complex_id: Optional[str] = Field(default="ALL", description="ID del complejo o ALL para todos")
    format: Optional[str] = Field(default="ALL", description="Formato de proyección: 2D, 3D, IMAX, CXC, VIP o ALL")
    date_from: Optional[str] = Field(default="2026-10-01", description="Fecha de inicio YYYY-MM-DD")
    date_to: Optional[str] = Field(default="2026-10-20", description="Fecha fin YYYY-MM-DD")

class HallOccupancyItem(BaseModel):
    hall_name: str
    projection_type: str
    total_capacity: int
    sold_tickets: int
    occupancy_rate_percent: float

class OccupancyResult(BaseModel):
    average_occupancy_percent: float
    total_active_seats: int
    total_sold_tickets: int
    halls_breakdown: List[HallOccupancyItem]
