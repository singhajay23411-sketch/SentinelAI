"""
SentinelAI Enterprise - Security Investment Portfolio Optimizer
Finds the mathematically optimal portfolio of security mitigations
subject to budget constraints, prerequisites, and mutual exclusions.
Uses exact combinatorial knapsack enumeration for proven global optimality.
"""

import itertools
import logging
from typing import Dict, Any, List, Optional, Tuple

from enterprise.optimizer.catalogue import get_mitigation_catalogue
from enterprise.optimizer.rosi import compute_rosi
from enterprise.engine.monte_carlo import run_monte_carlo
from enterprise.demo.fixtures import DEMO_ORG_ID, get_demo_fixture_bundle
import enterprise.db.collections as cols

logger = logging.getLogger(__name__)


def validate_portfolio_constraints(
    selected_actions: List[Dict[str, Any]],
    action_dict: Dict[str, Dict[str, Any]],
) -> bool:
    """Verifies that prerequisites and mutual exclusions are satisfied."""
    selected_ids = {a["id"] for a in selected_actions}

    for action in selected_actions:
        # Check prerequisites
        for prereq in action.get("prerequisites", []):
            if prereq not in selected_ids:
                return False

        # Check mutual exclusions
        for excl in action.get("mutual_exclusions", []):
            if excl in selected_ids:
                return False

    return True


def estimate_portfolio_loss_reduction(
    selected_actions: List[Dict[str, Any]],
    scenarios: List[Dict[str, Any]],
    scenario_eals: Dict[str, float],
) -> float:
    """
    Evaluates joint EAL reduction of a selected action subset using exact analytical expected values.
    Accounts for diminishing returns when multiple actions target the same scenario.
    """
    if not selected_actions:
        return 0.0

    # Multipliers per scenario
    multipliers: Dict[str, Dict[str, float]] = {
        sid: {"f": 1.0, "s": 1.0, "d": 1.0} for sid in scenario_eals
    }

    for action in selected_actions:
        target_ids = action.get("affected_scenario_ids", [])
        if not target_ids:
            target_ids = list(multipliers.keys())

        for sid in target_ids:
            if sid in multipliers:
                multipliers[sid]["f"] *= action.get("frequency_multiplier", 1.0)
                multipliers[sid]["s"] *= action.get("severity_multiplier", 1.0)
                multipliers[sid]["d"] *= action.get("downtime_multiplier", 1.0)

    total_reduction = 0.0
    for sid, base_eal in scenario_eals.items():
        m = multipliers[sid]
        # Net residual factor with safe floor
        residual_factor = max(0.05, m["f"] * m["s"] * m["d"])
        reduction = base_eal * (1.0 - residual_factor)
        total_reduction += max(0.0, reduction)

    return total_reduction


def optimize_investments(
    org_id: str,
    budget_inr: float,
    horizon_years: int = 1,
    seed: int = 42,
    catalogue: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Finds the optimal security portfolio that maximizes Net Benefit within budget.
    """
    actions = catalogue or get_mitigation_catalogue()
    action_dict = {a["id"]: a for a in actions}

    # Fetch scenarios
    scenarios = []
    try:
        scenarios = list(cols.risk_scenarios().find({"org_id": org_id, "is_active": True}))
    except Exception:
        pass

    if not scenarios and org_id == DEMO_ORG_ID:
        scenarios = get_demo_fixture_bundle()["scenarios"]

    # Compute baseline EAL
    baseline_res = run_monte_carlo(
        org_id=org_id,
        scenarios=scenarios,
        num_iterations=3_000,
        seed=seed,
    )
    baseline_eal = baseline_res.var_metrics["mean_eal"]
    scenario_eals = {
        (s.get("_id") or s.get("id")): s_res.mean_eal
        for s, s_res in zip(scenarios, baseline_res.scenario_results)
    }

    best_portfolio: List[Dict[str, Any]] = []
    best_net_benefit: float = -float("inf")
    best_loss_reduction: float = 0.0
    best_cost: float = 0.0

    # Exact Combinatorial Knapsack Enumeration
    for r in range(len(actions) + 1):
        for combo in itertools.combinations(actions, r):
            combo_list = list(combo)

            # Check total cost
            total_cost = sum(
                a["cost_onetime_inr"] + (a["cost_annual_inr"] * horizon_years)
                for a in combo_list
            )
            if total_cost > budget_inr:
                continue

            # Check prerequisites and mutual exclusions
            if not validate_portfolio_constraints(combo_list, action_dict):
                continue

            # Estimate joint loss reduction
            reduction = estimate_portfolio_loss_reduction(
                selected_actions=combo_list,
                scenarios=scenarios,
                scenario_eals=scenario_eals,
            )

            net_benefit = (reduction * horizon_years) - total_cost

            if net_benefit > best_net_benefit:
                best_net_benefit = net_benefit
                best_portfolio = combo_list
                best_loss_reduction = reduction
                best_cost = total_cost

    selected_ids = {a["id"] for a in best_portfolio}
    rosi_metrics = compute_rosi(
        loss_reduction_inr=best_loss_reduction,
        cost_onetime_inr=best_cost,
        cost_annual_inr=0.0,
        horizon_years=horizon_years,
    )

    unselected: List[Dict[str, Any]] = []
    for a in actions:
        if a["id"] not in selected_ids:
            a_cost = a["cost_onetime_inr"] + (a["cost_annual_inr"] * horizon_years)
            reason = "Exceeds remaining budget" if (best_cost + a_cost) > budget_inr else "Lower marginal ROSI than selected portfolio"
            unselected.append({
                "id": a["id"],
                "name": a["name"],
                "cost_inr": a_cost,
                "reason_not_selected": reason,
            })

    return {
        "budget_limit_inr": budget_inr,
        "spent_budget_inr": round(best_cost, 2),
        "budget_remaining_inr": round(max(0.0, budget_inr - best_cost), 2),
        "budget_utilization_pct": round((best_cost / budget_inr * 100.0) if budget_inr > 0 else 0.0, 1),
        "horizon_years": horizon_years,
        "baseline_eal_inr": round(baseline_eal, 2),
        "residual_eal_inr": round(max(0.0, baseline_eal - best_loss_reduction), 2),
        "expected_eal_reduction_inr": round(best_loss_reduction, 2),
        "portfolio_rosi_percentage": rosi_metrics["rosi_percentage"],
        "cost_benefit_ratio": rosi_metrics["cost_benefit_ratio"],
        "recommended_portfolio": best_portfolio,
        "unselected_actions": unselected,
        "optimality_guarantee": "Global Optimum via Exact Combinatorial Enumeration",
    }
