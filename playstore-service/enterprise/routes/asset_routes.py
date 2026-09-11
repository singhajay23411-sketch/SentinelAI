"""
SentinelAI Enterprise - Asset Routes
GET  /enterprise/orgs/{org_id}/assets       - List assets with filters
POST /enterprise/orgs/{org_id}/assets       - Create asset
GET  /enterprise/orgs/{org_id}/assets/{id}  - Get asset detail
PUT  /enterprise/orgs/{org_id}/assets/{id}  - Update asset
"""
import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query, status

from enterprise.auth.dependencies import get_current_user, require_org_member, require_analyst, TokenData
from enterprise.models.asset import AssetCreate, AssetOut
import enterprise.db.collections as cols

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/enterprise/orgs", tags=["Assets"])


@router.get("/{org_id}/assets")
def list_assets(
    org_id: str,
    asset_type: str = Query(None),
    criticality: str = Query(None),
    internet_exposed: bool = Query(None),
    skip: int = 0,
    limit: int = 100,
    token: TokenData = Depends(get_current_user),
):
    require_org_member(org_id, token)
    query: dict = {"org_id": org_id}
    if asset_type:
        query["asset_type"] = asset_type
    if criticality:
        query["criticality"] = criticality
    if internet_exposed is not None:
        query["internet_exposed"] = internet_exposed

    total = cols.assets().count_documents(query)
    items = list(cols.assets().find(query).skip(skip).limit(limit))
    for a in items:
        a["id"] = str(a.pop("_id"))
    return {"org_id": org_id, "total": total, "assets": items}


@router.post("/{org_id}/assets", status_code=status.HTTP_201_CREATED)
def create_asset(org_id: str, body: AssetCreate, token: TokenData = Depends(require_analyst)):
    require_org_member(org_id, token)
    # Check internal_id uniqueness within org
    if cols.assets().find_one({"org_id": org_id, "internal_id": body.internal_id}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Asset with internal_id '{body.internal_id}' already exists in this org.",
        )
    asset_id = str(uuid.uuid4())
    now = datetime.utcnow()
    doc = body.model_dump()
    doc["_id"] = asset_id
    doc["org_id"] = org_id
    doc["created_at"] = now
    doc["updated_at"] = now
    doc["last_seen"] = now
    cols.assets().insert_one(doc)
    doc["id"] = asset_id
    return doc


@router.get("/{org_id}/assets/{asset_id}")
def get_asset(org_id: str, asset_id: str, token: TokenData = Depends(get_current_user)):
    require_org_member(org_id, token)
    doc = cols.assets().find_one({"_id": asset_id, "org_id": org_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Asset not found.")
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.put("/{org_id}/assets/{asset_id}")
def update_asset(
    org_id: str, asset_id: str, body: AssetCreate,
    token: TokenData = Depends(require_analyst)
):
    require_org_member(org_id, token)
    now = datetime.utcnow()
    update = body.model_dump(exclude={"org_id"})
    update["updated_at"] = now
    result = cols.assets().update_one(
        {"_id": asset_id, "org_id": org_id},
        {"$set": update}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found.")
    doc = cols.assets().find_one({"_id": asset_id})
    doc["id"] = str(doc.pop("_id"))
    return doc
