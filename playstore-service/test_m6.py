"""
SentinelAI Enterprise - Milestone 6 Verification Test
Validates:
1. Regulatory & Standards Framework Registry (ISO 27001, NIST CSF, CIS Controls, RBI CSF, SEBI CSCRF)
2. Framework Gap Analysis & Remediation Extraction
3. Executive Report Data Assembler
4. Structured Audit Package JSON Serialization
5. Executive PDF Generation (ReportLab byte validity & header check)
6. End-to-End Governance & Reporting HTTP Endpoints via TestClient
"""

import sys
import os
import json

sys.path.insert(0, "playstore-service")
os.environ["JWT_SECRET_KEY"] = "test_secret_key_32_chars_exactly_here"
os.environ["MONGODB_URI"] = "mongodb://localhost:27017"

from enterprise.frameworks.registry import (
    FRAMEWORKS_METADATA,
    load_framework_mapping,
    get_all_frameworks_summary,
)
from enterprise.reporting.assembler import assemble_report_data
from enterprise.reporting.structured_export import generate_structured_json_export
from enterprise.reporting.pdf_generator import generate_executive_pdf_report
from enterprise.demo.fixtures import DEMO_ORG_ID
from enterprise.auth.service import issue_access_token
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
token = issue_access_token(user_id="test_user_id", org_id=DEMO_ORG_ID, role="executive")
auth_headers = {"Authorization": f"Bearer {token}"}

print("--- 1. Testing Regulatory & Standards Frameworks Registry ---")
assert len(FRAMEWORKS_METADATA) == 5, f"Expected 5 frameworks, got {len(FRAMEWORKS_METADATA)}"
expected_frameworks = ["iso27001_2022", "nist_csf_2_0", "cis_controls_v8", "rbi_csf_2023", "sebi_cscrf_2024"]

for fid in expected_frameworks:
    mapping = load_framework_mapping(fid)
    assert mapping is not None, f"Failed to load framework mapping: {fid}"
    assert "controls" in mapping, f"Framework {fid} missing 'controls' list"
    assert len(mapping["controls"]) > 0, f"Framework {fid} has empty controls"
    print(f"  - [{fid}] {mapping.get('name')}: {len(mapping['controls'])} controls mapped")

summaries = get_all_frameworks_summary()
assert len(summaries) == 5
for s in summaries:
    assert s["total_controls"] > 0
    assert 0 <= s["coverage_percentage"] <= 100
    print(f"  -> Coverage {s['id']}: {s['coverage_percentage']}% ({s['implemented_controls']}/{s['total_controls']})")
print("Framework registry & metadata: PASSED - OK")

print("\n--- 2. Testing Framework Gap Analysis ---")
rbi_mapping = load_framework_mapping("rbi_csf_2023")
rbi_gaps = [c for c in rbi_mapping["controls"] if c.get("status") in ("gap", "partial")]
assert len(rbi_gaps) > 0, "Expected gaps in RBI CSF mapping"
print(f"RBI CSF gaps identified: {len(rbi_gaps)} controls")
for g in rbi_gaps[:2]:
    print(f"  * Gap {g['control_id']} ({g.get('name')}): Recommended action -> {g.get('remediation_action')}")
print("Framework gap analysis: PASSED - OK")

print("\n--- 3. Testing Executive Report Assembler ---")
report_data = assemble_report_data(DEMO_ORG_ID)
assert "executive_summary" in report_data
assert "top_risk_scenarios" in report_data
assert "framework_compliance" in report_data
assert "recommended_investments" in report_data

exec_sum = report_data["executive_summary"]
print(f"Assembled EAL: INR {exec_sum['expected_annual_loss_inr']:,.2f}")
print(f"Assembled 95% VaR: INR {exec_sum['var_95_inr']:,.2f}")
print(f"Risk Appetite: {exec_sum['risk_appetite_status']}")
print("Executive report data assembler: PASSED - OK")

print("\n--- 4. Testing Structured JSON Audit Package Export ---")
json_str = generate_structured_json_export(DEMO_ORG_ID)
assert isinstance(json_str, str)
parsed_json = json.loads(json_str)
assert parsed_json["export_metadata"]["sih_problem_statement"].startswith("26105")
assert parsed_json["org_id"] == DEMO_ORG_ID
print(f"Structured JSON Export: {len(json_str)} characters generated and parsed cleanly - OK")

print("\n--- 5. Testing Executive PDF Report Generation ---")
pdf_bytes = generate_executive_pdf_report(DEMO_ORG_ID)
assert isinstance(pdf_bytes, bytes)
assert len(pdf_bytes) > 2000, f"PDF seems too small ({len(pdf_bytes)} bytes)"
assert pdf_bytes.startswith(b"%PDF"), "Generated file does not have valid %PDF magic header"
print(f"Executive PDF generated successfully: {len(pdf_bytes)} bytes, valid PDF header - OK")

print("\n--- 6. Testing Governance & Reporting API Endpoints ---")
# Framework list
res = client.get("/enterprise/frameworks", headers=auth_headers)
assert res.status_code == 200
data = res.json()
assert len(data["frameworks"]) == 5

# Framework detail
res = client.get("/enterprise/frameworks/rbi_csf_2023", headers=auth_headers)
assert res.status_code == 200
assert res.json()["id"] == "rbi_csf_2023"

# Framework gap report
res = client.get("/enterprise/frameworks/rbi_csf_2023/gap-report", headers=auth_headers)
assert res.status_code == 200
assert res.json()["total_gaps"] > 0

# Report data
res = client.get("/enterprise/reports/data", headers=auth_headers)
assert res.status_code == 200
assert "executive_summary" in res.json()

# Report JSON download
res = client.get("/enterprise/reports/export/json", headers=auth_headers)
assert res.status_code == 200
assert "application/json" in res.headers["content-type"]
assert "SentinelAI" in res.text

# Report PDF download
res = client.get("/enterprise/reports/export/pdf", headers=auth_headers)
assert res.status_code == 200
assert res.headers["content-type"] == "application/pdf"
assert res.content.startswith(b"%PDF")
print("All Governance & Reporting API endpoints: PASSED - OK")

print("\n=======================================================")
print("ALL MILESTONE 6 GOVERNANCE & REPORTING TESTS (6/6) PASSED!")
print("=======================================================")
