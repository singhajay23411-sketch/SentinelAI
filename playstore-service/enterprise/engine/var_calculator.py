"""
SentinelAI Enterprise - Value at Risk (VaR) & Tail Risk Calculator
Calculates empirical percentiles, Conditional VaR (Expected Shortfall),
and evaluates risk appetite compliance thresholds.
"""

from typing import Dict, Any, List, Optional
import numpy as np


def calculate_var_metrics(
    loss_distribution: np.ndarray,
    confidence_levels: Optional[List[float]] = None
) -> Dict[str, Any]:
    """
    Extracts empirical VaR and tail statistics from simulation trials.
    Never uses a constant multiplier on EAL.
    """
    if confidence_levels is None:
        confidence_levels = [0.50, 0.75, 0.90, 0.95, 0.99]

    if len(loss_distribution) == 0:
        return {
            "mean_eal": 0.0,
            "median_loss": 0.0,
            "std_dev": 0.0,
            "max_simulated_loss": 0.0,
            "percentiles": {},
            "cvar_95": 0.0,
        }

    mean_eal = float(np.mean(loss_distribution))
    median_loss = float(np.median(loss_distribution))
    std_dev = float(np.std(loss_distribution))
    max_loss = float(np.max(loss_distribution))

    percentiles: Dict[str, float] = {}
    for cl in confidence_levels:
        pct_label = f"p{int(cl * 100)}"
        percentiles[pct_label] = round(float(np.percentile(loss_distribution, cl * 100)), 2)

    # Calculate Conditional VaR (Expected Shortfall) at 95%
    p95_val = np.percentile(loss_distribution, 95)
    tail_losses = loss_distribution[loss_distribution >= p95_val]
    cvar_95 = float(np.mean(tail_losses)) if len(tail_losses) > 0 else p95_val

    return {
        "mean_eal": round(mean_eal, 2),
        "median_loss": round(median_loss, 2),
        "std_dev": round(std_dev, 2),
        "max_simulated_loss": round(max_loss, 2),
        "percentiles": percentiles,
        "var_95": percentiles.get("p95", 0.0),
        "var_99": percentiles.get("p99", 0.0),
        "cvar_95": round(cvar_95, 2),
        "interpretation": (
            "Model-estimated annual loss threshold exceeded in approximately 5% of simulated years, "
            "subject to documented assumptions. Not a maximum possible loss."
        ),
    }


def evaluate_appetite(
    eal: float,
    var_95: float,
    appetite_eal: Optional[float],
    appetite_var_95: Optional[float],
) -> Dict[str, Any]:
    """
    Compares modeled losses against executive-approved risk appetite limits.
    Returns status: 'within_appetite' | 'near_limit' | 'exceeded'.
    """
    eal_status = "within_appetite"
    var_status = "within_appetite"
    overall_status = "within_appetite"

    if appetite_eal and appetite_eal > 0:
        ratio = eal / appetite_eal
        if ratio > 1.0:
            eal_status = "exceeded"
        elif ratio >= 0.8:
            eal_status = "near_limit"

    if appetite_var_95 and appetite_var_95 > 0:
        ratio = var_95 / appetite_var_95
        if ratio > 1.0:
            var_status = "exceeded"
        elif ratio >= 0.8:
            var_status = "near_limit"

    if eal_status == "exceeded" or var_status == "exceeded":
        overall_status = "exceeded"
    elif eal_status == "near_limit" or var_status == "near_limit":
        overall_status = "near_limit"

    return {
        "status": overall_status,
        "eal_modeled": round(eal, 2),
        "eal_threshold": appetite_eal,
        "eal_status": eal_status,
        "var95_modeled": round(var_95, 2),
        "var95_threshold": appetite_var_95,
        "var95_status": var_status,
    }
