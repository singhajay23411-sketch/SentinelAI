"""
SentinelAI Enterprise - Investment Efficiency Curve Generator
Computes the risk reduction frontier (diminishing returns curve)
across ascending capital allocation tiers.
"""

from typing import Dict, Any, List
from enterprise.optimizer.optimizer import optimize_investments
from enterprise.optimizer.catalogue import get_mitigation_catalogue


def generate_investment_curve(
    org_id: str,
    max_budget_inr: float = 4_000_000.0,
    steps: int = 8,
    horizon_years: int = 1,
    seed: int = 42,
) -> Dict[str, Any]:
    """
    Computes portfolio optimization across N budget points to construct
    the risk-return efficiency frontier.
    """
    actions = get_mitigation_catalogue()
    step_size = max_budget_inr / max(1, steps - 1)

    budget_points = [round(i * step_size, 0) for i in range(steps)]
    curve_points: List[Dict[str, Any]] = []

    prev_reduction = 0.0
    prev_spent = 0.0

    for budget in budget_points:
        opt = optimize_investments(
            org_id=org_id,
            budget_inr=budget,
            horizon_years=horizon_years,
            seed=seed,
            catalogue=actions,
        )

        spent = opt["spent_budget_inr"]
        reduction = opt["expected_eal_reduction_inr"]
        marginal_spent = max(1.0, spent - prev_spent)
        marginal_gain = max(0.0, reduction - prev_reduction)
        marginal_roi = round((marginal_gain / marginal_spent) * 100.0, 1) if marginal_spent > 0 else 0.0

        curve_points.append({
            "budget_tier_inr": budget,
            "spent_inr": spent,
            "residual_eal_inr": opt["residual_eal_inr"],
            "expected_eal_reduction_inr": reduction,
            "rosi_percentage": opt["portfolio_rosi_percentage"],
            "actions_count": len(opt["recommended_portfolio"]),
            "marginal_roi_percentage": marginal_roi,
            "recommended_action_ids": [a["id"] for a in opt["recommended_portfolio"]],
        })

        prev_reduction = reduction
        prev_spent = spent

    # Find highest ROSI or inflection point
    best_point = max(curve_points, key=lambda p: p["expected_eal_reduction_inr"] - p["spent_inr"])

    return {
        "org_id": org_id,
        "max_budget_inr": max_budget_inr,
        "horizon_years": horizon_years,
        "curve_points": curve_points,
        "recommended_sweet_spot": {
            "budget_tier_inr": best_point["budget_tier_inr"],
            "spent_inr": best_point["spent_inr"],
            "expected_eal_reduction_inr": best_point["expected_eal_reduction_inr"],
            "rosi_percentage": best_point["rosi_percentage"],
            "actions": best_point["recommended_action_ids"],
            "rationale": "Maximizes net economic benefit before diminishing returns.",
        },
    }
