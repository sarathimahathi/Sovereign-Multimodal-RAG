"""
PII & Confidential Industrial Asset Redactor.
Sanitizes personal data, API tokens, passwords, and sensitive plant equipment serial tags.
"""

import re
from typing import Dict, Any, List, Tuple


class PIIRedactor:
    """
    Scans text and replaces sensitive PII and industrial credentials with secure tokens.
    """
    PATTERNS: List[Tuple[str, str, str]] = [
        # Credentials & Secret Keys
        (r"(?i)(bearer\s+[a-zA-Z0-9_\-\.]{20,}|jwt\s+[a-zA-Z0-9_\-\.]{20,})", "[REDACTED_AUTH_TOKEN]", "AUTH_TOKEN"),
        (r"(?i)(api[_\-\s]?key|secret[_\-\s]?key|password|access[_\-\s]?token)\s*[:=]\s*['\"]?[a-zA-Z0-9_\-\.@#$%^&*]{8,}['\"]?", r"\1: [REDACTED_CREDENTIAL]", "CREDENTIAL"),
        (r"-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----", "[REDACTED_PRIVATE_KEY]", "RSA_PRIVATE_KEY"),

        # PII (Emails, Phones, Identification Numbers)
        (r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", "[REDACTED_EMAIL]", "EMAIL_ADDRESS"),
        (r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", "[REDACTED_PHONE]", "PHONE_NUMBER"),
        (r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b", "[REDACTED_ID_NUMBER]", "ID_CARD_NUMBER"),
        (r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b", "[REDACTED_CARD_NUMBER]", "CREDIT_CARD"),

        # Sensitive Industrial Hardware & Valve Serial Tags
        (r"(?i)\b(TAG\s*#?\s*[A-Z0-9]{2,4}-[0-9]{3,5}[A-Z]?)\b", "[CONFIDENTIAL_ASSET_TAG]", "INDUSTRIAL_ASSET_TAG"),
    ]

    def redact(self, text: str) -> Dict[str, Any]:
        """
        Redact sensitive information from text.
        Returns: {
            "original_length": int,
            "sanitized_text": str,
            "redacted_count": int,
            "redacted_types": List[str]
        }
        """
        if not text:
            return {
                "original_length": 0,
                "sanitized_text": "",
                "redacted_count": 0,
                "redacted_types": []
            }

        sanitized = text
        redacted_types: List[str] = []
        total_redactions = 0

        for pattern, replacement, entity_type in self.PATTERNS:
            matches = re.findall(pattern, sanitized)
            if matches:
                total_redactions += len(matches)
                redacted_types.append(entity_type)
                sanitized = re.sub(pattern, replacement, sanitized)

        return {
            "original_length": len(text),
            "sanitized_text": sanitized,
            "redacted_count": total_redactions,
            "redacted_types": list(set(redacted_types))
        }


pii_redactor = PIIRedactor()
