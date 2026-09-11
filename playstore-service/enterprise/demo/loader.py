"""
SentinelAI Enterprise - Demo Fixture Loader
============================================
Idempotent loader for the Sentinel Demo Financial Services fixtures.
Safe to run multiple times -- uses upsert operations so existing records are
not duplicated. Does NOT touch any non-demo organization records.
"""

import logging
from enterprise.demo.fixtures import (
    DEMO_ORG_ID, DEMO_ORG,
    DEMO_BUSINESS_UNITS, DEMO_ASSETS, DEMO_SERVICES,
    DEMO_EVIDENCE, DEMO_SCENARIOS,
)
import enterprise.db.collections as cols

logger = logging.getLogger(__name__)


def _upsert(collection, docs: list, label: str) -> dict:
    """Upsert all docs by _id. Returns count of inserted and existing."""
    inserted = 0
    existing = 0
    for doc in docs:
        result = collection.update_one(
            {"_id": doc["_id"]},
            {"$setOnInsert": doc},
            upsert=True,
        )
        if result.upserted_id is not None:
            inserted += 1
        else:
            existing += 1
    logger.info(f"{label}: {inserted} inserted, {existing} already existed.")
    return {"inserted": inserted, "existing": existing}


def load_demo_fixtures() -> dict:
    """
    Load all demo fixtures into MongoDB.
    Idempotent: safe to call multiple times.
    Only affects documents with org_id == DEMO_ORG_ID.
    """
    logger.info(f"Loading demo fixtures for org: {DEMO_ORG_ID}")
    results = {}

    # Organization
    result = cols.organizations().update_one(
        {"_id": DEMO_ORG_ID},
        {"$setOnInsert": DEMO_ORG},
        upsert=True,
    )
    results["organization"] = {
        "inserted": 1 if result.upserted_id else 0,
        "existing": 0 if result.upserted_id else 1,
    }

    # Business units
    results["business_units"] = _upsert(cols.business_units(), DEMO_BUSINESS_UNITS, "Business units")

    # Assets
    results["assets"] = _upsert(cols.assets(), DEMO_ASSETS, "Assets")

    # Services
    results["services"] = _upsert(cols.business_services(), DEMO_SERVICES, "Business services")

    # Evidence
    results["evidence"] = _upsert(cols.evidence(), DEMO_EVIDENCE, "Evidence records")

    # Scenarios
    results["scenarios"] = _upsert(cols.risk_scenarios(), DEMO_SCENARIOS, "Risk scenarios")

    total_inserted = sum(r.get("inserted", 0) for r in results.values())
    logger.info(f"Demo fixture load complete. Total new records: {total_inserted}")
    return {
        "org_id": DEMO_ORG_ID,
        "status": "loaded",
        "records": results,
        "total_inserted": total_inserted,
        "note": "Demo data is synthetic. All figures are analyst assumptions and illustrative only.",
    }


def get_demo_summary() -> dict:
    """Return a summary of what demo data exists in the DB."""
    return {
        "org_id": DEMO_ORG_ID,
        "organization_exists": cols.organizations().count_documents({"_id": DEMO_ORG_ID}) > 0,
        "asset_count": cols.assets().count_documents({"org_id": DEMO_ORG_ID}),
        "service_count": cols.business_services().count_documents({"org_id": DEMO_ORG_ID}),
        "evidence_count": cols.evidence().count_documents({"org_id": DEMO_ORG_ID}),
        "scenario_count": cols.risk_scenarios().count_documents({"org_id": DEMO_ORG_ID}),
        "assessment_count": cols.assessments().count_documents({"org_id": DEMO_ORG_ID}),
    }
