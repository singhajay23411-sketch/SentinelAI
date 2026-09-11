"""
SentinelAI Enterprise - AI Query Handler
Routes authorized natural language questions to Gemini or verified canonical answer engine.
Enforces grounded facts and strips hallucinations.
"""

import os
import logging
from typing import Dict, Any, Optional

from enterprise.ai.context_builder import build_enterprise_context
from enterprise.ai.fallback import generate_canonical_answer
from enterprise.ai.response_validator import sanitize_prompt, validate_ai_response

logger = logging.getLogger(__name__)


def map_query_to_canonical_id(query: str) -> str:
    """Matches user question text to one of the 7 canonical question IDs."""
    q = query.lower()
    if any(term in q for term in ("highest", "worst", "top scenario", "largest risk", "scenario")):
        return "q1_highest_risk_scenario"
    elif any(term in q for term in ("business unit", "bu", "division", "department")):
        return "q2_top_business_unit"
    elif any(term in q for term in ("finding", "vulnerability", "cve", "cause", "driving")):
        return "q3_key_findings_driving_loss"
    elif any(term in q for term in ("change", "previous", "trend", "trajectory", "history")):
        return "q4_risk_change_since_previous"
    elif any(term in q for term in ("budget", "priority", "action", "recommend", "spend", "invest")):
        return "q5_priority_actions_in_budget"
    elif any(term in q for term in ("why", "rationale", "reason", "optimizer")):
        return "q6_why_optimizer_recommended"
    elif any(term in q for term in ("delay", "postpone", "wait", "defer")):
        return "q7_delay_remediation_consequences"
    else:
        return "q1_highest_risk_scenario"


def execute_ai_query(org_id: str, query: str, question_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Processes an AI query:
    1. Sanitize user input
    2. Build ground truth context
    3. Attempt Gemini call if API key present
    4. Validate response or return verified deterministic answer
    """
    clean_query = sanitize_prompt(query)
    context = build_enterprise_context(org_id)
    canonical_id = question_id or map_query_to_canonical_id(clean_query)

    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    is_placeholder = not gemini_key or any(
        sub in gemini_key.lower() for sub in ("your_gemini", "placeholder", "changeme", "example", "none")
    )

    if not is_placeholder:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            system_instruction = (
                "You are the SentinelAI Enterprise Cyber Risk Intelligence Agent. "
                "Answer the user query strictly and solely based on the factual context provided. "
                "Cite exact INR values, percentages, and scenario names from the context. "
                "Do not fabricate or extrapolate numbers not present in the context."
            )
            prompt = f"{system_instruction}\n\nCONTEXT:\n{context}\n\nUSER QUESTION:\n{clean_query}"
            raw_response = model.generate_content(prompt)

            is_valid, validated_text = validate_ai_response(raw_response.text, context)
            if is_valid:
                return {
                    "question_id": canonical_id,
                    "query": clean_query,
                    "title": f"Intelligence Analysis: {clean_query}",
                    "answer": validated_text,
                    "model_used": "gemini-1.5-flash",
                    "grounded_verification": "VALIDATED_BY_SENTINEL_GUARDRAILS",
                    "sources": ["Latest Quantitative Assessment", "Verified Security Evidence Catalog"],
                }
        except Exception as e:
            logger.warning(f"Gemini generation failed, falling back to deterministic canonical answer: {e}")

    # Canonical verified fallback
    fallback_res = generate_canonical_answer(canonical_id, context)
    fallback_res["query"] = clean_query
    fallback_res["model_used"] = "sentinel-deterministic-engine"
    return fallback_res
