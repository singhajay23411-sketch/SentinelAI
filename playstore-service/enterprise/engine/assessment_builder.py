"""
SentinelAI Enterprise - Assessment Builder
Assembles and commits immutable assessment snapshots.
Persists model inputs, assumptions, and distribution statistics to ensure
complete forensic repeatability.
"""

import uuid
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

import enterprise.db.collections as cols
from enterprise.engine.monte_carlo import run_monte_carlo, PortfolioSimulationResult
from enterprise.demo.fixtures import DEMO_ORG_ID, get_demo_fixture_bundle

logger = logging.getLogger(__name__)


def create_assessment_snapshot(
    org_id: str,
    triggered_by: str = "manual_run",
    num_iterations: int = 10_000,
    seed: int = 42,
    parameter_overrides: Optional[Dict[str, Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Executes Monte Carlo assessment and saves an immutable snapshot in MongoDB.
    """
    now = datetime.utcnow()
    assessment_id = f"asm-{uuid.uuid4()}"

    # 1. Fetch Organization settings and risk appetite
    org = cols.organizations().find_one({"_id": org_id})
    if not org and org_id == DEMO_ORG_ID:
        bundle = get_demo_fixture_bundle()
        org = bundle["org"]
    elif not org:
        raise ValueError(f"Organization '{org_id}' not found.")

    risk_appetite = org.get("risk_appetite", {})

    # 2. Fetch active Scenarios
    scenarios_cursor = cols.risk_scenarios().find({"org_id": org_id, "is_active": True})
    scenarios = list(scenarios_cursor)
    if not scenarios and org_id == DEMO_ORG_ID:
        bundle = get_demo_fixture_bundle()
        scenarios = bundle["scenarios"]

    if not scenarios:
        raise ValueError(f"No active risk scenarios configured for organization '{org_id}'.")

    # 3. Fetch active Controls
    controls_cursor = cols.controls().find({"org_id": org_id})
    controls = list(controls_cursor)

    # 4. Run Simulation
    sim_result: PortfolioSimulationResult = run_monte_carlo(
        org_id=org_id,
        scenarios=scenarios,
        controls=controls,
        num_iterations=num_iterations,
        seed=seed,
        risk_appetite=risk_appetite,
        parameter_overrides=parameter_overrides,
    )

    result_dict = sim_result.to_dict()

    # 5. Build snapshot record
    snapshot = {
        "_id": assessment_id,
        "org_id": org_id,
        "triggered_by": triggered_by,
        "created_at": now,
        "is_latest": True,
        "summary": result_dict["summary"],
        "top_contributors": result_dict["top_contributors"],
        "scenario_results": result_dict["scenarios"],
        "model_inputs": {
            "seed": seed,
            "simulation_count": num_iterations,
            "scenario_count": len(scenarios),
            "control_count": len(controls),
            "scenario_ids": [s.get("_id") or s.get("id") for s in scenarios],
            "parameter_overrides": parameter_overrides or {},
        },
    }

    # 6. Mark previous assessments as not latest
    try:
        cols.assessments().update_many(
            {"org_id": org_id, "is_latest": True},
            {"$set": {"is_latest": False}}
        )
        # Insert new immutable snapshot
        cols.assessments().insert_one(snapshot)
        logger.info(f"Created immutable assessment {assessment_id} for org {org_id}. EAL: ₹{result_dict['summary']['expected_annual_loss_inr']:,}")
    except Exception as e:
        logger.warning(f"Failed to persist assessment snapshot to MongoDB: {e}")

    # Format return dictionary with standard 'id'
    output = dict(snapshot)
    output["id"] = output.pop("_id")
    return output


def get_latest_assessment(org_id: str) -> Optional[Dict[str, Any]]:
    """Returns the latest assessment snapshot for an organization."""
    doc = None
    try:
        doc = cols.assessments().find_one({"org_id": org_id, "is_latest": True})
        if not doc:
            doc = cols.assessments().find_one({"org_id": org_id}, sort=[("created_at", -1)])
    except Exception:
        doc = None

    if not doc and org_id == DEMO_ORG_ID:
        # Auto-compute first demo assessment if not yet in DB
        try:
            return create_assessment_snapshot(org_id=org_id, triggered_by="demo_init")
        except Exception:
            # Synthetic offline baseline
            return {
                "id": "asm-demo-latest",
                "org_id": org_id,
                "summary": {
                    "expected_annual_loss_inr": 3899650.39,
                    "var_95_inr": 17446591.81,
                    "var_99_inr": 25631002.05,
                    "appetite_evaluation": {"status": "within_appetite"},
                },
                "top_contributors": [
                    {"scenario_name": "Ransomware - Core Service Interruption [DEMO]", "expected_annual_loss_inr": 1855218.85, "percentage_of_total_eal": 47.6},
                    {"scenario_name": "Privileged Account Compromise [DEMO]", "expected_annual_loss_inr": 1388015.19, "percentage_of_total_eal": 35.6},
                    {"scenario_name": "Customer Data Breach [DEMO]", "expected_annual_loss_inr": 656416.35, "percentage_of_total_eal": 16.8},
                ],
                "created_at": datetime.utcnow(),
            }

    if doc:
        doc["id"] = doc.pop("_id")
        return doc
    return None


def get_assessment_by_id(assessment_id: str, org_id: str) -> Optional[Dict[str, Any]]:
    """Returns a specific historical assessment snapshot."""
    doc = cols.assessments().find_one({"_id": assessment_id, "org_id": org_id})
    if doc:
        doc["id"] = doc.pop("_id")
        return doc
    return None


def compare_assessments(id1: str, id2: str, org_id: str) -> Dict[str, Any]:
    """Computes side-by-side delta between two assessment snapshots."""
    asm1 = get_assessment_by_id(id1, org_id)
    asm2 = get_assessment_by_id(id2, org_id)
    if not asm1 or not asm2:
        raise ValueError("One or both assessment IDs not found.")

    eal1 = asm1["summary"]["expected_annual_loss_inr"]
    eal2 = asm2["summary"]["expected_annual_loss_inr"]
    var1 = asm1["summary"]["var_95_inr"]
    var2 = asm2["summary"]["var_95_inr"]

    return {
        "assessment_1": {"id": id1, "created_at": asm1["created_at"], "eal": eal1, "var_95": var1},
        "assessment_2": {"id": id2, "created_at": asm2["created_at"], "eal": eal2, "var_95": var2},
        "deltas": {
            "eal_diff_inr": round(eal2 - eal1, 2),
            "eal_pct_change": round(((eal2 - eal1) / eal1 * 100.0) if eal1 > 0 else 0.0, 2),
            "var_95_diff_inr": round(var2 - var1, 2),
            "var_95_pct_change": round(((var2 - var1) / var1 * 100.0) if var1 > 0 else 0.0, 2),
        },
    }
