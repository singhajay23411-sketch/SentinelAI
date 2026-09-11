"""
SentinelAI Enterprise - AI Intelligence API Routes
Endpoints for querying the grounded cyber risk natural language interface.
"""

from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends

from enterprise.auth.dependencies import get_current_user, get_current_org_id, TokenData
from enterprise.ai.query_handler import execute_ai_query
from enterprise.ai.context_builder import build_enterprise_context

router = APIRouter(prefix="/enterprise/ai", tags=["Grounded AI Intelligence"])


class AIQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500, description="Natural language risk question")
    question_id: Optional[str] = Field(None, description="Optional canonical question ID")


@router.post("/query")
def submit_ai_query(
    body: AIQueryRequest,
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """
    Query the SentinelAI cyber risk intelligence engine.
    Returns fact-grounded responses citing verified numbers, scenarios, and mitigation actions.
    """
    try:
        return execute_ai_query(org_id=org_id, query=body.query, question_id=body.question_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/questions")
def get_canonical_questions(
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """List the standard allowlisted natural language questions supported by the platform."""
    ctx = build_enterprise_context(org_id)
    return {"questions": ctx["allowed_questions"]}
