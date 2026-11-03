from app.mcp.schemas.occupancy_schema import OccupancyQueryInput, OccupancyResult, HallOccupancyItem

def run_occupancy_tool(input_params: OccupancyQueryInput) -> OccupancyResult:
    # Datos agregados del backend de Cinema Core
    halls = [
        HallOccupancyItem(
            hall_name="Sala 1 IMAX Laser (La Paz)",
            projection_type="IMAX",
            total_capacity=380,
            sold_tickets=361,
            occupancy_rate_percent=95.0
        ),
        HallOccupancyItem(
            hall_name="Sala 2 CXC Extreme (La Paz)",
            projection_type="CXC",
            total_capacity=280,
            sold_tickets=252,
            occupancy_rate_percent=90.0
        ),
        HallOccupancyItem(
            hall_name="Sala VIP Platinum (Santa Cruz)",
            projection_type="VIP",
            total_capacity=120,
            sold_tickets=110,
            occupancy_rate_percent=91.6
        ),
        HallOccupancyItem(
            hall_name="Sala 3D RealD (Santa Cruz)",
            projection_type="3D",
            total_capacity=220,
            sold_tickets=195,
            occupancy_rate_percent=88.6
        ),
    ]

    if input_params.format != "ALL":
        halls = [h for h in halls if h.projection_type.upper() == input_params.format.upper()]

    total_seats = sum(h.total_capacity for h in halls)
    total_sold = sum(h.sold_tickets for h in halls)
    avg_occ = round((total_sold / total_seats * 100), 1) if total_seats > 0 else 0.0

    return OccupancyResult(
        average_occupancy_percent=avg_occ,
        total_active_seats=total_seats,
        total_sold_tickets=total_sold,
        halls_breakdown=halls
    )
