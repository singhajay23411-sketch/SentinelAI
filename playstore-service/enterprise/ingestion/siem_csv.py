"""
SentinelAI Enterprise - SIEM Alert CSV Ingestion Adapter
Parses SIEM alert exports (Splunk, Microsoft Sentinel, QRadar, Wazuh, Elastic).
Generates normalized Evidence records with FindingType = 'siem_alert'.
"""

import csv
import io
import hashlib
from typing import Any, List, Dict, Optional
from datetime import datetime

from enterprise.ingestion.base import NormalizationAdapter, IngestionBatchResult, RejectedRow
from enterprise.models.evidence import FindingType, Severity, FindingStatus


class SIEMCSVAdapter(NormalizationAdapter):
    @property
    def source_type(self) -> str:
        return "siem_csv"

    @property
    def description(self) -> str:
        return "SIEM alert export. Required: alert_id/rule_name, timestamp. Optional: severity, target_asset, description, status."

    @property
    def required_headers(self) -> List[str]:
        return ["rule_name"]

    def normalize(self, raw_data: Any, org_id: str) -> IngestionBatchResult:
        rows: List[Dict[str, Any]] = []
        if isinstance(raw_data, str):
            reader = csv.DictReader(io.StringIO(raw_data.strip()))
            rows = [dict(r) for r in reader]
        elif isinstance(raw_data, list):
            rows = raw_data
        else:
            return IngestionBatchResult(
                source_integration="siem_csv",
                source_type=self.source_type,
                total_rows=0,
                valid_count=0,
                rejected_count=1,
                rejected_rows=[RejectedRow(row_number=0, raw_data={}, reason="Unsupported format; expected CSV or dict list.")]
            )

        valid_records: List[Dict[str, Any]] = []
        rejected_rows: List[RejectedRow] = []

        for idx, row in enumerate(rows, start=1):
            cleaned = {str(k).strip().lower().replace(" ", "_"): str(v).strip() for k, v in row.items() if k is not None}

            rule_name = cleaned.get("rule_name") or cleaned.get("alert_name") or cleaned.get("signature") or cleaned.get("title")
            if not rule_name:
                rejected_rows.append(RejectedRow(
                    row_number=idx,
                    raw_data=row,
                    reason="Missing required column 'rule_name' or 'alert_name'",
                    error_field="rule_name"
                ))
                continue

            alert_id = cleaned.get("alert_id") or cleaned.get("id") or cleaned.get("event_id")
            if not alert_id:
                alert_id = hashlib.md5(f"{rule_name}-{idx}".encode("utf-8")).hexdigest()[:10]

            target_asset = cleaned.get("target_asset") or cleaned.get("asset_id") or cleaned.get("host") or cleaned.get("destination_ip") or "ASSET-001"

            raw_sev = cleaned.get("severity") or cleaned.get("priority") or "medium"
            sev_map = {
                "critical": Severity.critical,
                "high": Severity.high,
                "medium": Severity.medium,
                "low": Severity.low,
                "info": Severity.info,
            }
            severity = sev_map.get(raw_sev.lower(), Severity.medium).value

            raw_date = cleaned.get("timestamp") or cleaned.get("time") or cleaned.get("event_time")
            obs_time = datetime.utcnow()
            if raw_date:
                for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
                    try:
                        obs_time = datetime.strptime(raw_date.split(".")[0], fmt)
                        break
                    except ValueError:
                        pass

            doc_id = f"{org_id}-SIEM-{alert_id}"
            doc = {
                "_id": doc_id,
                "org_id": org_id,
                "source_integration": "siem_csv",
                "source_record_id": alert_id,
                "asset_id": target_asset,
                "finding_type": FindingType.siem_alert.value,
                "severity": severity,
                "title": f"SIEM Alert: {rule_name}",
                "description": cleaned.get("description") or f"Security incident alert triggered: {rule_name}",
                "status": FindingStatus.open.value,
                "remediation_guidance": "Triage alert, examine host logs, check endpoint telemetry and isolate if malicious.",
                "raw_metadata": {
                    "source_ip": cleaned.get("source_ip"),
                    "destination_ip": cleaned.get("destination_ip"),
                    "rule_name": rule_name,
                },
                "observation_time": obs_time,
                "ingestion_time": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            valid_records.append(doc)

        return IngestionBatchResult(
            source_integration="siem_csv",
            source_type=self.source_type,
            total_rows=len(rows),
            valid_count=len(valid_records),
            rejected_count=len(rejected_rows),
            valid_records=valid_records,
            rejected_rows=rejected_rows,
            metadata={"org_id": org_id}
        )
