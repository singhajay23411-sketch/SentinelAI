"""
SentinelAI Enterprise - Demo Routes
POST /enterprise/demo/load   - Load demo fixtures (idempotent)
POST /enterprise/demo/reset  - Reset and reload demo fixtures (admin only)
GET  /enterprise/demo/status - Summary of demo data state
"""
import os
import logging
from fastapi import APIRouter, HTTPException, Depends

from enterprise.auth.dependencies import get_current_user, require_admin, TokenData
from enterprise.demo.fixtures import DEMO_ORG_ID
from enterprise.demo.loader import load_demo_fixtures, get_demo_summary
from enterprise.demo.reset import reset_demo_org

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/enterprise/demo", tags=["Demo"])


def _check_demo_enabled():
    if os.environ.get("DEMO_MODE_ENABLED", "true").lower() != "true":
        raise HTTPException(
            status_code=403,
            detail="Demo mode is disabled on this deployment."
        )


@router.get("/status")
def demo_status(token: TokenData = Depends(get_current_user)):
    _check_demo_enabled()
    return get_demo_summary()


@router.post("/load")
def load_demo(token: TokenData = Depends(require_admin)):
    _check_demo_enabled()
    try:
        result = load_demo_fixtures()
        return result
    except Exception as exc:
        logger.error(f"Demo load failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Demo load failed: {exc}")


@router.post("/reset")
def reset_demo(token: TokenData = Depends(require_admin)):
    _check_demo_enabled()
    # Only admin of the demo org can reset it
    if token.org_id != DEMO_ORG_ID:
        raise HTTPException(
            status_code=403,
            detail="Reset is only available when authenticated as the demo organization admin."
        )
    try:
        result = reset_demo_org()
        return result
    except Exception as exc:
        logger.error(f"Demo reset failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Demo reset failed: {exc}")
