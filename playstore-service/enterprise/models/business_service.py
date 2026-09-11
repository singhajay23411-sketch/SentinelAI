"""
SentinelAI Enterprise - Business Service Model
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


class DowntimeCostAssumption(BaseModel):
    """
    Assumption about the cost of service downtime.
    All values must be in the organization currency.
    The assumption source and review date are required for traceability.
    """
    cost_per_hour: float = Field(..., description="Revenue/cost impact per hour of downtime")
    basis: str = Field(..., description="How this figure was estimated (e.g., analyst estimate, finance input)")
    review_date: date
    currency: str = "INR"


class BusinessServiceCreate(BaseModel):
    org_id: str
    name: str
    description: str = ""
    business_unit_id: Optional[str] = None
    owner_name: str = ""
    supporting_asset_ids: List[str] = Field(
        default_factory=list, description="internal_ids of assets supporting this service"
    )
    dependency_service_ids: List[str] = Field(
        default_factory=list, description="IDs of other services this service depends on"
    )
    downtime_cost: Optional[DowntimeCostAssumption] = None
    rto_hours: Optional[float] = Field(None, description="Recovery Time Objective in hours")
    rpo_hours: Optional[float] = Field(None, description="Recovery Point Objective in hours")
    importance: str = Field("medium", description="low | medium | high | critical")


class BusinessServiceOut(BusinessServiceCreate):
    id: str
    created_at: datetime
    updated_at: datetime
