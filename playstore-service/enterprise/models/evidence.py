"""
SentinelAI Enterprise - Evidence and Findings Model
Evidence records are append-mostly. Closed/reopened findings are tracked
via status transitions rather than record deletion.
Each record carries full provenance for traceability.
"""
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field
from enum import Enum


class FindingType(str, Enum):
    vulnerability      = "vulnerability"
    iam_risk           = "iam_risk"
    config_finding     = "config_finding"
    siem_alert         = "siem_alert"
    edr_detection      = "edr_detection"
    brand_impersonation = "brand_impersonation"
    threat_intel       = "threat_intel"
    scanner_finding    = "scanner_finding"  # From SentinelAI external scanners
    other              = "other"


class Severity(str, Enum):
    info     = "info"
    low      = "low"
    medium   = "medium"
    high     = "high"
    critical = "critical"


class FindingStatus(str, Enum):
    open        = "open"
    in_progress = "in_progress"
    resolved    = "resolved"
    accepted    = "accepted"   # Risk accepted; finding acknowledged
    suppressed  = "suppressed" # False positive or out of scope


class EvidenceCreate(BaseModel):
    org_id: str
    source_integration: str = Field(
        ..., description="Source system name, e.g. 'qualys_csv', 'sentinel_apk_scanner'"
    )
    source_record_id: str = Field(
        ..., description="ID in the source system (used for deduplication)"
    )
    asset_id: Optional[str] = Field(
        None, description="internal_id of the associated asset"
    )
    observation_time: datetime = Field(
        ..., description="When the finding was first observed in the source system"
    )
    ingestion_time: datetime = Field(
        default_factory=datetime.utcnow,
        description="When this record was ingested into SentinelAI"
    )
    finding_type: FindingType
    severity: Severity
    title: str
    description: str = ""
    status: FindingStatus = FindingStatus.open
    technical_identifiers: dict = Field(
        default_factory=dict,
        description="CVE IDs, rule IDs, package names, etc."
    )
    # Provenance
    import_batch_id: Optional[str] = None
    data_quality_note: str = Field(
        "", description="Notes on data quality, completeness, or freshness"
    )
    # The raw evidence is stored as a reference/hash, not the full record,
    # to avoid storing sensitive source data in the enterprise DB.
    source_record_hash: Optional[str] = Field(
        None, description="SHA-256 of original source record for integrity"
    )
    affected_scenario_ids: List[str] = Field(
        default_factory=list,
        description="Risk scenario IDs this finding is relevant to"
    )


class EvidenceOut(EvidenceCreate):
    id: str
    updated_at: datetime


class EvidenceUpdate(BaseModel):
    status: Optional[FindingStatus] = None
    data_quality_note: Optional[str] = None
    affected_scenario_ids: Optional[List[str]] = None
