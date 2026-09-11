"""
SentinelAI Enterprise - Asset Model
Assets represent applications, servers, databases, cloud resources, endpoints,
and identity systems. Each asset has a stable internal_id for referencing
across evidence and scenario records.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class AssetType(str, Enum):
    application      = "application"
    server           = "server"
    database         = "database"
    cloud_resource   = "cloud_resource"
    endpoint         = "endpoint"
    identity_system  = "identity_system"
    network_device   = "network_device"
    saas_service     = "saas_service"
    other            = "other"


class DataSensitivity(str, Enum):
    public       = "public"
    internal     = "internal"
    confidential = "confidential"
    restricted   = "restricted"


class Criticality(str, Enum):
    low      = "low"
    medium   = "medium"
    high     = "high"
    critical = "critical"


class AssetCreate(BaseModel):
    org_id: str
    internal_id: str = Field(..., description="Stable org-scoped identifier (e.g. ASSET-001)")
    name: str
    asset_type: AssetType
    business_unit_id: Optional[str] = None
    owner_name: str = ""
    environment: str = Field("production", description="production | staging | development")
    internet_exposed: bool = False
    data_sensitivity: DataSensitivity = DataSensitivity.internal
    record_volume_estimate: Optional[int] = Field(
        None, description="Approximate number of records stored (for breach cost modeling)"
    )
    criticality: Criticality = Criticality.medium
    supporting_services: List[str] = Field(
        default_factory=list,
        description="IDs of business services this asset supports"
    )
    dependencies: List[str] = Field(
        default_factory=list,
        description="internal_ids of other assets this asset depends on"
    )
    source_system: str = Field("manual", description="Source system or import batch ID")
    external_source_ids: dict = Field(
        default_factory=dict,
        description="IDs from external systems, e.g. {'qualys': 'QVM-1234'}"
    )
    notes: str = ""


class AssetOut(AssetCreate):
    id: str
    created_at: datetime
    updated_at: datetime
    last_seen: Optional[datetime]
