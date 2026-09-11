"""
SentinelAI Enterprise - Asset CSV Ingestion Adapter
Parses asset inventory CSV files into normalized Asset models.
Handles flexible column names, case insensitivity, and type conversions.
"""

import csv
import io
from typing import Any, List, Dict, Optional
from datetime import datetime

from enterprise.ingestion.base import NormalizationAdapter, IngestionBatchResult, RejectedRow
from enterprise.models.asset import AssetType, Criticality, DataSensitivity


class AssetCSVAdapter(NormalizationAdapter):
    @property
    def source_type(self) -> str:
        return "asset_csv"

    @property
    def description(self) -> str:
        return "Asset inventory CSV export. Required columns: internal_id, name. Optional: asset_type, criticality, data_sensitivity, owner_name, environment, internet_exposed, record_volume_estimate, dependencies."

    @property
    def required_headers(self) -> List[str]:
        return ["internal_id", "name"]

    def normalize(self, raw_data: Any, org_id: str) -> IngestionBatchResult:
        """
        Takes CSV string, list of dicts, or file-like object.
        Normalizes into asset records.
        """
        rows: List[Dict[str, Any]] = []
        if isinstance(raw_data, str):
            reader = csv.DictReader(io.StringIO(raw_data.strip()))
            rows = [dict(r) for r in reader]
        elif isinstance(raw_data, list):
            rows = raw_data
        else:
            return IngestionBatchResult(
                source_integration="asset_csv",
                source_type=self.source_type,
                total_rows=0,
                valid_count=0,
                rejected_count=1,
                rejected_rows=[RejectedRow(row_number=0, raw_data={}, reason="Unsupported data format. Expected CSV string or list of dicts.")]
            )

        valid_records: List[Dict[str, Any]] = []
        rejected_rows: List[RejectedRow] = []

        for idx, row in enumerate(rows, start=1):
            # Normalize keys to lower snake_case
            cleaned = {str(k).strip().lower().replace(" ", "_"): str(v).strip() for k, v in row.items() if k is not None}

            internal_id = cleaned.get("internal_id") or cleaned.get("id") or cleaned.get("asset_id")
            if not internal_id:
                rejected_rows.append(RejectedRow(
                    row_number=idx,
                    raw_data=row,
                    reason="Missing required column 'internal_id' or 'asset_id'",
                    error_field="internal_id"
                ))
                continue

            name = cleaned.get("name") or cleaned.get("asset_name")
            if not name:
                rejected_rows.append(RejectedRow(
                    row_number=idx,
                    raw_data=row,
                    reason="Missing required column 'name'",
                    error_field="name"
                ))
                continue

            # Parse asset_type
            raw_type = cleaned.get("asset_type") or cleaned.get("type") or "other"
            try:
                asset_type = AssetType(raw_type.lower()).value
            except ValueError:
                asset_type = AssetType.other.value

            # Parse criticality
            raw_crit = cleaned.get("criticality") or cleaned.get("criticality_level") or "medium"
            try:
                criticality = Criticality(raw_crit.lower()).value
            except ValueError:
                criticality = Criticality.medium.value

            # Parse data_sensitivity
            raw_sens = cleaned.get("data_sensitivity") or cleaned.get("sensitivity") or "internal"
            try:
                data_sensitivity = DataSensitivity(raw_sens.lower()).value
            except ValueError:
                data_sensitivity = DataSensitivity.internal.value

            # Parse internet_exposed
            raw_exp = cleaned.get("internet_exposed") or cleaned.get("public_facing") or cleaned.get("is_public") or "false"
            internet_exposed = str(raw_exp).lower() in ("true", "1", "yes", "y", "t")

            # Parse record_volume_estimate
            raw_rec = cleaned.get("record_volume_estimate") or cleaned.get("records") or cleaned.get("records_count")
            record_volume = None
            if raw_rec:
                try:
                    record_volume = int(float(str(raw_rec).replace(",", "")))
                except (ValueError, TypeError):
                    record_volume = None

            # Parse lists
            def _parse_list(val: Optional[str]) -> List[str]:
                if not val:
                    return []
                delim = ";" if ";" in val else ","
                return [item.strip() for item in val.split(delim) if item.strip()]

            dependencies = _parse_list(cleaned.get("dependencies"))
            supporting_services = _parse_list(cleaned.get("supporting_services") or cleaned.get("services"))

            doc = {
                "_id": f"{org_id}-{internal_id}",
                "org_id": org_id,
                "internal_id": internal_id,
                "name": name,
                "asset_type": asset_type,
                "criticality": criticality,
                "data_sensitivity": data_sensitivity,
                "owner_name": cleaned.get("owner_name") or cleaned.get("owner") or "",
                "environment": cleaned.get("environment") or "production",
                "internet_exposed": internet_exposed,
                "record_volume_estimate": record_volume,
                "business_unit_id": cleaned.get("business_unit_id"),
                "supporting_services": supporting_services,
                "dependencies": dependencies,
                "source_integration": "asset_csv",
                "updated_at": datetime.utcnow(),
                "created_at": datetime.utcnow(),
            }
            valid_records.append(doc)

        return IngestionBatchResult(
            source_integration="asset_csv",
            source_type=self.source_type,
            total_rows=len(rows),
            valid_count=len(valid_records),
            rejected_count=len(rejected_rows),
            valid_records=valid_records,
            rejected_rows=rejected_rows,
            metadata={"org_id": org_id}
        )
