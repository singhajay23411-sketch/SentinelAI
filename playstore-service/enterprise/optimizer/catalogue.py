"""
SentinelAI Enterprise - Mitigation Actions Catalogue
Benchmark catalog of security investments with verified costs, implementation timelines,
target scenarios, prerequisite graphs, and parametric risk reduction effects.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class MitigationAction(BaseModel):
    id: str
    name: str
    category: str
    description: str
    cost_onetime_inr: float = Field(..., ge=0)
    cost_annual_inr: float = Field(..., ge=0)
    duration_days: int = Field(..., ge=1)
    affected_scenario_ids: List[str] = Field(default_factory=list)
    frequency_multiplier: float = Field(1.0, ge=0.01, le=1.0)
    severity_multiplier: float = Field(1.0, ge=0.01, le=1.0)
    downtime_multiplier: float = Field(1.0, ge=0.01, le=1.0)
    prerequisites: List[str] = Field(default_factory=list)
    mutual_exclusions: List[str] = Field(default_factory=list)
    framework_refs: List[Dict[str, str]] = Field(default_factory=list)


DEMO_MITIGATION_CATALOGUE: List[Dict[str, Any]] = [
    {
        "id": "MFA-01",
        "name": "Hardware/FIDO2 MFA for Privileged Accounts",
        "category": "Identity & Access",
        "description": "Mandate hardware security keys (FIDO2/WebAuthn) for all cloud, database, and infrastructure administrators.",
        "cost_onetime_inr": 450_000.0,
        "cost_annual_inr": 120_000.0,
        "duration_days": 21,
        "affected_scenario_ids": ["demo-sentinel-financial-services-SCN-002"],
        "frequency_multiplier": 0.25,
        "severity_multiplier": 0.85,
        "downtime_multiplier": 1.0,
        "prerequisites": [],
        "mutual_exclusions": [],
        "framework_refs": [{"framework": "ISO27001:2022", "ref": "A.9.4.2"}, {"framework": "RBI_CSF", "ref": "Annex-1.4"}],
    },
    {
        "id": "BCK-01",
        "name": "Air-Gapped Immutable Backups & Automated DR",
        "category": "Resilience & Recovery",
        "description": "Deploy write-once-read-many (WORM) immutable S3 object lock backups with scripted failover testing.",
        "cost_onetime_inr": 800_000.0,
        "cost_annual_inr": 350_000.0,
        "duration_days": 45,
        "affected_scenario_ids": ["demo-sentinel-financial-services-SCN-001"],
        "frequency_multiplier": 1.0,
        "severity_multiplier": 0.70,
        "downtime_multiplier": 0.40,
        "prerequisites": [],
        "mutual_exclusions": [],
        "framework_refs": [{"framework": "NIST_CSF", "ref": "PR.IP-4"}, {"framework": "RBI_CSF", "ref": "Annex-3.1"}],
    },
    {
        "id": "SEG-01",
        "name": "Core Banking Micro-segmentation Tiering",
        "category": "Network Security",
        "description": "Enforce zero-trust ingress/egress firewalls and TLS mTLS between Web, Application, and Database tiers.",
        "cost_onetime_inr": 1_200_000.0,
        "cost_annual_inr": 200_000.0,
        "duration_days": 60,
        "affected_scenario_ids": ["demo-sentinel-financial-services-SCN-001", "demo-sentinel-financial-services-SCN-003"],
        "frequency_multiplier": 0.70,
        "severity_multiplier": 0.50,
        "downtime_multiplier": 0.80,
        "prerequisites": [],
        "mutual_exclusions": [],
        "framework_refs": [{"framework": "CIS_v8", "ref": "Control 12"}, {"framework": "ISO27001:2022", "ref": "A.8.20"}],
    },
    {
        "id": "WAF-01",
        "name": "Cloud WAF & API Threat Defense Shield",
        "category": "Application Security",
        "description": "Deploy managed Web Application Firewall with automated bot mitigation and OpenAPI schema validation.",
        "cost_onetime_inr": 350_000.0,
        "cost_annual_inr": 400_000.0,
        "duration_days": 14,
        "affected_scenario_ids": ["demo-sentinel-financial-services-SCN-003"],
        "frequency_multiplier": 0.45,
        "severity_multiplier": 0.90,
        "downtime_multiplier": 0.85,
        "prerequisites": [],
        "mutual_exclusions": [],
        "framework_refs": [{"framework": "OWASP_Top_10", "ref": "A01:2021"}, {"framework": "SEBI_CSCRF", "ref": "Section 5"}],
    },
    {
        "id": "SOC-01",
        "name": "24/7 Managed EDR & Rapid Incident Containment",
        "category": "Threat Detection",
        "description": "24/7 security monitoring with automated endpoint isolation to reduce attacker dwell time.",
        "cost_onetime_inr": 200_000.0,
        "cost_annual_inr": 900_000.0,
        "duration_days": 20,
        "affected_scenario_ids": [
            "demo-sentinel-financial-services-SCN-001",
            "demo-sentinel-financial-services-SCN-002",
            "demo-sentinel-financial-services-SCN-003",
        ],
        "frequency_multiplier": 0.60,
        "severity_multiplier": 0.55,
        "downtime_multiplier": 0.60,
        "prerequisites": [],
        "mutual_exclusions": [],
        "framework_refs": [{"framework": "NIST_CSF", "ref": "DE.CM-1"}, {"framework": "RBI_CSF", "ref": "Annex-2.1"}],
    },
    {
        "id": "PTC-01",
        "name": "Automated Vulnerability Remediation Pipeline",
        "category": "Vulnerability Management",
        "description": "Automated patch orchestration with guaranteed 14-day SLA for Critical/High vulnerabilities.",
        "cost_onetime_inr": 300_000.0,
        "cost_annual_inr": 180_000.0,
        "duration_days": 14,
        "affected_scenario_ids": ["demo-sentinel-financial-services-SCN-001", "demo-sentinel-financial-services-SCN-003"],
        "frequency_multiplier": 0.40,
        "severity_multiplier": 1.0,
        "downtime_multiplier": 1.0,
        "prerequisites": [],
        "mutual_exclusions": [],
        "framework_refs": [{"framework": "CIS_v8", "ref": "Control 7"}, {"framework": "ISO27001:2022", "ref": "A.8.8"}],
    },
    {
        "id": "DLP-01",
        "name": "Cloud & Endpoint Data Loss Prevention",
        "category": "Data Protection",
        "description": "Inspect and block unauthorized exfiltration of customer PII and financial records from endpoints and cloud storage.",
        "cost_onetime_inr": 600_000.0,
        "cost_annual_inr": 250_000.0,
        "duration_days": 35,
        "affected_scenario_ids": ["demo-sentinel-financial-services-SCN-003"],
        "frequency_multiplier": 0.80,
        "severity_multiplier": 0.40,
        "downtime_multiplier": 1.0,
        "prerequisites": [],
        "mutual_exclusions": [],
        "framework_refs": [{"framework": "ISO27001:2022", "ref": "A.8.12"}, {"framework": "DPDP_Act_2023", "ref": "Section 8"}],
    },
]


def get_mitigation_catalogue() -> List[Dict[str, Any]]:
    """Returns all available mitigation actions."""
    return DEMO_MITIGATION_CATALOGUE
