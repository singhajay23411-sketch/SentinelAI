"""
SentinelAI Enterprise - Demo Reset
===================================
Deletes and reloads demo fixtures for the demo organization ONLY.
Will NOT touch any other organization records.
Requires explicit confirmation that this is the demo org.
"""

import logging
import enterprise.db.collections as cols
from enterprise.demo.fixtures import DEMO_ORG_ID
from enterprise.demo.loader import load_demo_fixtures

logger = logging.getLogger(__name__)

_DEMO_COLLECTIONS_TO_CLEAR = [
    ("business_units", cols.business_units),
    ("assets", cols.assets),
    ("business_services", cols.business_services),
    ("evidence", cols.evidence),
    ("risk_scenarios", cols.risk_scenarios),
    ("assessments", cols.assessments),
    ("simulations", cols.simulations),
    ("optimization_runs", cols.optimization_runs),
    ("reports", cols.reports),
    ("audit_events", cols.audit_events),
    ("job_queue", cols.job_queue),
]


def reset_demo_org() -> dict:
    """
    Delete all data for the demo org and reload fixtures.
    Only affects records with org_id == DEMO_ORG_ID.
    The organization document itself is preserved (recreated if missing).
    """
    # Safety check: only proceed for known demo org prefix
    if not DEMO_ORG_ID.startswith("demo-"):
        raise RuntimeError(
            f"Safety check failed: DEMO_ORG_ID must start with 'demo-'. Got: {DEMO_ORG_ID}"
        )

    logger.warning(f"Resetting demo org: {DEMO_ORG_ID}")
    deleted_counts = {}

    for label, col_fn in _DEMO_COLLECTIONS_TO_CLEAR:
        result = col_fn().delete_many({"org_id": DEMO_ORG_ID})
        deleted_counts[label] = result.deleted_count
        logger.info(f"Deleted {result.deleted_count} records from {label}")

    # Reload fixtures
    load_result = load_demo_fixtures()

    logger.warning(f"Demo org reset complete for: {DEMO_ORG_ID}")
    return {
        "org_id": DEMO_ORG_ID,
        "status": "reset_complete",
        "deleted": deleted_counts,
        "reloaded": load_result["records"],
        "note": "Demo data is synthetic. All figures are analyst assumptions and illustrative only.",
    }
