import io
from datetime import datetime
from typing import List, Dict, Any, Optional
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

class ExcelBuilder:
    @classmethod
    def generate_consolidated_report(cls, rows: Optional[List[Dict[str, Any]]] = None) -> bytes:
        if rows is None:
            rows = [
                {
                    "period": "Octubre 2026",
                    "complex": "Cine Center Central (La Paz)",
                    "hall": "Sala 1 IMAX Laser",
                    "movie": "Dune: Part Two",
                    "tickets": 940,
                    "ticket_rev": 42300.0,
                    "candy_rev": 21500.0,
                    "total_rev": 63800.0,
                    "occupancy": 94.5
                },
                {
                    "period": "Octubre 2026",
                    "complex": "Cine Center Central (La Paz)",
                    "hall": "Sala 2 CXC Extreme",
                    "movie": "Gladiator II",
                    "tickets": 610,
                    "ticket_rev": 27450.0,
                    "candy_rev": 13200.0,
                    "total_rev": 40650.0,
                    "occupancy": 88.0
                },
                {
                    "period": "Octubre 2026",
                    "complex": "Cine Center Norte (Santa Cruz)",
                    "hall": "Sala VIP Platinum",
                    "movie": "Moana 2",
                    "tickets": 420,
                    "ticket_rev": 25200.0,
                    "candy_rev": 16800.0,
                    "total_rev": 42000.0,
                    "occupancy": 91.2
                }
            ]

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Consolidado Ejecutivo"

        # 1. Título Corporativo
        ws.merge_cells("A1:H1")
        title_cell = ws["A1"]
        title_cell.value = "CINE CENTER OPS — REPORTE CONSOLIDADO EJECUTIVO"
        title_cell.font = Font(name="Calibri", size=15, bold=True, color="FFFFFF")
        title_cell.fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
        title_cell.alignment = Alignment(horizontal="center", vertical="center")
        ws.row_dimensions[1].height = 35

        # Subtítulo y fecha de generación
        ws.merge_cells("A2:H2")
        sub_cell = ws["A2"]
        sub_cell.value = f"Generado por Servidor IA MCP — {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}"
        sub_cell.font = Font(name="Calibri", size=9, italic=True, color="64748B")
        sub_cell.alignment = Alignment(horizontal="center", vertical="center")
        ws.row_dimensions[2].height = 20

        # 2. Encabezados de Tabla
        headers = [
            "Período",
            "Complejo Cinematográfico",
            "Sala de Proyección",
            "Película",
            "Boletos Vendidos",
            "Taquilla (Bs.)",
            "Confitería (Bs.)",
            "Recaudación Total (Bs.)"
        ]

        header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        header_font = Font(name="Calibri", size=10, bold=True, color="F8FAFC")
        thin_border = Border(
            left=Side(style="thin", color="CBD5E1"),
            right=Side(style="thin", color="CBD5E1"),
            top=Side(style="thin", color="CBD5E1"),
            bottom=Side(style="thin", color="CBD5E1")
        )

        for col_idx, header in enumerate(headers, start=1):
            cell = ws.cell(row=4, column=col_idx)
            cell.value = header
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = thin_border
        ws.row_dimensions[4].height = 25

        # 3. Filas de Datos
        row_font = Font(name="Calibri", size=10)
        start_row = 5
        for idx, item in enumerate(rows):
            current_row = start_row + idx
            ws.cell(row=current_row, column=1, value=item.get("period", "Octubre 2026")).alignment = Alignment(horizontal="center")
            ws.cell(row=current_row, column=2, value=item.get("complex", ""))
            ws.cell(row=current_row, column=3, value=item.get("hall", ""))
            ws.cell(row=current_row, column=4, value=item.get("movie", ""))

            tickets_cell = ws.cell(row=current_row, column=5, value=item.get("tickets", 0))
            tickets_cell.number_format = "#,##0"
            tickets_cell.alignment = Alignment(horizontal="right")

            ticket_rev_cell = ws.cell(row=current_row, column=6, value=item.get("ticket_rev", 0.0))
            ticket_rev_cell.number_format = "#,##0.00"
            ticket_rev_cell.alignment = Alignment(horizontal="right")

            candy_rev_cell = ws.cell(row=current_row, column=7, value=item.get("candy_rev", 0.0))
            candy_rev_cell.number_format = "#,##0.00"
            candy_rev_cell.alignment = Alignment(horizontal="right")

            total_rev_cell = ws.cell(row=current_row, column=8, value=item.get("total_rev", 0.0))
            total_rev_cell.number_format = "#,##0.00"
            total_rev_cell.alignment = Alignment(horizontal="right")

            for col_idx in range(1, 9):
                c = ws.cell(row=current_row, column=col_idx)
                c.font = row_font
                c.border = thin_border
            ws.row_dimensions[current_row].height = 20

        # 4. Fila de Totales
        total_row = start_row + len(rows)
        ws.cell(row=total_row, column=1, value="TOTALES").font = Font(name="Calibri", size=10, bold=True, color="0F172A")
        ws.cell(row=total_row, column=1).alignment = Alignment(horizontal="center")

        total_tickets = sum(r.get("tickets", 0) for r in rows)
        total_ticket_rev = sum(r.get("ticket_rev", 0.0) for r in rows)
        total_candy_rev = sum(r.get("candy_rev", 0.0) for r in rows)
        total_consolidated = sum(r.get("total_rev", 0.0) for r in rows)

        t_cell = ws.cell(row=total_row, column=5, value=total_tickets)
        t_cell.number_format = "#,##0"
        t_cell.font = Font(name="Calibri", size=10, bold=True)
        t_cell.alignment = Alignment(horizontal="right")

        tr_cell = ws.cell(row=total_row, column=6, value=total_ticket_rev)
        tr_cell.number_format = "#,##0.00"
        tr_cell.font = Font(name="Calibri", size=10, bold=True)
        tr_cell.alignment = Alignment(horizontal="right")

        tc_cell = ws.cell(row=total_row, column=7, value=total_candy_rev)
        tc_cell.number_format = "#,##0.00"
        tc_cell.font = Font(name="Calibri", size=10, bold=True)
        tc_cell.alignment = Alignment(horizontal="right")

        tot_cell = ws.cell(row=total_row, column=8, value=total_consolidated)
        tot_cell.number_format = "#,##0.00"
        tot_cell.font = Font(name="Calibri", size=10, bold=True, color="059669")
        tot_cell.alignment = Alignment(horizontal="right")

        total_fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
        for col_idx in range(1, 9):
            c = ws.cell(row=total_row, column=col_idx)
            c.fill = total_fill
            c.border = thin_border
        ws.row_dimensions[total_row].height = 24

        # 5. Autoajuste de Columnas
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val = str(cell.value or "")
                if len(val) > max_len and cell.row > 2:
                    max_len = len(val)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 14)

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()
