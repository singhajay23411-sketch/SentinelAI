"""
SentinelAI Enterprise - Vulnerability CSV Ingestion Adapter
Parses vulnerability scan exports (Qualys, Tenable, Nessus, Trivy, DefectDojo)
into normalized Evidence records with FindingType = 'vulnerability'.
"""

import csv
import io
import hashlib
from typing import Any, List, Dict, Optional
from datetime import datetime

from enterprise.ingestion.base import NormalizationAdapter, IngestionBatchResult, RejectedRow
from enterprise.models.evidence import FindingType, Severity, FindingStatus


class VulnCSVAdapter(NormalizationAdapter):
    @property
    def source_type(self) -> str:
        return "vuln_csv"

    @property
    def description(self) -> str:
        return "Vulnerability scan CSV. Required: finding_id/cve, title, asset_id. Optional: severity, cvss_score, description, remediation, status."

    @property
    def required_headers(self) -> List[str]:
        return ["title", "asset_id"]

    def normalize(self, raw_data: Any, org_id: str) -> IngestionBatchResult:
        rows: List[Dict[str, Any]] = []
        if isinstance(raw_data, str):
            reader = csv.DictReader(io.StringIO(raw_data.strip()))
            rows = [dict(r) for r in reader]
        elif isinstance(raw_data, list):
            rows = raw_data
        else:
            return IngestionBatchResult(
                source_integration="vuln_csv",
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

            title = cleaned.get("title") or cleaned.get("vulnerability_title") or cleaned.get("name") or cleaned.get("vulnerability_name")
            if not title:
                rejected_rows.append(RejectedRow(
                    row_number=idx,
                    raw_data=row,
                    reason="Missing required column 'title' or 'vulnerability_title'",
                    error_field="title"
                ))
                continue

            asset_id = cleaned.get("asset_id") or cleaned.get("target") or cleaned.get("host") or cleaned.get("asset")
            if not asset_id:
                rejected_rows.append(RejectedRow(
                    row_number=idx,
                    raw_data=row,
                    reason="Missing required column 'asset_id' or 'host'",
                    error_field="asset_id"
                ))
                continue

            # Source record ID: from cve, qid, finding_id, or deterministic hash
            raw_id = cleaned.get("finding_id") or cleaned.get("cve") or cleaned.get("cve_id") or cleaned.get("plugin_id") or cleaned.get("qid")
            if not raw_id:
                raw_id = hashlib.md5(f"{asset_id}-{title}".encode("utf-8")).hexdigest()[:12]

            # Parse severity
            raw_sev = cleaned.get("severity") or cleaned.get("risk") or cleaned.get("priority") or "medium"
            sev_map = {
                "critical": Severity.critical,
                "high": Severity.high,
                "medium": Severity.medium,
                "moderate": Severity.medium,
                "low": Severity.low,
                "info": Severity.info,
                "informational": Severity.info,
                "5": Severity.critical,
                "4": Severity.high,
                "3": Severity.medium,
                "2": Severity.low,
                "1": Severity.info,
            }
            severity = sev_map.get(raw_sev.lower(), Severity.medium).value

            # Parse CVSS
            cvss_score = None
            raw_cvss = cleaned.get("cvss") or cleaned.get("cvss_score") or cleaned.get("cvss_v3")
            if raw_cvss:
                try:
                    cvss_score = float(raw_cvss)
                except (ValueError, TypeError):
                    cvss_score = None

            # Parse status
            raw_status = cleaned.get("status") or cleaned.get("state") or "open"
            status_map = {
                "open": FindingStatus.open.value,
                "in_progress": FindingStatus.in_progress.value,
                "resolved": FindingStatus.resolved.value,
                "fixed": FindingStatus.resolved.value,
                "closed": FindingStatus.resolved.value,
                "accepted": FindingStatus.accepted.value,
                "suppressed": FindingStatus.suppressed.value,
            }
            finding_status = status_map.get(raw_status.lower(), FindingStatus.open.value)

            # Observation date
            raw_date = cleaned.get("first_detected") or cleaned.get("observation_time") or cleaned.get("date")
            obs_time = datetime.utcnow()
            if raw_date:
                for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%d/%m/%Y", "%m/%d/%Y"):
                    try:
                        obs_time = datetime.strptime(raw_date.split("T")[0] if "T" in raw_date else raw_date, fmt)
                        break
                    except ValueError:
                        pass

            doc_id = f"{org_id}-VULN-{asset_id}-{raw_id}"
            doc = {
                "_id": doc_id,
                "org_id": org_id,
                "source_integration": "vuln_csv",
                "source_record_id": raw_id,
                "asset_id": asset_id,
                "finding_type": FindingType.vulnerability.value,
                "severity": severity,
                "title": title,
                "description": cleaned.get("description") or f"Vulnerability {title} identified on asset {asset_id}",
                "cve_id": cleaned.get("cve") or cleaned.get("cve_id"),
                "cvss_score": cvss_score,
                "status": finding_status,
                "remediation_guidance": cleaned.get("remediation") or cleaned.get("solution") or "",
                "observation_time": obs_time,
                "ingestion_time": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            valid_records.append(doc)

        return IngestionBatchResult(
            source_integration="vuln_csv",
            source_type=self.source_type,
            total_rows=len(rows),
            valid_count=len(valid_records),
            rejected_count=len(rejected_rows),
            valid_records=valid_records,
            rejected_rows=rejected_rows,
            metadata={"org_id": org_id}
        )
