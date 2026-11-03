import io
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.excel_builder import ExcelBuilder

router = APIRouter(prefix="/api/reports", tags=["Reports Export"])

@router.get("/download-excel")
def download_consolidated_excel():
    excel_bytes = ExcelBuilder.generate_consolidated_report()
    filename = f"reporte_consolidado_cinecenter_{datetime.now().strftime('%Y%m%d')}.xlsx"

    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
