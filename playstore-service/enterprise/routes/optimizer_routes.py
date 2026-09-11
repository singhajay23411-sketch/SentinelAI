"""
SentinelAI Enterprise - Investment Optimizer API Routes
Endpoints for mitigation action discovery, budget portfolio optimization,
and capital allocation efficiency curve generation.
"""

import logging
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends, Query

from enterprise.auth.dependencies import get_current_user, require_role, get_current_org_id, TokenData
from enterprise.auth.models import Role
from enterprise.optimizer.catalogue import get_mitigation_catalogue
from enterprise.optimizer.optimizer import optimize_investments
from enterprise.optimizer.investment_curve import generate_investment_curve

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enterprise/optimizer", tags=["Investment Optimizer & ROSI"])


class OptimizeRequest(BaseModel):
    budget_inr: float = Field(..., ge=0, description="Available security budget in INR")
    horizon_years: int = Field(1, ge=1, le=5, description="Planning horizon in years")
    seed: int = Field(42, description="Random seed for simulation consistency")


@router.get("/catalogue")
def list_catalogue(current_user: TokenData = Depends(get_current_user)):
    """Retrieve the benchmark catalogue of cybersecurity mitigation actions with cost benchmarks."""
    return {"mitigations": get_mitigation_catalogue()}


@router.post("/run")
def run_optimization(
    body: OptimizeRequest,
    current_user: TokenData = Depends(require_role(Role.analyst)),
    org_id: str = Depends(get_current_org_id),
):
    """
    Finds the optimal mitigation portfolio under the specified budget constraint.
    Guarantees mathematical global optimum via combinatorial knapsack enumeration.
    """
    try:
        res = optimize_investments(
            org_id=org_id,
            budget_inr=body.budget_inr,
            horizon_years=body.horizon_years,
            seed=body.seed,
        )
        return res
    except Exception as e:
        logger.exception(f"Optimization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/curve")
def get_curve(
    max_budget_inr: float = Query(5_000_000.0, ge=100_000.0),
    steps: int = Query(8, ge=4, le=20),
    horizon_years: int = Query(1, ge=1, le=5),
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """
    Constructs the Investment Efficiency Curve (Diminishing Returns Frontier)
    across budget intervals up to max_budget_inr.
    """
    try:
        return generate_investment_curve(
            org_id=org_id,
            max_budget_inr=max_budget_inr,
            steps=steps,
            horizon_years=horizon_years,
        )
    except Exception as e:
        logger.exception(f"Failed to generate curve: {e}")
        raise HTTPException(status_code=500, detail=str(e))
