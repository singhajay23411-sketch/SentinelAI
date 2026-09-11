"""
SentinelAI Enterprise - Assessment Routes
Endpoints to execute quantitative risk assessments, retrieve immutable snapshots,
and compare risk trajectories over time.
"""

import logging
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends, Query, status

from enterprise.auth.dependencies import (
    get_current_user,
    require_role,
    require_analyst,
    get_current_org_id,
    TokenData,
)
from enterprise.auth.models import Role
from enterprise.engine.assessment_builder import (
    create_assessment_snapshot,
    get_latest_assessment,
    get_assessment_by_id,
    compare_assessments,
)
import enterprise.db.collections as cols

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enterprise/assessments", tags=["Quantitative Risk Assessments"])


class AssessmentRunRequest(BaseModel):
    num_iterations: int = Field(10_000, ge=1_000, le=100_000, description="Monte Carlo sample iterations")
    seed: int = Field(42, description="Pseudorandom seed for exact reproducibility")
    triggered_by: str = Field("analyst_manual", description="Trigger context, e.g. 'quarterly_review'")


@router.post("/run")
def run_assessment(
    body: AssessmentRunRequest = AssessmentRunRequest(),
    current_user: TokenData = Depends(require_role(Role.analyst)),
    org_id: str = Depends(get_current_org_id),
):
    """
    Executes a quantitative Monte Carlo simulation across all organization scenarios.
    Creates and stores an immutable assessment snapshot with documented inputs.
    """
    try:
        snapshot = create_assessment_snapshot(
            org_id=org_id,
            triggered_by=f"{body.triggered_by} ({current_user.user_id})",
            num_iterations=body.num_iterations,
            seed=body.seed,
        )
        return snapshot
    except Exception as e:
        logger.exception(f"Assessment computation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/latest")
def read_latest_assessment(
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Retrieve the latest immutable assessment snapshot for the active organization."""
    asm = get_latest_assessment(org_id)
    if not asm:
        raise HTTPException(status_code=404, detail="No assessment available for this organization yet.")
    return asm


@router.get("")
def list_assessments(
    limit: int = Query(20, ge=1, le=100),
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """List historical assessment snapshots for trend analysis and audit history."""
    cursor = cols.assessments().find({"org_id": org_id}).sort("created_at", -1).limit(limit)
    assessments = []
    for doc in cursor:
        doc["id"] = doc.pop("_id")
        # Keep summary and strip huge per-scenario details for list view
        summary = doc.get("summary", {})
        assessments.append({
            "id": doc["id"],
            "created_at": doc.get("created_at"),
            "triggered_by": doc.get("triggered_by"),
            "is_latest": doc.get("is_latest", False),
            "expected_annual_loss_inr": summary.get("expected_annual_loss_inr"),
            "var_95_inr": summary.get("var_95_inr"),
            "status": summary.get("appetite_evaluation", {}).get("status", "unknown"),
        })
    return {"assessments": assessments}


@router.get("/{assessment_id}")
def read_assessment(
    assessment_id: str,
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Retrieve full details of a specific historical assessment."""
    asm = get_assessment_by_id(assessment_id, org_id)
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return asm


@router.get("/{id1}/compare/{id2}")
def compare_two_assessments(
    id1: str,
    id2: str,
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Compare two historical assessment snapshots side-by-side."""
    try:
        return compare_assessments(id1, id2, org_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
