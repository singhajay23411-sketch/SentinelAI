"""
SentinelAI Enterprise - Structured Data Export
Generates audit-grade JSON packages formatted for regulatory compliance
and forensic archiving.
"""

import json
from typing import Dict, Any
from enterprise.reporting.assembler import assemble_report_data


def generate_structured_json_export(org_id: str) -> str:
    """Produces JSON string with full assessment, governance, and audit trails."""
    data = assemble_report_data(org_id)
    export_payload = {
        "export_metadata": {
            "platform": "SentinelAI Enterprise Cyber Risk Quantification Platform",
            "sih_problem_statement": "26105 - AI-Powered Continuous Cyber Risk Quantification",
            "export_version": "1.0",
            "format": "application/json",
        },
        **data,
    }
    return json.dumps(export_payload, indent=2, default=str)
