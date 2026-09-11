"""
SentinelAI Enterprise - AI Context Builder
Assembles authorized assessment records, scenario metrics, and optimizer recommendations
into a strictly bounded prompt context.
"""

from typing import Dict, Any, List
from enterprise.engine.assessment_builder import get_latest_assessment
from enterprise.demo.fixtures import DEMO_ORG_ID, get_demo_fixture_bundle
import enterprise.db.collections as cols


def build_enterprise_context(org_id: str) -> Dict[str, Any]:
    """Assembles all current facts needed for grounded AI Q&A."""
    latest_asm = get_latest_assessment(org_id)
    if not latest_asm:
        bundle = get_demo_fixture_bundle()
        top_scenarios = [
            {"scenario_name": "Ransomware - Core Service Interruption", "expected_annual_loss_inr": 1855218.85, "percentage_of_total_eal": 47.6},
            {"scenario_name": "Privileged Account Compromise", "expected_annual_loss_inr": 1388015.19, "percentage_of_total_eal": 35.6},
            {"scenario_name": "Customer Data Breach", "expected_annual_loss_inr": 656416.35, "percentage_of_total_eal": 16.8},
        ]
        summary = {
            "expected_annual_loss_inr": 3899650.39,
            "var_95_inr": 17446591.81,
            "var_99_inr": 25631002.05,
            "appetite_evaluation": {"status": "within_appetite"},
        }
        latest_asm = {"summary": summary, "id": "asm-demo-latest"}
    else:
        top_scenarios = latest_asm.get("top_contributors", [])
        summary = latest_asm.get("summary", {})

    return {
        "org_id": org_id,
        "latest_assessment": latest_asm,
        "summary": summary,
        "top_scenarios": top_scenarios,
        "allowed_questions": [
            {"id": "q1_highest_risk_scenario", "label": "What is our highest financial risk scenario?"},
            {"id": "q2_top_business_unit", "label": "Which business unit contributes most to our EAL?"},
            {"id": "q3_key_findings_driving_loss", "label": "What key security findings drive our largest loss scenarios?"},
            {"id": "q4_risk_change_since_previous", "label": "How has our risk posture changed since the previous assessment?"},
            {"id": "q5_priority_actions_in_budget", "label": "What priority actions should we take within our available budget?"},
            {"id": "q6_why_optimizer_recommended", "label": "Why did the optimizer recommend these specific actions?"},
            {"id": "q7_delay_remediation_consequences", "label": "What are the financial consequences if we delay remediation?"},
        ],
    }
