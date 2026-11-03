from typing import Optional, List
from pydantic import BaseModel, Field

class RevenueQueryInput(BaseModel):
    complex_id: Optional[str] = Field(default="ALL")
    date_from: Optional[str] = Field(default="2026-10-01")
    date_to: Optional[str] = Field(default="2026-10-20")

class RevenueItem(BaseModel):
    complex_name: str
    hall_name: str
    movie_title: str
    tickets_sold: int
    ticket_revenue_bs: float
    candy_revenue_bs: float
    total_revenue_bs: float

class RevenueResult(BaseModel):
    total_revenue_bs: float
    total_tickets_sold: int
    total_candy_bs: float
    items: List[RevenueItem]
