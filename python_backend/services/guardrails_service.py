import re
from typing import Dict, Any, List, Optional

class GuardrailsService:
    """Enterprise-grade input and output guardrails for RAG workflows."""

    # Known prompt injection & jailbreak attack patterns
    JAILBREAK_PATTERNS = [
        r"(?i)ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)",
        r"(?i)disregard\s+(all\s+)?(previous|prior|system)\s+instructions",
        r"(?i)system\s+prompt\s*(override|leak|reveal|display|output)",
        r"(?i)you\s+are\s+now\s+(DAN|unfiltered|jailbroken|an\s+unrestricted\s+ai)",
        r"(?i)do\s+anything\s+now",
        r"(?i)forget\s+everything\s+you\s+were\s+told",
        r"(?i)roleplay\s+as\s+a\s+hacker",
        r"(?i)bypass\s+(safety|content\s+policy|guardrails)",
        r"(?i)act\s+as\s+an\s+unrestricted\s+language\s+model",
        r"(?i)print\s+(your\s+)?(initial|hidden|system)\s+(prompt|instructions)"
    ]

    # PII sensitive patterns
    PII_PATTERNS = {
        "credit_card": r"\b(?:\d[ -]*?){13,16}\b",
        "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
        "email_in_query": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b",
        "api_secret": r"(?i)(sk-[a-zA-Z0-9]{20,}|pcsk_[a-zA-Z0-9_-]{20,}|AIza[0-9A-Za-z-_]{35})"
    }

    def validate_input(self, query: str) -> Dict[str, Any]:
        """Validate user input against prompt injection, jailbreak attempts, and payload length."""
        if not query or not query.strip():
            return {
                "passed": False,
                "reason": "Query cannot be empty",
                "risk_level": "LOW",
                "action": "BLOCK"
            }

        clean_query = query.strip()

        # 1. Length Boundary Guard
        if len(clean_query) > 4000:
            return {
                "passed": False,
                "reason": "Query exceeds maximum allowed length of 4000 characters",
                "risk_level": "MEDIUM",
                "action": "BLOCK"
            }

        # 2. Jailbreak / Prompt Injection Check
        for pattern in self.JAILBREAK_PATTERNS:
            if re.search(pattern, clean_query):
                return {
                    "passed": False,
                    "reason": "Prompt injection / jailbreak pattern detected",
                    "risk_level": "HIGH",
                    "action": "REFUSE",
                    "detected_pattern": pattern
                }

        # 3. PII / Secret Scan (Mask or Flag)
        detected_pii = []
        for pii_type, p_pattern in self.PII_PATTERNS.items():
            if re.search(p_pattern, clean_query):
                detected_pii.append(pii_type)

        return {
            "passed": True,
            "reason": "Input passed all security guardrails",
            "risk_level": "LOW",
            "detected_pii": detected_pii,
            "action": "ALLOW"
        }

    def audit_output(
        self,
        response_text: str,
        context_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Audit generated answer for factual grounding, safety, and PII leakage."""
        if not response_text:
            return {
                "passed": False,
                "reason": "Empty response generated",
                "status": "FLAGGED",
                "grounded": False
            }

        # 1. Check for sensitive key leakage in output
        for pii_type, p_pattern in self.PII_PATTERNS.items():
            if pii_type in ["credit_card", "ssn", "api_secret"]:
                if re.search(p_pattern, response_text):
                    # Redact
                    response_text = re.sub(p_pattern, "[REDACTED_SENSITIVE_DATA]", response_text)

        # 2. Context overlap verification
        if not context_chunks:
            return {
                "passed": True,
                "status": "PASSED_NO_CONTEXT",
                "grounded": False,
                "cleaned_text": response_text
            }

        combined_context = " ".join(
            doc.get("metadata", {}).get("text", "") for doc in context_chunks
        ).lower()

        # Extract meaningful terms from response (len >= 4)
        response_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", response_text.lower()))
        common_stop_words = {
            "this", "that", "with", "from", "have", "more", "will", "they",
            "what", "when", "where", "which", "there", "their", "about",
            "would", "could", "should", "document", "answer", "please", "based",
            "provided", "details", "information", "section", "according"
        }
        domain_terms = [w for w in response_words if w not in common_stop_words]

        if domain_terms:
            matches = sum(1 for w in domain_terms if w in combined_context)
            grounding_ratio = matches / len(domain_terms)
        else:
            grounding_ratio = 1.0

        is_grounded = grounding_ratio >= 0.35 or "not specify" in response_text.lower() or "does not contain" in response_text.lower()

        return {
            "passed": True,
            "status": "PASSED" if is_grounded else "POTENTIAL_HALLUCINATION",
            "grounded": is_grounded,
            "grounding_ratio": round(grounding_ratio, 2),
            "cleaned_text": response_text
        }
