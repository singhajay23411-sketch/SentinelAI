"""
SentinelAI Enterprise - Security & Regulatory Framework Routes
Endpoints for querying standards mappings, compliance posture, and gap remediation reports.
"""

from fastapi import APIRouter, HTTPException, Depends
from enterprise.auth.dependencies import get_current_user, get_current_org_id, TokenData
from enterprise.frameworks.registry import (
    get_all_frameworks_summary,
    load_framework_mapping,
    FRAMEWORKS_METADATA,
)

router = APIRouter(prefix="/enterprise/frameworks", tags=["Governance & Compliance Frameworks"])


@router.get("")
def list_frameworks(
    current_user: TokenData = Depends(get_current_user),
):
    """List all supported regulatory and cybersecurity frameworks with coverage scores."""
    return {"frameworks": get_all_frameworks_summary()}


@router.get("/{framework_id}")
def get_framework_detail(
    framework_id: str,
    current_user: TokenData = Depends(get_current_user),
):
    """Retrieve full control mappings and evidence references for a specific framework."""
    mapping = load_framework_mapping(framework_id)
    if not mapping:
        raise HTTPException(status_code=404, detail=f"Framework '{framework_id}' not found.")
    meta = FRAMEWORKS_METADATA.get(framework_id, {})
    return {**meta, **mapping}


@router.get("/{framework_id}/gap-report")
def get_framework_gap_report(
    framework_id: str,
    current_user: TokenData = Depends(get_current_user),
):
    """Generates an executive gap analysis report highlighting unfulfilled regulatory controls."""
    mapping = load_framework_mapping(framework_id)
    if not mapping:
        raise HTTPException(status_code=404, detail=f"Framework '{framework_id}' not found.")

    controls = mapping.get("controls", [])
    gaps = [c for c in controls if c.get("status") in ("gap", "partial")]

    remediation_portfolio = list({c["remediation_action"] for c in gaps if c.get("remediation_action")})

    return {
        "framework_id": framework_id,
        "framework_name": mapping.get("name"),
        "total_controls": len(controls),
        "total_gaps": len(gaps),
        "gap_details": gaps,
        "recommended_remediations": remediation_portfolio,
        "compliance_summary": f"Identified {len(gaps)} gaps requiring remediation to achieve full compliance.",
    }
