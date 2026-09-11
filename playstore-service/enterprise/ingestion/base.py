"""
SentinelAI Enterprise - Ingestion Base Adapter & Data Structures
Defines standard interfaces for all data normalization adapters.
Every adapter must document its expected input schema, produce normalized records,
and return explicit rejected-row reports with precise reasons.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class RejectedRow(BaseModel):
    row_number: int
    raw_data: Dict[str, Any]
    reason: str
    error_field: Optional[str] = None


class IngestionBatchResult(BaseModel):
    source_integration: str
    source_type: str
    total_rows: int
    valid_count: int
    rejected_count: int
    valid_records: List[Dict[str, Any]] = Field(default_factory=list)
    rejected_rows: List[RejectedRow] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    ingested_at: datetime = Field(default_factory=datetime.utcnow)


class NormalizationAdapter(ABC):
    """Abstract base class for ingestion adapters."""

    @property
    @abstractmethod
    def source_type(self) -> str:
        """Identifier for source type, e.g. 'asset_csv', 'vuln_csv', etc."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description of the expected format."""
        pass

    @property
    @abstractmethod
    def required_headers(self) -> List[str]:
        """Headers or top-level keys required in the input."""
        pass

    @abstractmethod
    def normalize(self, raw_data: Any, org_id: str) -> IngestionBatchResult:
        """
        Normalize raw rows/data into valid domain records.
        Invalid rows must not throw exceptions; they must be appended to rejected_rows.
        """
        pass
