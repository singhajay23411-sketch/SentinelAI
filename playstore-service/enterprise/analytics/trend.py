"""
SentinelAI Enterprise - Risk History & Trend Analytics
Computes longitudinal risk trajectories, EAL evolution, and scenario attribution changes.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import enterprise.db.collections as cols
from enterprise.demo.fixtures import DEMO_ORG_ID


def get_risk_trend(org_id: str, limit: int = 12) -> Dict[str, Any]:
    """
    Returns time-series history of quantitative risk assessments.
    If only one assessment exists, generates synthetic historical baseline
    for demonstration and trend visualization.
    """
    history = []
    try:
        cursor = cols.assessments().find({"org_id": org_id}).sort("created_at", 1).limit(limit)
        history = list(cursor)
    except Exception:
        pass

    trend_points: List[Dict[str, Any]] = []

    if len(history) <= 1 and org_id == DEMO_ORG_ID:
        # Generate representative 6-month historical trajectory for demo visualization
        now = datetime.utcnow()
        base_eals = [5_200_000, 4_800_000, 4_500_000, 4_200_000, 3_950_000, 3_899_650]
        base_vars = [24_000_000, 22_500_000, 20_000_000, 19_000_000, 18_100_000, 17_446_591]

        for i, (eal, var) in enumerate(zip(base_eals, base_vars)):
            month_date = now - timedelta(days=(5 - i) * 30)
            trend_points.append({
                "date": month_date.strftime("%Y-%m-%d"),
                "expected_annual_loss_inr": eal,
                "var_95_inr": var,
                "data_label": "[DEMO - SYNTHETIC HISTORICAL BASELINE]",
            })
    else:
        for doc in history:
            summary = doc.get("summary", {})
            created = doc.get("created_at", datetime.utcnow())
            trend_points.append({
                "date": created.strftime("%Y-%m-%d") if isinstance(created, datetime) else str(created),
                "expected_annual_loss_inr": summary.get("expected_annual_loss_inr", 0.0),
                "var_95_inr": summary.get("var_95_inr", 0.0),
                "assessment_id": doc["_id"],
            })

    # Compute overall change
    if len(trend_points) >= 2:
        start_eal = trend_points[0]["expected_annual_loss_inr"]
        end_eal = trend_points[-1]["expected_annual_loss_inr"]
        diff = end_eal - start_eal
        pct_change = round((diff / start_eal * 100.0) if start_eal > 0 else 0.0, 2)
    else:
        diff = 0.0
        pct_change = 0.0

    return {
        "org_id": org_id,
        "currency": "INR",
        "trend_points": trend_points,
        "overall_eal_change_inr": round(diff, 2),
        "overall_eal_change_percentage": pct_change,
        "trend_direction": "decreasing" if diff < 0 else ("increasing" if diff > 0 else "stable"),
    }
