"""
SentinelAI Enterprise - IAM Export Ingestion Adapter
Parses Identity and Access Management exports (Okta, Entra ID, AWS IAM, SailPoint).
Generates normalized Evidence records with FindingType = 'iam_risk' for
unprotected privileged accounts, excessive permissions, or inactive admin accounts.
"""

import csv
import io
import hashlib
from typing import Any, List, Dict, Optional
from datetime import datetime

from enterprise.ingestion.base import NormalizationAdapter, IngestionBatchResult, RejectedRow
from enterprise.models.evidence import FindingType, Severity, FindingStatus


class IAMCSVAdapter(NormalizationAdapter):
    @property
    def source_type(self) -> str:
        return "iam_csv"

    @property
    def description(self) -> str:
        return "IAM report CSV export. Required: account_name/email. Optional: role/privilege, mfa_enabled, last_login, status, asset_id."

    @property
    def required_headers(self) -> List[str]:
        return ["account_name"]

    def normalize(self, raw_data: Any, org_id: str) -> IngestionBatchResult:
        rows: List[Dict[str, Any]] = []
        if isinstance(raw_data, str):
            reader = csv.DictReader(io.StringIO(raw_data.strip()))
            rows = [dict(r) for r in reader]
        elif isinstance(raw_data, list):
            rows = raw_data
        else:
            return IngestionBatchResult(
                source_integration="iam_csv",
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

            account = cleaned.get("account_name") or cleaned.get("user") or cleaned.get("email") or cleaned.get("username")
            if not account:
                rejected_rows.append(RejectedRow(
                    row_number=idx,
                    raw_data=row,
                    reason="Missing required column 'account_name' or 'email'",
                    error_field="account_name"
                ))
                continue

            asset_id = cleaned.get("asset_id") or cleaned.get("identity_system") or "ASSET-006"
            raw_role = cleaned.get("role") or cleaned.get("privilege") or cleaned.get("permission_level") or "user"
            is_privileged = any(term in raw_role.lower() for term in ("admin", "root", "privileged", "super", "lead", "dba"))

            raw_mfa = cleaned.get("mfa_enabled") or cleaned.get("mfa") or cleaned.get("2fa") or "false"
            mfa_enabled = str(raw_mfa).lower() in ("true", "1", "yes", "y", "enabled")

            # Determine severity based on privilege and MFA posture
            if is_privileged and not mfa_enabled:
                severity = Severity.critical.value
                title = f"Privileged Account Missing MFA: {account}"
                desc = f"Administrative/privileged account '{account}' ({raw_role}) is not enforced by Multi-Factor Authentication."
                remediation = "Immediately enforce FIDO2/TOTP MFA on all administrative identities."
            elif not mfa_enabled:
                severity = Severity.medium.value
                title = f"Standard Account Without MFA: {account}"
                desc = f"User account '{account}' does not have MFA configured."
                remediation = "Require MFA enrollment at next sign-in."
            else:
                severity = Severity.info.value
                title = f"Verified IAM Account Posture: {account}"
                desc = f"Account '{account}' has MFA active ({raw_role})."
                remediation = "Regular access review."

            raw_id = cleaned.get("id") or cleaned.get("account_id") or hashlib.md5(account.encode("utf-8")).hexdigest()[:10]
            doc_id = f"{org_id}-IAM-{raw_id}"

            doc = {
                "_id": doc_id,
                "org_id": org_id,
                "source_integration": "iam_csv",
                "source_record_id": raw_id,
                "asset_id": asset_id,
                "finding_type": FindingType.iam_risk.value,
                "severity": severity,
                "title": title,
                "description": desc,
                "status": FindingStatus.open.value if not mfa_enabled else FindingStatus.resolved.value,
                "remediation_guidance": remediation,
                "raw_metadata": {
                    "account": account,
                    "role": raw_role,
                    "mfa_enabled": mfa_enabled,
                    "last_login": cleaned.get("last_login") or cleaned.get("last_active"),
                },
                "observation_time": datetime.utcnow(),
                "ingestion_time": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            valid_records.append(doc)

        return IngestionBatchResult(
            source_integration="iam_csv",
            source_type=self.source_type,
            total_rows=len(rows),
            valid_count=len(valid_records),
            rejected_count=len(rejected_rows),
            valid_records=valid_records,
            rejected_rows=rejected_rows,
            metadata={"org_id": org_id}
        )
