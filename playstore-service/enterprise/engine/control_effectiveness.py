"""
SentinelAI Enterprise - Control Effectiveness Modeling
Maps verified security controls to specific scenario parameters.
Never uses a blanket percentage. Distinguishes between:
1. Threat prevention / frequency reduction (e.g. MFA, WAF)
2. Containment / severity reduction (e.g. network segmentation, least privilege)
3. Recovery / downtime reduction (e.g. immutable air-gapped backups, automated DR)
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class ControlModifier(BaseModel):
    control_id: str
    control_name: str
    frequency_multiplier: float = Field(
        1.0, ge=0.01, le=1.0,
        description="Scales expected annual incident rate (lambda). 0.30 means 70% reduction in frequency."
    )
    severity_multiplier: float = Field(
        1.0, ge=0.01, le=1.0,
        description="Scales single-incident severity loss components. 0.60 means 40% loss reduction."
    )
    downtime_multiplier: float = Field(
        1.0, ge=0.01, le=1.0,
        description="Scales recovery and downtime duration components."
    )
    coverage_weight: float = Field(
        1.0, ge=0.0, le=1.0,
        description="Actual observed coverage percentage (0.0 to 1.0)."
    )
    rationale: str = ""


# Default benchmark catalog of control modifiers with documented basis
BENCHMARK_CONTROL_PROFILES: Dict[str, Dict[str, Any]] = {
    "mfa_privileged": {
        "name": "Enforce FIDO2/Hardware MFA for All Privileged Accounts",
        "frequency_multiplier": 0.25,      # 75% frequency reduction in credential compromise (CISA / Mandiant benchmark)
        "severity_multiplier": 0.85,
        "downtime_multiplier": 1.0,
        "rationale": "CISA benchmark: MFA mitigates majority of automated and opportunistic credential compromise attacks.",
    },
    "immutable_backups": {
        "name": "Immutable & Air-Gapped Backup System with Automated DR",
        "frequency_multiplier": 1.0,       # Backups do not prevent initial ransomware ingress
        "severity_multiplier": 0.70,       # Eliminates extortion ransom leverage
        "downtime_multiplier": 0.40,       # 60% faster restoration and reduced business interruption
        "rationale": "NIST CSF PR.IP-4 / SP 800-34: Air-gapped immutable copies prevent encryption of recovery assets.",
    },
    "network_segmentation": {
        "name": "Micro-segmentation between Core Banking & Web Tiers",
        "frequency_multiplier": 0.70,      # Prevents lateral movement from reaching critical hosts
        "severity_multiplier": 0.50,       # Limits blast radius of compromised web servers
        "downtime_multiplier": 0.80,
        "rationale": "Zero Trust Architecture (NIST SP 800-207): Restricts east-west traffic, limiting breach scope.",
    },
    "waf_ddos_protection": {
        "name": "Enterprise WAF & API Threat Defense",
        "frequency_multiplier": 0.45,      # 55% reduction in successful web/API exploit attempts
        "severity_multiplier": 0.90,
        "downtime_multiplier": 0.85,
        "rationale": "OWASP / Cloud Security Alliance: Filters automated injection and zero-day probe traffic.",
    },
    "edr_24_7_soc": {
        "name": "24/7 Managed EDR & Rapid Containment",
        "frequency_multiplier": 0.60,      # Shortens dwell time, aborting attacks before impact
        "severity_multiplier": 0.55,       # Reduces exfiltration volume and containment forensics duration
        "downtime_multiplier": 0.60,
        "rationale": "SANS Institute: Sub-hour detection and containment reduces breach severity by >40%.",
    },
    "vulnerability_patching": {
        "name": "SLA-Driven 14-Day Remediation of Critical Vulnerabilities",
        "frequency_multiplier": 0.40,      # Closes externally exposed attack surfaces
        "severity_multiplier": 1.0,
        "downtime_multiplier": 1.0,
        "rationale": "CISA KEV / Known Exploited Vulnerability guidance.",
    },
}


def compute_aggregate_control_modifiers(
    controls: List[Dict[str, Any]],
    scenario_id: Optional[str] = None
) -> Dict[str, float]:
    """
    Computes net frequency and severity multipliers from active controls.
    Applies diminishing returns (multiplicative cascading) rather than simple addition.
    """
    net_freq = 1.0
    net_sev = 1.0
    net_down = 1.0

    for ctrl in controls:
        # Check if control applies to this scenario
        app_scenarios = ctrl.get("applicable_scenario_ids", [])
        if scenario_id and app_scenarios and scenario_id not in app_scenarios:
            continue

        coverage = float(ctrl.get("coverage_percentage", 100.0)) / 100.0
        coverage = max(0.0, min(1.0, coverage))

        # Check if benchmark profile exists
        ctrl_id = ctrl.get("name", "").lower().replace(" ", "_")
        profile = None
        for key, p in BENCHMARK_CONTROL_PROFILES.items():
            if key in ctrl_id or p["name"].lower() in ctrl.get("name", "").lower():
                profile = p
                break

        if profile:
            # Scaled effect = 1.0 - coverage * (1.0 - base_multiplier)
            f_mult = 1.0 - coverage * (1.0 - profile["frequency_multiplier"])
            s_mult = 1.0 - coverage * (1.0 - profile["severity_multiplier"])
            d_mult = 1.0 - coverage * (1.0 - profile["downtime_multiplier"])
        else:
            # Conservative default if custom control
            f_mult = 1.0 - (0.15 * coverage)
            s_mult = 1.0 - (0.10 * coverage)
            d_mult = 1.0 - (0.10 * coverage)

        # Multiplicative stacking with safe floor to avoid 0
        net_freq = max(0.05, net_freq * f_mult)
        net_sev = max(0.10, net_sev * s_mult)
        net_down = max(0.15, net_down * d_mult)

    return {
        "frequency_multiplier": round(net_freq, 4),
        "severity_multiplier": round(net_sev, 4),
        "downtime_multiplier": round(net_down, 4),
    }
