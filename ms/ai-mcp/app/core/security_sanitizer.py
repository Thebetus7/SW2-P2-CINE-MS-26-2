import re
from typing import List, Optional
from pydantic import BaseModel

class SanitizationResult(BaseModel):
    is_safe: bool
    sanitized_text: str
    flagged_threats: List[str] = []
    rejection_reason: Optional[str] = None

class SecuritySanitizer:
    # Patrones comunes de Jailbreak y Prompt Injection
    JAILBREAK_PATTERNS = [
        r"ignore\s+(all\s+)?(previous|prior)\s+(instructions|directives|prompts)",
        r"you\s+are\s+now\s+(dan|unrestricted|godmode|jailbroken)",
        r"disregard\s+all\s+rules",
        r"reveal\s+(your\s+)?(system\s+prompt|hidden\s+instructions)",
        r"act\s+as\s+(an?\s+)?unfiltered",
        r"bypass\s+(safety|security|content\s+filters)",
        r"forget\s+(your\s+)?training",
        r"pretend\s+you\s+have\s+no\s+(morals|filters|rules)",
    ]

    # Patrones de SQL Injection y ejecución destructiva
    SQL_INJECTION_PATTERNS = [
        r"\b(drop\s+table|delete\s+from|truncate\s+table)\b",
        r"\bunion\s+select\b",
        r"\bexec(\s+|\()xp_",
        r"\b(or|and)\s+(\'|\")?1(\'|\")?\s*=\s*(\'|\")?1",
        r"1\s*=\s*1",
        r";\s*--",
    ]

    @classmethod
    def sanitize_prompt(cls, raw_prompt: str) -> SanitizationResult:
        if not raw_prompt or not raw_prompt.strip():
            return SanitizationResult(
                is_safe=False,
                sanitized_text="",
                flagged_threats=["EMPTY_INPUT"],
                rejection_reason="El texto de la consulta no puede estar vacío."
            )

        text = raw_prompt.strip()
        flagged: List[str] = []

        # 1. Chequeo de Jailbreak
        for pattern in cls.JAILBREAK_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                flagged.append("PROMPT_INJECTION_OR_JAILBREAK")
                break

        # 2. Chequeo de SQL Injection
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                flagged.append("SQL_INJECTION_ATTEMPT")
                break

        if flagged:
            return SanitizationResult(
                is_safe=False,
                sanitized_text=text,
                flagged_threats=flagged,
                rejection_reason=(
                    "Consulta bloqueada por protocolo de seguridad: Se detectaron patrones no autorizados "
                    "(intento de manipulación de instrucciones o inyección de comandos)."
                )
            )

        # Limpieza básica de caracteres nulos y espacios dobles
        clean_text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
        clean_text = re.sub(r"\s+", " ", clean_text).strip()

        return SanitizationResult(
            is_safe=True,
            sanitized_text=clean_text,
            flagged_threats=[]
        )
