"""
SentinelAI Enterprise - Return on Security Investment (ROSI)
Implements standard economic formulas for evaluating cybersecurity investments:
ROSI = (Loss Reduction - Total Cost) / Total Cost
Cost-Benefit Ratio (CBR) = Loss Reduction / Total Cost
Net Present Benefit = Loss Reduction - Total Cost
"""

from typing import Dict, Any, Optional


def compute_rosi(
    loss_reduction_inr: float,
    cost_onetime_inr: float,
    cost_annual_inr: float,
    horizon_years: int = 1,
) -> Dict[str, Any]:
    """
    Computes ROSI, Net Benefit, and Cost-Benefit ratio over the evaluation horizon.
    Guarantees no division-by-zero errors.
    """
    total_cost = cost_onetime_inr + (cost_annual_inr * horizon_years)
    total_reduction = loss_reduction_inr * horizon_years

    net_benefit = total_reduction - total_cost

    if total_cost <= 0:
        rosi_pct = 0.0 if total_reduction <= 0 else 9999.0
        cbr = 1.0 if total_reduction <= 0 else 9999.0
    else:
        rosi_pct = round((net_benefit / total_cost) * 100.0, 2)
        cbr = round(total_reduction / total_cost, 2)

    return {
        "loss_reduction_inr": round(total_reduction, 2),
        "total_cost_inr": round(total_cost, 2),
        "net_benefit_inr": round(net_benefit, 2),
        "rosi_percentage": rosi_pct,
        "cost_benefit_ratio": cbr,
        "horizon_years": horizon_years,
        "is_cost_effective": net_benefit > 0,
    }
