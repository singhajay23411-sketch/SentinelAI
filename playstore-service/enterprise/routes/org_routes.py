"""
SentinelAI Enterprise - Organization Routes
GET  /enterprise/orgs/{org_id}              - Get organization details
PUT  /enterprise/orgs/{org_id}              - Update organization
GET  /enterprise/orgs/{org_id}/units        - List business units
POST /enterprise/orgs/{org_id}/units        - Create business unit
"""
import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status

from enterprise.auth.dependencies import get_current_user, require_org_member, require_analyst, TokenData
from enterprise.models.organization import OrganizationOut, BusinessUnitCreate, BusinessUnitOut
import enterprise.db.collections as cols

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/enterprise/orgs", tags=["Organizations"])


def _check_org(org_id: str, token: TokenData) -> dict:
    """Validate org access and return the org document."""
    require_org_member(org_id, token)
    org = cols.organizations().find_one({"_id": org_id})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return org


@router.get("/{org_id}", response_model=OrganizationOut)
def get_org(org_id: str, token: TokenData = Depends(get_current_user)):
    org = _check_org(org_id, token)
    return OrganizationOut(
        id=org["_id"],
        name=org["name"],
        industry=org.get("industry", ""),
        currency=org.get("currency", "INR"),
        timezone=org.get("timezone", "Asia/Kolkata"),
        risk_appetite=org.get("risk_appetite"),
        is_demo=org.get("is_demo", False),
        created_at=org["created_at"],
    )


@router.get("/{org_id}/units")
def list_units(org_id: str, token: TokenData = Depends(get_current_user)):
    require_org_member(org_id, token)
    units = list(cols.business_units().find({"org_id": org_id}))
    for u in units:
        u["id"] = str(u.pop("_id"))
    return {"org_id": org_id, "units": units}


@router.post("/{org_id}/units", status_code=status.HTTP_201_CREATED)
def create_unit(org_id: str, body: BusinessUnitCreate, token: TokenData = Depends(require_analyst)):
    require_org_member(org_id, token)
    unit_id = str(uuid.uuid4())
    now = datetime.utcnow()
    doc = {
        "_id": unit_id,
        "org_id": org_id,
        "name": body.name,
        "description": body.description,
        "owner_name": body.owner_name,
        "annual_revenue_estimate": body.annual_revenue_estimate,
        "headcount": body.headcount,
        "created_at": now,
        "updated_at": now,
    }
    cols.business_units().insert_one(doc)
    doc["id"] = unit_id
    return doc
