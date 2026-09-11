"""
SentinelAI Enterprise - Simulation Models & Schemas
Defines request and response structures for counterfactual What-If analyses.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class InterventionType(str, Enum):
    enable_mfa             = "enable_mfa"
    patch_vulnerabilities  = "patch_vulnerabilities"
    network_segmentation   = "network_segmentation"
    immutable_backups      = "immutable_backups"
    enhance_monitoring     = "enhance_monitoring"
    delay_remediation      = "delay_remediation"
    custom_override        = "custom_override"


class Intervention(BaseModel):
    intervention_type: InterventionType
    name: str
    description: str = ""
    target_scenario_ids: List[str] = Field(default_factory=list)
    delay_days: Optional[int] = Field(None, ge=1, le=365, description="Exposure delay in days (for delay_remediation)")
    frequency_multiplier_override: Optional[float] = Field(None, ge=0.01, le=2.0)
    severity_multiplier_override: Optional[float] = Field(None, ge=0.01, le=2.0)
    downtime_multiplier_override: Optional[float] = Field(None, ge=0.01, le=2.0)


class SimulationRunRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: str = ""
    interventions: List[Intervention] = Field(default_factory=list)
    seed: int = Field(42, description="Synchronized random seed (Common Random Numbers)")
    num_iterations: int = Field(10_000, ge=1_000, le=50_000)


class ScenarioDelta(BaseModel):
    scenario_id: str
    scenario_name: str
    baseline_eal: float
    counterfactual_eal: float
    eal_reduction: float
    eal_reduction_pct: float
    baseline_var95: float
    counterfactual_var95: float


class SimulationRunOut(BaseModel):
    id: str
    org_id: str
    name: str
    description: str
    seed: int
    baseline_eal: float
    counterfactual_eal: float
    eal_reduction: float
    eal_reduction_pct: float
    baseline_var95: float
    counterfactual_var95: float
    var95_reduction: float
    scenario_deltas: List[ScenarioDelta]
    interventions_applied: List[Dict[str, Any]]
    created_at: datetime
