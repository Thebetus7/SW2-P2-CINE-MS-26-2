from app.mcp.schemas.revenue_schema import RevenueQueryInput, RevenueResult, RevenueItem

def run_revenue_tool(input_params: RevenueQueryInput) -> RevenueResult:
    items = [
        RevenueItem(
            complex_name="Cine Center Central (La Paz)",
            hall_name="Sala 1 IMAX Laser",
            movie_title="Dune: Part Two",
            tickets_sold=940,
            ticket_revenue_bs=42300.0,
            candy_revenue_bs=21500.0,
            total_revenue_bs=63800.0
        ),
        RevenueItem(
            complex_name="Cine Center Central (La Paz)",
            hall_name="Sala 2 CXC Extreme",
            movie_title="Gladiator II",
            tickets_sold=610,
            ticket_revenue_bs=27450.0,
            candy_revenue_bs=13200.0,
            total_revenue_bs=40650.0
        ),
        RevenueItem(
            complex_name="Cine Center Norte (Santa Cruz)",
            hall_name="Sala VIP Platinum",
            movie_title="Moana 2",
            tickets_sold=420,
            ticket_revenue_bs=25200.0,
            candy_revenue_bs=16800.0,
            total_revenue_bs=42000.0
        ),
    ]

    tot_rev = sum(i.total_revenue_bs for i in items)
    tot_tickets = sum(i.tickets_sold for i in items)
    tot_candy = sum(i.candy_revenue_bs for i in items)

    return RevenueResult(
        total_revenue_bs=tot_rev,
        total_tickets_sold=tot_tickets,
        total_candy_bs=tot_candy,
        items=items
    )
