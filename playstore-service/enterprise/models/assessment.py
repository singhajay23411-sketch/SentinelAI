"""
SentinelAI Enterprise - Assessment and Job Models.
"""
from datetime import datetime
from typing import Optional, Any, List
from pydantic import BaseModel, Field
from enum import Enum

from enterprise.models.scenario import AssessmentCreate, AssessmentOut, AssessmentSummary


class JobStatus(str, Enum):
    pending    = "pending"
    running    = "running"
    completed  = "completed"
    failed     = "failed"
    retrying   = "retrying"


class JobType(str, Enum):
    evidence_ingest    = "evidence_ingest"
    risk_reassess      = "risk_reassess"
    simulation_run     = "simulation_run"
    optimizer_run      = "optimizer_run"
    report_generate    = "report_generate"
    demo_load          = "demo_load"


class JobCreate(BaseModel):
    org_id: str
    job_type: JobType
    payload: dict = Field(default_factory=dict)
    max_retries: int = 3


class JobOut(BaseModel):
    id: str
    org_id: str
    job_type: JobType
    status: JobStatus
    payload: dict
    result: Optional[dict] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    max_retries: int
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
