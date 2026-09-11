"""
SentinelAI Enterprise - Monte Carlo Simulation Engine
Runs multi-scenario simulations to compute portfolio Expected Annual Loss (EAL),
aggregate Value at Risk (VaR), and scenario risk attributions.
Strictly reproducible via explicit random seeds.
"""

from typing import Dict, Any, List, Optional
import numpy as np

from enterprise.engine.scenario_model import simulate_scenario, ScenarioSimulationResult
from enterprise.engine.var_calculator import calculate_var_metrics, evaluate_appetite


class PortfolioSimulationResult:
    def __init__(
        self,
        org_id: str,
        seed: int,
        num_iterations: int,
        portfolio_losses: np.ndarray,
        scenario_results: List[ScenarioSimulationResult],
        var_metrics: Dict[str, Any],
        top_contributors: List[Dict[str, Any]],
        appetite_evaluation: Dict[str, Any],
        model_version: str = "1.0",
    ):
        self.org_id = org_id
        self.seed = seed
        self.num_iterations = num_iterations
        self.portfolio_losses = portfolio_losses
        self.scenario_results = scenario_results
        self.var_metrics = var_metrics
        self.top_contributors = top_contributors
        self.appetite_evaluation = appetite_evaluation
        self.model_version = model_version

    def to_dict(self) -> Dict[str, Any]:
        return {
            "org_id": self.org_id,
            "seed": self.seed,
            "simulation_count": self.num_iterations,
            "currency": "INR",
            "model_version": self.model_version,
            "summary": {
                "expected_annual_loss_inr": self.var_metrics["mean_eal"],
                "var_95_inr": self.var_metrics["var_95"],
                "var_99_inr": self.var_metrics["var_99"],
                "cvar_95_inr": self.var_metrics["cvar_95"],
                "max_simulated_loss_inr": self.var_metrics["max_simulated_loss"],
                "percentiles": self.var_metrics["percentiles"],
                "interpretation": self.var_metrics["interpretation"],
                "appetite_evaluation": self.appetite_evaluation,
            },
            "top_contributors": self.top_contributors,
            "scenarios": [s.to_dict() for s in self.scenario_results],
        }


def run_monte_carlo(
    org_id: str,
    scenarios: List[Dict[str, Any]],
    controls: Optional[List[Dict[str, Any]]] = None,
    num_iterations: int = 10_000,
    seed: int = 42,
    risk_appetite: Optional[Dict[str, Any]] = None,
    parameter_overrides: Optional[Dict[str, Dict[str, Any]]] = None,
) -> PortfolioSimulationResult:
    """
    Simulates portfolio risk across all scenarios for `num_iterations` years.
    Guarantees that identical inputs and seed yield bitwise identical output.
    """
    rng = np.random.default_rng(seed)
    ctrl_list = controls or []

    portfolio_losses = np.zeros(num_iterations, dtype=np.float64)
    scenario_results: List[ScenarioSimulationResult] = []

    for scn in scenarios:
        scn_id = scn.get("_id") or scn.get("id")
        overrides = parameter_overrides.get(scn_id) if parameter_overrides else None

        res = simulate_scenario(
            scenario=scn,
            controls=ctrl_list,
            num_iterations=num_iterations,
            rng=rng,
            parameter_overrides=overrides,
        )
        scenario_results.append(res)
        portfolio_losses += res.annual_losses

    var_metrics = calculate_var_metrics(portfolio_losses)

    # Calculate percentage contributions
    total_eal = var_metrics["mean_eal"]
    contributors: List[Dict[str, Any]] = []
    for res in scenario_results:
        pct = (res.mean_eal / total_eal * 100.0) if total_eal > 0 else 0.0
        contributors.append({
            "scenario_id": res.scenario_id,
            "scenario_name": res.scenario_name,
            "expected_annual_loss_inr": round(res.mean_eal, 2),
            "percentage_of_total_eal": round(pct, 1),
            "var_95_inr": round(res.var_95, 2),
        })

    contributors.sort(key=lambda x: x["expected_annual_loss_inr"], reverse=True)

    # Evaluate against appetite
    app_eal = risk_appetite.get("exposure_limit_eal") if risk_appetite else None
    app_var = risk_appetite.get("exposure_limit_var95") if risk_appetite else None
    appetite_eval = evaluate_appetite(
        eal=total_eal,
        var_95=var_metrics["var_95"],
        appetite_eal=app_eal,
        appetite_var_95=app_var,
    )

    return PortfolioSimulationResult(
        org_id=org_id,
        seed=seed,
        num_iterations=num_iterations,
        portfolio_losses=portfolio_losses,
        scenario_results=scenario_results,
        var_metrics=var_metrics,
        top_contributors=contributors,
        appetite_evaluation=appetite_eval,
    )
