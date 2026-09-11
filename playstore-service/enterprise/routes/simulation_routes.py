"""
SentinelAI Enterprise - Simulation API Routes
Endpoints for What-If scenario simulations and counterfactual comparisons.
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query

from enterprise.auth.dependencies import get_current_user, require_role, get_current_org_id, TokenData
from enterprise.auth.models import Role
from enterprise.simulation.models import SimulationRunRequest, SimulationRunOut
from enterprise.simulation.simulator import run_what_if_simulation, list_simulations, get_simulation_by_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enterprise/simulations", tags=["What-If Risk Simulations"])


@router.post("/run")
def create_simulation(
    body: SimulationRunRequest,
    current_user: TokenData = Depends(require_role(Role.analyst)),
    org_id: str = Depends(get_current_org_id),
):
    """
    Execute a counterfactual What-If simulation using Common Random Numbers (CRN).
    Evaluates risk delta relative to the baseline organization posture.
    """
    try:
        res = run_what_if_simulation(
            org_id=org_id,
            name=body.name,
            description=body.description,
            interventions=body.interventions,
            seed=body.seed,
            num_iterations=body.num_iterations,
        )
        return res
    except Exception as e:
        logger.exception(f"Simulation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
def get_simulations_list(
    limit: int = Query(20, ge=1, le=100),
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """List saved What-If simulation runs for this organization."""
    return {"simulations": list_simulations(org_id=org_id, limit=limit)}


@router.get("/{sim_id}")
def get_simulation_detail(
    sim_id: str,
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Retrieve full details of a specific simulation run including scenario deltas."""
    sim = get_simulation_by_id(sim_id, org_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation run not found.")
    return sim
