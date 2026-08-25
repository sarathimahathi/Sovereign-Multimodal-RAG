"""
Prompt Injection, Adversarial Jailbreak & Industrial Policy Guardrails.
Prevents prompt hijacking, system prompt extraction, and unsafe instruction execution.
"""

import re
from typing import List, Dict, Any


class PromptGuardrail:
    """
    Scans user inputs and agent thoughts for adversarial prompt injections and security violations.
    """
    
    INJECTION_PATTERNS = [
        # Instruction Overrides & Jailbreaks
        (r"(?i)\b(ignore|disregard|forget|bypass)\s+.*?\b(instructions|prompts|rules|commands|guidelines|directives)\b", "INSTRUCTION_OVERRIDE", 0.95),
        (r"(?i)\byou\s+are\s+now\s+(in\s+)?(developer\s+mode|unfiltered|jailbroken|dan\s+mode|root)\b", "JAILBREAK_ROLEPLAY", 0.90),
        (r"(?i)\bpretend\s+you\s+have\s+no\s+(rules|restrictions|limits|guidelines)\b", "JAILBREAK_ROLEPLAY", 0.85),
        
        # System Prompt & Secret Exfiltration
        (r"(?i)\b(reveal|print|repeat|show|display|output|tell\s+me)\s+.*?\b(prompt|instructions|directive|directives|system\s+message)\b", "SYSTEM_PROMPT_EXFILTRATION", 0.90),
        (r"(?i)\bwhat\s+are\s+the\s+instructions\s+(given\s+to\s+you|above)\b", "SYSTEM_PROMPT_EXFILTRATION", 0.75),
        (r"(?i)\b(leak|exfiltrate|send)\s+.*?\b(data|blueprint|drawing|key|database)\b", "DATA_EXFILTRATION_INTENT", 0.85),
        
        # Malicious System Commands
        (r"(?i)\b(rm\s+-rf|format\s+[a-z]:|drop\s+database|truncate\s+table|delete\s+from\s+users)\b", "DANGEROUS_SYSTEM_COMMAND", 0.95),
        (r"(?i)\b(curl|wget|nc|ncat|powershell\s+-enc)\s+https?://\b", "UNAUTHORIZED_EGRESS_COMMAND", 0.90),
    ]

    def scan_prompt(self, text: str) -> Dict[str, Any]:
        """
        Scan a prompt for security threats, calculate risk score, and return evaluation verdict.
        """
        if not text or not text.strip():
            return {
                "is_safe": True,
                "threat_level": "SAFE",
                "risk_score": 0.0,
                "detected_threats": [],
                "character_count": 0,
                "action_taken": "ALLOWED"
            }

        detected_threats: List[Dict[str, Any]] = []
        max_score = 0.0

        for pattern, threat_type, score in self.INJECTION_PATTERNS:
            if re.search(pattern, text):
                max_score = max(max_score, score)
                detected_threats.append({
                    "threat_type": threat_type,
                    "score": score,
                    "description": f"Adversarial pattern matched: {threat_type}"
                })

        # Determine overall threat level
        if max_score >= 0.70:
            threat_level = "CRITICAL_INJECTION_BLOCKED"
            is_safe = False
        elif max_score >= 0.35:
            threat_level = "SUSPICIOUS"
            is_safe = False
        else:
            threat_level = "SAFE"
            is_safe = True

        return {
            "is_safe": is_safe,
            "threat_level": threat_level,
            "risk_score": round(max_score, 2),
            "detected_threats": detected_threats,
            "character_count": len(text),
            "action_taken": "BLOCKED" if not is_safe else "ALLOWED"
        }


prompt_guardrail = PromptGuardrail()
