"""
Dynamic Task Classifier & Intent Router for Sovereign AI Workbench.
Analyzes user prompts and automatically selects the optimal open-weight LLM:
- Qwen 2.5 Coder (14B/7B) for coding, Python scripts, SQL, and automation.
- DeepSeek R1 (14B/8B) for mathematical calculations, thermodynamic engineering, and root cause analysis.
- Llama 3.2 Vision (11B) for scanned diagrams, P&ID review, and OCR tasks.
- Llama 3.1 (8B) for general briefing notes, executive memos, and board approval drafts.
"""

import re
from typing import Dict, Any, List, Tuple


class TaskDomain:
    CODE_ENGINEERING = "CODE_ENGINEERING"
    REASONING_MATH = "REASONING_MATH_CALCULATION"
    MULTIMODAL_VISION = "MULTIMODAL_VISION"
    GENERAL_REPORT = "GENERAL_BRIEFING_REPORT"


class DynamicIntentRouter:
    """
    Classifies task intent using domain keyword weights and syntactic structural heuristics.
    """

    MODEL_MAPPINGS = {
        TaskDomain.CODE_ENGINEERING: {
            "model_id": "qwen2.5-coder:14b",
            "display_name": "Qwen 2.5 Coder (14B)",
            "specialization": "Python Automation, Industrial Scripting, SQL Queries & Refactoring",
            "context_window": "128k tokens",
        },
        TaskDomain.REASONING_MATH: {
            "model_id": "deepseek-r1:14b",
            "display_name": "DeepSeek R1 (14B)",
            "specialization": "Deep Industrial Reasoning, Thermodynamic Formulas & API 520 Math",
            "context_window": "64k tokens",
        },
        TaskDomain.MULTIMODAL_VISION: {
            "model_id": "llama3.2-vision:11b",
            "display_name": "Llama 3.2 Vision (11B)",
            "specialization": "Blueprint Analysis, Scanned Inspection OCR & P&ID Diagram Review",
            "context_window": "128k tokens",
        },
        TaskDomain.GENERAL_REPORT: {
            "model_id": "llama3.1:8b",
            "display_name": "Llama 3.1 (8B)",
            "specialization": "Board Approvals, Executive Summaries, SOP Compliance Notes",
            "context_window": "128k tokens",
        },
    }

    # Keyword weights for domain classification
    DOMAIN_PATTERNS: Dict[str, List[Tuple[str, float]]] = {
        TaskDomain.CODE_ENGINEERING: [
            (r"(?i)\b(python|script|code|function|class|algorithm|regex|sql|database query|api|debug|refactor|compile|endpoint)\b", 1.0),
            (r"(?i)\b(pandas|numpy|fastapi|docker|bash|powershell|sandbox|parse json|csv)\b", 0.9),
            (r"(?i)\b(write a program|develop a tool|automate|generate code)\b", 1.0),
            (r"[{}();=<>\[\]]{4,}", 0.8),  # Code syntax symbols
        ],
        TaskDomain.REASONING_MATH: [
            (r"(?i)\b(calculate|pressure drop|flow rate|valve coefficient|cv value|api 520|api 521|thermodynamics|enthalpy|reynolds number)\b", 1.0),
            (r"(?i)\b(mass balance|energy balance|distillation|heat exchanger|pipeline friction|anomaly reasoning|root cause)\b", 0.95),
            (r"(?i)\b(psi|bar|kpa|gpm|m3/hr|celsius|kelvin|density|viscosity|formula|equation)\b", 0.85),
            (r"(?i)\b(step-by-step reasoning|derive|solve for|physics|engineering calculation)\b", 0.95),
        ],
        TaskDomain.MULTIMODAL_VISION: [
            (r"(?i)\b(p&id|piping diagram|drawing|blueprint|scanned|inspection report|ocr|schematic|valve symbol|image|cad|dwg|pdf drawing)\b", 1.0),
            (r"(?i)\b(visual|diagram|isolate valve|flange|instrumentation loop|tag #)\b", 0.9),
            (r"(?i)\b(look at the drawing|read the scanned doc|examine the photo)\b", 1.0),
        ],
        TaskDomain.GENERAL_REPORT: [
            (r"(?i)\b(approval note|board presentation|executive summary|memo|briefing|draft note|office memorandum|ministerial)\b", 1.0),
            (r"(?i)\b(compliance|psu guideline|procurement note|tender evaluation|audit response|recommendation)\b", 0.9),
            (r"(?i)\b(summarize|formal letter|official correspondence|standard operating procedure)\b", 0.85),
        ],
    }

    def route_task(self, prompt: str, user_preference: str = "auto") -> Dict[str, Any]:
        """
        Classifies task and returns the selected model with rationale.
        """
        if not prompt or not prompt.strip():
            return self._build_route_response(
                domain=TaskDomain.GENERAL_REPORT,
                confidence=0.5,
                rationale="Empty prompt provided; defaulting to general executive model.",
                matched_keywords=[]
            )

        # If user explicitly picked a model (not auto)
        if user_preference and user_preference != "auto":
            for domain, meta in self.MODEL_MAPPINGS.items():
                if meta["model_id"] == user_preference or user_preference in meta["model_id"]:
                    return self._build_route_response(
                        domain=domain,
                        confidence=1.0,
                        rationale=f"User explicitly pinned model preference to '{meta['display_name']}'.",
                        matched_keywords=["user_override"]
                    )

        # Score each domain
        scores: Dict[str, float] = {
            TaskDomain.CODE_ENGINEERING: 0.0,
            TaskDomain.REASONING_MATH: 0.0,
            TaskDomain.MULTIMODAL_VISION: 0.0,
            TaskDomain.GENERAL_REPORT: 0.0,
        }
        matched_tags: Dict[str, List[str]] = {d: [] for d in scores}

        for domain, patterns in self.DOMAIN_PATTERNS.items():
            for pattern, weight in patterns:
                matches = re.findall(pattern, prompt)
                if matches:
                    scores[domain] += len(matches) * weight
                    matched_tags[domain].extend([m if isinstance(m, str) else m[0] for m in matches])

        # Pick top domain
        top_domain = max(scores, key=lambda k: scores[k])
        max_score = scores[top_domain]

        if max_score == 0.0:
            top_domain = TaskDomain.GENERAL_REPORT
            confidence = 0.65
            rationale = "General text structure identified. Assigned to Llama 3.1 for high-quality drafting."
            matched_list = []
        else:
            total_score = sum(scores.values())
            confidence = min(0.99, round(max_score / max(1.0, total_score), 2))
            # Boost confidence for distinct matches
            confidence = max(0.85, confidence)
            
            matched_list = list(set(matched_tags[top_domain]))
            model_name = self.MODEL_MAPPINGS[top_domain]["display_name"]
            
            if top_domain == TaskDomain.CODE_ENGINEERING:
                rationale = f"Detected software tooling & automation intent ({', '.join(matched_list[:3])}). Routed to {model_name} for syntax precision and test generation."
            elif top_domain == TaskDomain.REASONING_MATH:
                rationale = f"Detected engineering physics & mathematical calculations ({', '.join(matched_list[:3])}). Routed to {model_name} for step-by-step chain-of-thought verification."
            elif top_domain == TaskDomain.MULTIMODAL_VISION:
                rationale = f"Detected technical blueprint / P&ID diagram terminology ({', '.join(matched_list[:3])}). Routed to {model_name} for visual feature extraction."
            else:
                rationale = f"Detected corporate executive & PSU reporting format ({', '.join(matched_list[:3])}). Routed to {model_name} for structured approval drafting."

        return self._build_route_response(
            domain=top_domain,
            confidence=confidence,
            rationale=rationale,
            matched_keywords=matched_list
        )

    def _build_route_response(
        self,
        domain: str,
        confidence: float,
        rationale: str,
        matched_keywords: List[str]
    ) -> Dict[str, Any]:
        meta = self.MODEL_MAPPINGS[domain]
        return {
            "domain": domain,
            "selected_model_id": meta["model_id"],
            "model_name": meta["display_name"],
            "specialization": meta["specialization"],
            "context_window": meta["context_window"],
            "confidence_score": confidence,
            "decision_rationale": rationale,
            "matched_keywords": matched_keywords,
        }


intent_router = DynamicIntentRouter()
