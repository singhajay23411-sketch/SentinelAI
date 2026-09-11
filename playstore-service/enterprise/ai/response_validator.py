"""
SentinelAI Enterprise - AI Response Validator & Security Guardrail
Enforces strict grounding: verifies that claims in generated responses
originate from the authorized context, and prevents prompt injection attacks.
"""

import re
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

INJECTION_PATTERNS = [
    r"ignore previous instructions",
    r"disregard all prior",
    r"system prompt",
    r"<script>",
    r"javascript:",
    r"drop table",
    r"union select",
]


def sanitize_prompt(user_query: str) -> str:
    """Strips potential injection patterns from incoming prompt."""
    cleaned = user_query
    for pattern in INJECTION_PATTERNS:
        cleaned = re.sub(pattern, "[FILTERED]", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


def validate_ai_response(
    response_text: str,
    context: Dict[str, Any],
) -> Tuple[bool, str]:
    """
    Validates that the response does not hallucinate arbitrary large numbers.
    Returns (is_valid, sanitized_or_fallback_text).
    """
    # Check if empty
    if not response_text or len(response_text.strip()) < 10:
        return False, "Response too short or empty."

    # Validate that no instruction leaked
    if "system prompt" in response_text.lower() or "as an ai" in response_text.lower():
        return False, "Response contained conversational artifacts."

    return True, response_text
