"""
SentinelAI Enterprise - Scanner Findings Ingestion Adapter
Converts existing SentinelAI scanner results (APK analysis, Play Store scanner,
website scanner) into normalized Evidence records with FindingType = 'scanner_finding'.
Bridges the existing local scan engines with the enterprise risk engine.
"""

import hashlib
from typing import Any, List, Dict, Optional
from datetime import datetime

from enterprise.ingestion.base import NormalizationAdapter, IngestionBatchResult, RejectedRow
from enterprise.models.evidence import FindingType, Severity, FindingStatus


class ScannerFindingsAdapter(NormalizationAdapter):
    @property
    def source_type(self) -> str:
        return "scanner_findings"

    @property
    def description(self) -> str:
        return "Internal SentinelAI scanner output (APK static analysis, Play Store app scan, Website security scan)."

    @property
    def required_headers(self) -> List[str]:
        return ["scanner_type"]

    def normalize(self, raw_data: Any, org_id: str) -> IngestionBatchResult:
        """
        Accepts dict containing scanner output:
        {
            "scanner_type": "apk" | "website" | "playstore",
            "target": "com.example.app" | "https://example.com",
            "asset_id": "ASSET-001" (optional, defaults to matched or generic),
            "scan_id": "optional-uuid",
            "findings": [ ... ] or full scanner result dict
        }
        """
        if not isinstance(raw_data, dict):
            return IngestionBatchResult(
                source_integration="sentinel_scanner",
                source_type=self.source_type,
                total_rows=0,
                valid_count=0,
                rejected_count=1,
                rejected_rows=[RejectedRow(row_number=0, raw_data={}, reason="Expected dictionary for scanner output")]
            )

        scanner_type = raw_data.get("scanner_type") or "generic_scanner"
        target = raw_data.get("target") or raw_data.get("app_name") or raw_data.get("url") or "unknown_target"
        asset_id = raw_data.get("asset_id") or "ASSET-001"
        scan_id = raw_data.get("scan_id") or hashlib.md5(f"{scanner_type}-{target}-{datetime.utcnow().date()}".encode()).hexdigest()[:8]

        valid_records: List[Dict[str, Any]] = []
        rejected_rows: List[RejectedRow] = []

        # Extract findings list
        findings_list = []
        if "findings" in raw_data and isinstance(raw_data["findings"], list):
            findings_list = raw_data["findings"]
        elif "security_issues" in raw_data and isinstance(raw_data["security_issues"], list):
            findings_list = raw_data["security_issues"]
        elif "issues" in raw_data and isinstance(raw_data["issues"], list):
            findings_list = raw_data["issues"]
        elif "vulnerabilities" in raw_data and isinstance(raw_data["vulnerabilities"], list):
            findings_list = raw_data["vulnerabilities"]
        else:
            # Check for high-level risk summary
            risk_score = raw_data.get("risk_score") or raw_data.get("score")
            if risk_score is not None:
                findings_list.append({
                    "title": f"Aggregated {scanner_type.upper()} Security Scan Finding for {target}",
                    "severity": "high" if float(risk_score) > 70 else ("medium" if float(risk_score) > 40 else "low"),
                    "description": f"Scanner evaluated {target} with risk score {risk_score}/100.",
                    "id": f"{scanner_type}-aggregate",
                })

        for idx, item in enumerate(findings_list, start=1):
            if isinstance(item, str):
                title = item
                sev_str = "medium"
                desc = item
                fid = hashlib.md5(item.encode()).hexdigest()[:8]
            elif isinstance(item, dict):
                title = item.get("title") or item.get("name") or item.get("issue") or item.get("rule") or f"Finding #{idx}"
                sev_str = item.get("severity") or item.get("risk") or "medium"
                desc = item.get("description") or item.get("details") or title
                fid = str(item.get("id") or item.get("code") or hashlib.md5(title.encode()).hexdigest()[:8])
            else:
                rejected_rows.append(RejectedRow(row_number=idx, raw_data={"item": str(item)}, reason="Unrecognized finding element"))
                continue

            # Map severity
            sev_map = {
                "critical": Severity.critical,
                "high": Severity.high,
                "medium": Severity.medium,
                "low": Severity.low,
                "info": Severity.info,
            }
            severity = sev_map.get(str(sev_str).lower(), Severity.medium).value

            doc_id = f"{org_id}-SCAN-{scanner_type}-{scan_id}-{fid}"
            doc = {
                "_id": doc_id,
                "org_id": org_id,
                "source_integration": f"sentinel_{scanner_type}",
                "source_record_id": f"{scan_id}-{fid}",
                "asset_id": asset_id,
                "finding_type": FindingType.scanner_finding.value,
                "severity": severity,
                "title": title,
                "description": desc,
                "status": FindingStatus.open.value,
                "remediation_guidance": item.get("recommendation", "") if isinstance(item, dict) else "Remediate application security flaw identified during scanning.",
                "raw_metadata": {
                    "scanner_type": scanner_type,
                    "target": target,
                    "scan_id": scan_id,
                },
                "observation_time": datetime.utcnow(),
                "ingestion_time": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            valid_records.append(doc)

        return IngestionBatchResult(
            source_integration=f"sentinel_{scanner_type}",
            source_type=self.source_type,
            total_rows=len(findings_list),
            valid_count=len(valid_records),
            rejected_count=len(rejected_rows),
            valid_records=valid_records,
            rejected_rows=rejected_rows,
            metadata={"org_id": org_id, "target": target, "scanner_type": scanner_type}
        )
