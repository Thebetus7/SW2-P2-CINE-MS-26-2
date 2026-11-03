import io
import openpyxl
from app.services.excel_builder import ExcelBuilder

def test_excel_builder_generates_valid_workbook():
    excel_bytes = ExcelBuilder.generate_consolidated_report()

    assert excel_bytes is not None
    assert len(excel_bytes) > 0

    # Cargar y verificar estructura del archivo .xlsx con openpyxl
    wb = openpyxl.load_workbook(io.BytesIO(excel_bytes))
    ws = wb.active
    assert ws.title == "Consolidado Ejecutivo"

    # Verificar encabezado principal
    assert "CINE CENTER OPS" in str(ws["A1"].value)

    # Verificar encabezados de columnas en fila 4
    headers = [ws.cell(row=4, column=c).value for c in range(1, 9)]
    assert "Período" in headers
    assert "Película" in headers
    assert "Recaudación Total (Bs.)" in headers

    # Fila de totales (fila 8 con 3 items)
    total_label = ws.cell(row=8, column=1).value
    assert total_label == "TOTALES"

    # Suma total (63800 + 40650 + 42000 = 146450)
    total_rev = ws.cell(row=8, column=8).value
    assert total_rev == 146450.0
