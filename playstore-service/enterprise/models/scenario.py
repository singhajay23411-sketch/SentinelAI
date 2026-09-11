"""
SentinelAI Enterprise - Risk Scenario Model
Scenarios model specific threat events and their business consequences.
All monetary values are in the organization currency (default INR).
Parameters marked as assumptions must cite their basis.
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class FrequencyModel(str, Enum):
    poisson     = "poisson"    # Incidents in a year ~ Poisson(lambda)
    fixed_rate  = "fixed_rate" # Use a deterministic rate
    analyst_estimate = "analyst_estimate"


class LossComponentAssumption(BaseModel):
    """A single component of the total loss per incident."""
    name: str
    description: str
    min_inr: float = Field(..., description="Minimum estimated loss (INR)")
    max_inr: float = Field(..., description="Maximum estimated loss (INR)")
    most_likely_inr: float = Field(..., description="Most likely loss (INR)")
    basis: str = Field(..., description="Source or rationale for this estimate")
    conditional: bool = Field(
        False,
        description="True if this component only applies under specific conditions"
    )
    condition_description: str = ""
    overlaps_with: List[str] = Field(
        default_factory=list,
        description="Names of other components this overlaps with (to prevent double-counting)"
    )


class ScenarioCreate(BaseModel):
    org_id: str
    name: str
    threat_event: str = Field(..., description="What happens (e.g. Ransomware deployment)")
    business_consequence: str = Field(
        ..., description="Business impact (e.g. Core banking system downtime)"
    )
    affected_asset_ids: List[str] = Field(default_factory=list)
    affected_service_ids: List[str] = Field(default_factory=list)
    evidence_ids: List[str] = Field(
        default_factory=list,
        description="Evidence records that inform this scenario"
    )
    applicable_control_ids: List[str] = Field(default_factory=list)

    # Frequency parameters
    frequency_model: FrequencyModel = FrequencyModel.analyst_estimate
    expected_incidents_per_year: float = Field(
        ...,
        description="Expected number of incidents per year (lambda for Poisson model)"
    )
    frequency_basis: str = Field(
        ..., description="Rationale for the frequency estimate (e.g. industry data, analyst judgment)"
    )

    # Loss components
    loss_components: List[LossComponentAssumption] = Field(
        default_factory=list,
        description="Separately modeled loss components. Overlapping components must be flagged."
    )

    # Modeling metadata
    model_version: str = "1.0"
    assumption_review_date: Optional[date] = None
    is_active: bool = True
    notes: str = ""


class ScenarioOut(ScenarioCreate):
    id: str
    created_at: datetime
    updated_at: datetime


class AssessmentSummary(BaseModel):
    """Top-level financial summary included in an assessment snapshot."""
    expected_annual_loss_inr: float
    var_95_inr: float
    var_99_inr: Optional[float] = None
    currency: str = "INR"
    horizon_years: int = 1
    simulation_count: int
    seed: int
    model_version: str
    data_quality_note: str = ""
    top_contributors: List[dict] = Field(
        default_factory=list,
        description="List of top scenarios by EAL contribution"
    )


class AssessmentCreate(BaseModel):
    """Immutable assessment snapshot. Created by the risk engine, not by users."""
    org_id: str
    triggered_by: str = Field(
        ..., description="What triggered this assessment (e.g. 'evidence_update', 'manual', 'scheduled')"
    )
    summary: AssessmentSummary
    scenario_results: List[dict] = Field(
        default_factory=list,
        description="Per-scenario EAL, VaR, and parameter values"
    )
    model_inputs: dict = Field(
        default_factory=dict,
        description="All inputs used in this assessment (for reproducibility)"
    )
    is_latest: bool = True


class AssessmentOut(AssessmentCreate):
    id: str
    created_at: datetime
