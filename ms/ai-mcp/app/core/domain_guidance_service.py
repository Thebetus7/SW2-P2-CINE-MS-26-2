import re
from typing import List, Optional
from pydantic import BaseModel

class GuidanceResponse(BaseModel):
    is_in_domain: bool
    detected_topic: Optional[str] = None
    guidance_message: Optional[str] = None
    suggested_actions: List[str] = []

class DomainGuidanceService:
    # Palabras clave del dominio cinematográfico y de gestión de Cine Center
    CINEMA_KEYWORDS = [
        r"\b(cine|pel[ií]cula|film|movie|cartelera|funci[oó]n|showtime|sala|butaca|asiento|aforo)\b",
        r"\b(boleto|ticket|taquilla|entrada|recaudaci[oó]n|ingreso|venta|precio|bs|boliviano)\b",
        r"\b(confiter[ií]a|popcorn|pipoca|refresco|snack|candy|dulce)\b",
        r"\b(reporte|informe|estad[ií]stica|kpi|ocupaci[oó]n|demanda|predicci[oó]n|asistente)\b",
        r"\b(imax|cxc|3d|2d|vip|complejo|la paz|santa cruz|central|norte)\b",
        r"\b(dune|gladiator|moana|estreno)\b"
    ]

    # Palabras clave explícitamente fuera de dominio
    OUT_OF_DOMAIN_PATTERNS = [
        (r"\b(receta|cocina|ingredientes|pastel|torta|comida\s+casera)\b", "Gastronomía"),
        (r"\b(hor[oó]scopo|zodiaco|astrolog[ií]a|signo\s+solar)\b", "Astrología"),
        (r"\b(pol[ií]tica|elecciones|presidente|diputados|senado)\b", "Política"),
        (r"\b(c[oó]digo\s+java|como\s+programar|javascript|tutorial\s+python|desarrollo\s+web)\b", "Programación General"),
        (r"\b(clima|pron[oó]stico\s+del\s+tiempo|lluvia\s+mañana)\b", "Meteorología"),
        (r"\b(f[uú]tbol|campeonato|liga\s+de\s+f[uú]tbol|partido\s+hoy)\b", "Deportes"),
    ]

    @classmethod
    def evaluate_query(cls, text: str) -> GuidanceResponse:
        clean = text.lower().strip()

        # 1. Comprobar si coincide con un tema explícitamente fuera de dominio
        for pattern, topic in cls.OUT_OF_DOMAIN_PATTERNS:
            if re.search(pattern, clean):
                return GuidanceResponse(
                    is_in_domain=False,
                    detected_topic=topic,
                    guidance_message=(
                        f"He detectado que tu consulta está relacionada con {topic}, lo cual está fuera del "
                        "ámbito de operaciones de Cine Center. Como asistente ejecutivo de cine, puedo ayudarte con:"
                    ),
                    suggested_actions=[
                        "Ver reporte de ocupación de salas en vivo",
                        "Generar balance de recaudación y taquilla en Bs.",
                        "Auditar ventas de confitería y ratios de conversión",
                        "Predecir demanda de funciones para el fin de semana"
                    ]
                )

        # 2. Comprobar si contiene al menos una palabra clave del dominio de cine
        has_cinema_match = any(re.search(pat, clean) for pat in cls.CINEMA_KEYWORDS)

        if not has_cinema_match:
            return GuidanceResponse(
                is_in_domain=False,
                detected_topic="Consulta Desconocida",
                guidance_message=(
                    "No pude asociar tu solicitud con las operaciones cinematográficas de Cine Center. "
                    "Te sugiero elegir una de las siguientes opciones de analítica ejecutiva:"
                ),
                suggested_actions=[
                    "Consultar recaudación total del mes en bolivianos",
                    "Ver ocupación promedio y butacas disponibles",
                    "Exportar reporte consolidado a Excel (.xlsx)",
                    "Predecir demanda con modelo de IA"
                ]
            )

        return GuidanceResponse(
            is_in_domain=True,
            detected_topic="Gestión Cinematográfica"
        )
