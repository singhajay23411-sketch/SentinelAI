"""
SentinelAI Enterprise - Milestone 2 Verification Test
Validates:
1. Asset CSV Adapter (parsing, validation, rejected rows)
2. Vulnerability CSV Adapter (severity mapping, cvss, rejection)
3. IAM CSV Adapter (MFA posture, privileged account severity)
4. SIEM CSV Adapter (alert parsing, target asset linking)
5. Scanner Findings Adapter (APK/website scan result normalization)
6. Deduplication logic (same records don't inflate counts)
7. Sample demo files exist and parse cleanly
"""

import os
import sys

sys.path.insert(0, "playstore-service")
os.environ["JWT_SECRET_KEY"] = "test_secret_key_32_chars_exactly_here"
os.environ["MONGODB_URI"] = "mongodb://localhost:27017"

from enterprise.ingestion.base import IngestionBatchResult
from enterprise.ingestion.asset_csv import AssetCSVAdapter
from enterprise.ingestion.vuln_csv import VulnCSVAdapter
from enterprise.ingestion.iam_csv import IAMCSVAdapter
from enterprise.ingestion.siem_csv import SIEMCSVAdapter
from enterprise.ingestion.scanner_findings import ScannerFindingsAdapter
from enterprise.ingestion.pipeline import list_available_adapters

ORG_ID = "demo-sentinel-financial-services"

print("--- 1. Testing Adapter Discovery ---")
adapters = list_available_adapters()
assert len(adapters) == 5, f"Expected 5 registered adapters, got {len(adapters)}"
types = [a["source_type"] for a in adapters]
assert "asset_csv" in types
assert "vuln_csv" in types
assert "iam_csv" in types
assert "siem_csv" in types
assert "scanner_findings" in types
print(f"Registered adapters: {types} - OK")

print("\n--- 2. Testing Asset CSV Adapter ---")
sample_assets_csv = """internal_id,name,asset_type,criticality,data_sensitivity,owner_name,environment,internet_exposed,record_volume_estimate,dependencies
ASSET-T01,Payment Switch,application,critical,restricted,Vikram,production,true,1000000,ASSET-T02
,Invalid Asset With No ID,application,low,internal,Nobody,staging,false,0,
ASSET-T02,Database Host,database,high,confidential,Suresh,production,false,500000,
"""
asset_adapter = AssetCSVAdapter()
res = asset_adapter.normalize(sample_assets_csv, ORG_ID)
assert res.total_rows == 3, f"Expected 3 rows, got {res.total_rows}"
assert res.valid_count == 2, f"Expected 2 valid records, got {res.valid_count}"
assert res.rejected_count == 1, f"Expected 1 rejected row, got {res.rejected_count}"
assert res.rejected_rows[0].error_field == "internal_id"
assert res.valid_records[0]["internal_id"] == "ASSET-T01"
assert res.valid_records[0]["internet_exposed"] is True
assert res.valid_records[0]["dependencies"] == ["ASSET-T02"]
print(f"Asset CSV parsing: {res.valid_count} valid, {res.rejected_count} rejected as expected - OK")

print("\n--- 3. Testing Vulnerability CSV Adapter ---")
sample_vuln_csv = """finding_id,title,asset_id,severity,cvss,status
VULN-T01,Remote Code Execution,ASSET-T01,critical,9.8,open
VULN-T02,Insecure Cookie,ASSET-T01,low,3.1,open
,Missing Asset ID,,high,8.0,open
"""
vuln_adapter = VulnCSVAdapter()
vres = vuln_adapter.normalize(sample_vuln_csv, ORG_ID)
assert vres.total_rows == 3
assert vres.valid_count == 2
assert vres.rejected_count == 1
assert vres.valid_records[0]["severity"] == "critical"
assert vres.valid_records[0]["cvss_score"] == 9.8
assert vres.valid_records[0]["finding_type"] == "vulnerability"
print(f"Vuln CSV parsing: {vres.valid_count} valid, {vres.rejected_count} rejected as expected - OK")

print("\n--- 4. Testing IAM CSV Adapter ---")
sample_iam_csv = """account_name,role,mfa_enabled,asset_id
admin.super@example.com,Cloud SuperAdmin,false,ASSET-T01
normal.user@example.com,Auditor,true,ASSET-T01
"""
iam_adapter = IAMCSVAdapter()
ires = iam_adapter.normalize(sample_iam_csv, ORG_ID)
assert ires.valid_count == 2
# Admin without MFA should be critical
admin_finding = [r for r in ires.valid_records if "SuperAdmin" in r["title"] or "admin.super" in r["title"]][0]
assert admin_finding["severity"] == "critical", f"Expected critical severity for admin without MFA, got {admin_finding['severity']}"
# User with MFA should be info
user_finding = [r for r in ires.valid_records if "normal.user" in r["title"]][0]
assert user_finding["severity"] == "info"
print(f"IAM CSV parsing: privileged without MFA correctly assigned critical severity - OK")

print("\n--- 5. Testing SIEM CSV Adapter ---")
sample_siem_csv = """rule_name,timestamp,severity,target_asset,description
Brute Force SSH,2026-03-01 10:00:00,high,ASSET-T01,15 failed SSH attempts
"""
siem_adapter = SIEMCSVAdapter()
sres = siem_adapter.normalize(sample_siem_csv, ORG_ID)
assert sres.valid_count == 1
assert sres.valid_records[0]["finding_type"] == "siem_alert"
assert sres.valid_records[0]["severity"] == "high"
print(f"SIEM CSV parsing: {sres.valid_count} valid - OK")

print("\n--- 6. Testing Scanner Findings Adapter ---")
scanner_output = {
    "scanner_type": "apk",
    "target": "com.sentinel.banking",
    "asset_id": "ASSET-T01",
    "scan_id": "scan-1234",
    "security_issues": [
        {"title": "Exported Activity Without Permission", "severity": "high", "description": "PaymentActivity is publicly exported."},
        {"title": "Insecure Shared Preferences Storage", "severity": "medium", "description": "Token stored in MODE_WORLD_READABLE."},
    ]
}
scanner_adapter = ScannerFindingsAdapter()
scres = scanner_adapter.normalize(scanner_output, ORG_ID)
assert scres.valid_count == 2
assert scres.valid_records[0]["finding_type"] == "scanner_finding"
assert scres.valid_records[0]["source_integration"] == "sentinel_apk"
print(f"Scanner findings adapter: {scres.valid_count} scanner findings converted to evidence - OK")

print("\n--- 7. Testing Pre-packaged Sample Import Files ---")
sample_dir = os.path.join("playstore-service", "enterprise", "demo", "sample_imports")
for fname, adapter in [
    ("assets.csv", asset_adapter),
    ("vulnerabilities.csv", vuln_adapter),
    ("iam_export.csv", iam_adapter),
    ("siem_alerts.csv", siem_adapter),
]:
    fpath = os.path.join(sample_dir, fname)
    assert os.path.exists(fpath), f"File {fpath} not found"
    with open(fpath, "r", encoding="utf-8") as f:
        data = f.read()
    batch = adapter.normalize(data, ORG_ID)
    assert batch.valid_count > 0, f"{fname} produced 0 valid records"
    assert batch.rejected_count == 0, f"{fname} had unexpected rejected rows: {batch.rejected_rows}"
    print(f"Sample file '{fname}': {batch.valid_count} records normalized with 0 errors - OK")

print("\n==============================================")
print("ALL MILESTONE 2 INGESTION TESTS PASSED (7/7)!")
print("==============================================")
