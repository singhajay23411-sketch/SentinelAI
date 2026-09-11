"""
SentinelAI Enterprise - What-If Simulation Engine
Evaluates counterfactual interventions against the baseline risk posture.
Uses Common Random Numbers (CRN) for maximum precision and causal attribution.
"""

import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

import enterprise.db.collections as cols
from enterprise.engine.monte_carlo import run_monte_carlo, PortfolioSimulationResult
from enterprise.simulation.common_random_numbers import SynchronizedRNG
from enterprise.simulation.models import InterventionType, Intervention, ScenarioDelta, SimulationRunOut
from enterprise.demo.fixtures import DEMO_ORG_ID, get_demo_fixture_bundle

logger = logging.getLogger(__name__)


def apply_interventions_to_scenarios(
    scenarios: List[Dict[str, Any]],
    interventions: List[Intervention],
) -> Dict[str, Dict[str, Any]]:
    """
    Translates intervention specifications into scenario-specific parameter overrides.
    Returns mapping: scenario_id -> { 'modifiers': {...}, 'expected_incidents_per_year': ... }
    """
    overrides: Dict[str, Dict[str, Any]] = {}

    for scn in scenarios:
        scn_id = scn.get("_id") or scn.get("id")
        overrides[scn_id] = {
            "modifiers": {"frequency_multiplier": 1.0, "severity_multiplier": 1.0, "downtime_multiplier": 1.0},
        }

    for inv in interventions:
        target_ids = inv.target_scenario_ids or list(overrides.keys())

        for sid in target_ids:
            if sid not in overrides:
                continue

            mods = overrides[sid]["modifiers"]

            if inv.intervention_type == InterventionType.enable_mfa:
                # Target identity compromise scenarios
                if "account" in sid.lower() or "privilege" in sid.lower() or "002" in sid or not inv.target_scenario_ids:
                    mods["frequency_multiplier"] = min(mods["frequency_multiplier"], 0.25)
                    mods["severity_multiplier"] = min(mods["severity_multiplier"], 0.85)

            elif inv.intervention_type == InterventionType.patch_vulnerabilities:
                # Reduces web vulnerability and software exploit ingress
                mods["frequency_multiplier"] = min(mods["frequency_multiplier"], 0.40)

            elif inv.intervention_type == InterventionType.network_segmentation:
                # Blast radius containment
                mods["severity_multiplier"] = min(mods["severity_multiplier"], 0.50)

            elif inv.intervention_type == InterventionType.immutable_backups:
                # Drastically cuts downtime duration
                mods["downtime_multiplier"] = min(mods["downtime_multiplier"], 0.40)
                mods["severity_multiplier"] = min(mods["severity_multiplier"], 0.70)

            elif inv.intervention_type == InterventionType.enhance_monitoring:
                mods["frequency_multiplier"] = min(mods["frequency_multiplier"], 0.60)
                mods["severity_multiplier"] = min(mods["severity_multiplier"], 0.55)
                mods["downtime_multiplier"] = min(mods["downtime_multiplier"], 0.60)

            elif inv.intervention_type == InterventionType.delay_remediation:
                # Explicitly models delay exposure:
                # If delayed D days, additional exposure during the delay window
                delay_days = inv.delay_days or 30
                delay_fraction = min(1.0, delay_days / 365.0)
                # Elevated frequency factor during the unpatched window
                extra_exposure_factor = 1.0 + (0.50 * delay_fraction)
                mods["frequency_multiplier"] *= extra_exposure_factor

            elif inv.intervention_type == InterventionType.custom_override:
                if inv.frequency_multiplier_override is not None:
                    mods["frequency_multiplier"] = inv.frequency_multiplier_override
                if inv.severity_multiplier_override is not None:
                    mods["severity_multiplier"] = inv.severity_multiplier_override
                if inv.downtime_multiplier_override is not None:
                    mods["downtime_multiplier"] = inv.downtime_multiplier_override

    return overrides


def run_what_if_simulation(
    org_id: str,
    name: str,
    description: str,
    interventions: List[Intervention],
    seed: int = 42,
    num_iterations: int = 10_000,
) -> Dict[str, Any]:
    """
    Executes a side-by-side What-If simulation using Common Random Numbers (CRN).
    Baseline and Counterfactual share identical stochastic draws.
    """
    sim_id = f"sim-{uuid.uuid4()}"
    now = datetime.utcnow()

    # 1. Fetch Organization scenarios
    scenarios = []
    try:
        scenarios_cursor = cols.risk_scenarios().find({"org_id": org_id, "is_active": True})
        scenarios = list(scenarios_cursor)
    except Exception:
        pass

    if not scenarios and org_id == DEMO_ORG_ID:
        bundle = get_demo_fixture_bundle()
        scenarios = bundle["scenarios"]

    if not scenarios:
        raise ValueError(f"No risk scenarios found for org '{org_id}'.")

    # 2. Fetch baseline controls
    controls = []
    try:
        controls = list(cols.controls().find({"org_id": org_id}))
    except Exception:
        pass

    # 3. Synchronized random streams for baseline and counterfactual
    crn = SynchronizedRNG(seed=seed)
    rng_baseline, rng_counterfactual = crn.get_generators()

    # 4. Run Baseline
    baseline_res = run_monte_carlo(
        org_id=org_id,
        scenarios=scenarios,
        controls=controls,
        num_iterations=num_iterations,
        seed=seed,
    )

    # 5. Build counterfactual overrides
    counterfactual_overrides = apply_interventions_to_scenarios(scenarios, interventions)

    # 6. Run Counterfactual with synchronized random seed
    counterfactual_res = run_monte_carlo(
        org_id=org_id,
        scenarios=scenarios,
        controls=controls,
        num_iterations=num_iterations,
        seed=seed,
        parameter_overrides=counterfactual_overrides,
    )

    b_summary = baseline_res.var_metrics
    c_summary = counterfactual_res.var_metrics

    b_eal = b_summary["mean_eal"]
    c_eal = c_summary["mean_eal"]
    eal_diff = b_eal - c_eal
    eal_diff_pct = (eal_diff / b_eal * 100.0) if b_eal > 0 else 0.0

    b_var = b_summary["var_95"]
    c_var = c_summary["var_95"]
    var_diff = b_var - c_var

    # Per-scenario deltas
    scenario_deltas: List[ScenarioDelta] = []
    for b_scn, c_scn in zip(baseline_res.scenario_results, counterfactual_res.scenario_results):
        s_b_eal = b_scn.mean_eal
        s_c_eal = c_scn.mean_eal
        s_diff = s_b_eal - s_c_eal
        s_pct = (s_diff / s_b_eal * 100.0) if s_b_eal > 0 else 0.0

        scenario_deltas.append(
            ScenarioDelta(
                scenario_id=b_scn.scenario_id,
                scenario_name=b_scn.scenario_name,
                baseline_eal=round(s_b_eal, 2),
                counterfactual_eal=round(s_c_eal, 2),
                eal_reduction=round(s_diff, 2),
                eal_reduction_pct=round(s_pct, 2),
                baseline_var95=round(b_scn.var_95, 2),
                counterfactual_var95=round(c_scn.var_95, 2),
            )
        )

    result_doc = {
        "_id": sim_id,
        "org_id": org_id,
        "name": name,
        "description": description,
        "seed": seed,
        "baseline_eal": round(b_eal, 2),
        "counterfactual_eal": round(c_eal, 2),
        "eal_reduction": round(eal_diff, 2),
        "eal_reduction_pct": round(eal_diff_pct, 2),
        "baseline_var95": round(b_var, 2),
        "counterfactual_var95": round(c_var, 2),
        "var95_reduction": round(var_diff, 2),
        "scenario_deltas": [d.dict() for d in scenario_deltas],
        "interventions_applied": [i.dict() for i in interventions],
        "created_at": now,
    }

    try:
        cols.simulations().insert_one(result_doc)
    except Exception as e:
        logger.warning(f"Could not persist simulation record to MongoDB: {e}")

    output = dict(result_doc)
    output["id"] = output.pop("_id")
    return output


def list_simulations(org_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    cursor = cols.simulations().find({"org_id": org_id}).sort("created_at", -1).limit(limit)
    sims = []
    for doc in cursor:
        doc["id"] = doc.pop("_id")
        sims.append(doc)
    return sims


def get_simulation_by_id(sim_id: str, org_id: str) -> Optional[Dict[str, Any]]:
    doc = cols.simulations().find_one({"_id": sim_id, "org_id": org_id})
    if doc:
        doc["id"] = doc.pop("_id")
        return doc
    return None
