"""
SentinelAI Enterprise - Control Model
Controls represent security measures. Effectiveness is based on evidence,
not assumed from purchase or configuration alone.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class ControlStatus(str, Enum):
    purchased    = "purchased"     # License/contract exists
    configured   = "configured"    # Deployed and configured
    covering     = "covering"      # Covering relevant assets
    tested       = "tested"        # Tested and verified effective
    unknown      = "unknown"


class ControlCreate(BaseModel):
    org_id: str
    name: str
    description: str = ""
    control_type: str = Field(
        ...,
        description="e.g. preventive | detective | corrective | compensating"
    )
    status: ControlStatus = ControlStatus.unknown
    covered_asset_ids: List[str] = Field(default_factory=list)
    covered_service_ids: List[str] = Field(default_factory=list)
    coverage_percentage: Optional[float] = Field(
        None, ge=0, le=100,
        description="Percentage of relevant assets/accounts covered"
    )
    implementation_evidence: str = Field(
        "", description="Description of evidence supporting the claimed status"
    )
    last_observed: Optional[date] = None
    next_review: Optional[date] = None
    # Effectiveness assumptions for the financial model
    # These are explicitly analyst assumptions, not objective measurements
    effectiveness_assumption: str = Field(
        "",
        description="How this control modifies scenario parameters and the basis for the assumption"
    )
    applicable_scenario_ids: List[str] = Field(default_factory=list)
    # Framework references
    framework_references: List[dict] = Field(
        default_factory=list,
        description="e.g. [{'framework': 'ISO27001:2022', 'ref': 'A.8.5'}]"
    )


class ControlOut(ControlCreate):
    id: str
    created_at: datetime
    updated_at: datetime
