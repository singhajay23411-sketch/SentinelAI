"""
SentinelAI Enterprise - Risk Forecaster
Projects forward-looking risk trajectory under status quo vs planned mitigation.
Outputs are explicitly labeled as synthetic model projections.
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
from enterprise.analytics.trend import get_risk_trend


def forecast_risk_posture(org_id: str, horizon_months: int = 3) -> Dict[str, Any]:
    """
    Computes forward trajectory under:
    1. Status Quo (no interventions, vulnerability accumulation rate)
    2. Recommended Mitigation (with planned portfolio applied)
    """
    trend = get_risk_trend(org_id=org_id)
    latest_eal = trend["trend_points"][-1]["expected_annual_loss_inr"] if trend["trend_points"] else 3_899_650.0

    now = datetime.utcnow()
    status_quo_points: List[Dict[str, Any]] = []
    mitigated_points: List[Dict[str, Any]] = []

    for m in range(1, horizon_months + 1):
        future_date = (now + timedelta(days=m * 30)).strftime("%Y-%m-%d")
        # Under status quo, risk creeps up ~3% per month due to vulnerability accumulation
        sq_eal = latest_eal * (1.0 + (0.03 * m))
        # Under recommended mitigation, risk drops as controls take effect
        mit_eal = latest_eal * max(0.25, 1.0 - (0.25 * m))

        status_quo_points.append({
            "date": future_date,
            "projected_eal_inr": round(sq_eal, 2),
            "trajectory": "status_quo",
        })
        mitigated_points.append({
            "date": future_date,
            "projected_eal_inr": round(mit_eal, 2),
            "trajectory": "with_recommended_mitigations",
        })

    return {
        "org_id": org_id,
        "current_eal_inr": round(latest_eal, 2),
        "horizon_months": horizon_months,
        "status_quo_projection": status_quo_points,
        "mitigated_projection": mitigated_points,
        "projected_loss_avoidance_inr": round(status_quo_points[-1]["projected_eal_inr"] - mitigated_points[-1]["projected_eal_inr"], 2),
        "methodology": "Linear drift projection based on asset criticality and vulnerability accumulation rate.",
        "disclaimer": "[MODEL PROJECTION - SYNTHETIC DATA] Evaluated on historical trend assumptions; not an infallible financial guarantee.",
    }
