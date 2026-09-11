"""
SentinelAI Enterprise - Organization and Business Unit Models
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class RiskAppetite(BaseModel):
    """Configurable risk appetite thresholds (in currency)."""
    exposure_limit_eal: float = Field(
        ..., description="Max acceptable Expected Annual Loss (EAL) in org currency"
    )
    exposure_limit_var95: float = Field(
        ..., description="Max acceptable 95th-percentile annual VaR in org currency"
    )
    currency: str = "INR"


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    industry: str = "Financial Services"
    currency: str = "INR"
    timezone: str = "Asia/Kolkata"
    risk_appetite: Optional[RiskAppetite] = None
    is_demo: bool = False


class OrganizationOut(BaseModel):
    id: str
    name: str
    industry: str
    currency: str
    timezone: str
    risk_appetite: Optional[RiskAppetite]
    is_demo: bool
    created_at: datetime


class BusinessUnitCreate(BaseModel):
    org_id: str
    name: str = Field(..., min_length=2)
    description: str = ""
    owner_name: str = ""
    annual_revenue_estimate: Optional[float] = Field(
        None, description="Estimated annual revenue (org currency); used in loss models"
    )
    headcount: Optional[int] = None


class BusinessUnitOut(BusinessUnitCreate):
    id: str
    created_at: datetime
