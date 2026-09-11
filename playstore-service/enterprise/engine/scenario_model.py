"""
SentinelAI Enterprise - Compound Scenario Simulation Model
Combines threat frequency processes with severity component distributions.
Models annual loss as: Sum_{i=1..N} Severity_i, where N ~ Poisson(lambda * f_modifier).
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np

from enterprise.engine.loss_components import aggregate_loss_components
from enterprise.engine.control_effectiveness import compute_aggregate_control_modifiers


class ScenarioSimulationResult:
    def __init__(
        self,
        scenario_id: str,
        scenario_name: str,
        annual_losses: np.ndarray,
        incident_counts: np.ndarray,
        mean_eal: float,
        var_95: float,
        var_99: float,
        max_loss: float,
        effective_lambda: float,
        modifiers: Dict[str, float],
        component_means: Dict[str, float],
    ):
        self.scenario_id = scenario_id
        self.scenario_name = scenario_name
        self.annual_losses = annual_losses
        self.incident_counts = incident_counts
        self.mean_eal = mean_eal
        self.var_95 = var_95
        self.var_99 = var_99
        self.max_loss = max_loss
        self.effective_lambda = effective_lambda
        self.modifiers = modifiers
        self.component_means = component_means

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scenario_id": self.scenario_id,
            "scenario_name": self.scenario_name,
            "expected_annual_loss_inr": round(float(self.mean_eal), 2),
            "var_95_inr": round(float(self.var_95), 2),
            "var_99_inr": round(float(self.var_99), 2),
            "max_simulated_loss_inr": round(float(self.max_loss), 2),
            "effective_lambda": round(float(self.effective_lambda), 4),
            "applied_modifiers": self.modifiers,
            "loss_component_breakdown": {
                k: round(float(v), 2) for k, v in self.component_means.items()
            },
        }


def simulate_scenario(
    scenario: Dict[str, Any],
    controls: Optional[List[Dict[str, Any]]] = None,
    num_iterations: int = 10_000,
    rng: Optional[np.random.Generator] = None,
    parameter_overrides: Optional[Dict[str, Any]] = None,
) -> ScenarioSimulationResult:
    """
    Simulates a single risk scenario for `num_iterations` annual trials.
    Supports counterfactual parameter overrides for what-if analysis.
    """
    if rng is None:
        rng = np.random.default_rng()

    scenario_id = scenario.get("_id") or scenario.get("id", "SCN-UNKNOWN")
    scenario_name = scenario.get("name", "Unnamed Scenario")
    base_lambda = float(scenario.get("expected_incidents_per_year", 0.1))

    # Apply parameter overrides if present
    if parameter_overrides:
        if "expected_incidents_per_year" in parameter_overrides:
            base_lambda = float(parameter_overrides["expected_incidents_per_year"])

    # Compute control modifiers
    ctrl_list = controls or []
    modifiers = compute_aggregate_control_modifiers(ctrl_list, scenario_id=scenario_id)

    # Check for direct modifier override in what-if
    if parameter_overrides and "modifiers" in parameter_overrides:
        modifiers.update(parameter_overrides["modifiers"])

    effective_lambda = max(0.0, base_lambda * modifiers["frequency_multiplier"])

    # Sample incident counts for each of the `num_iterations` simulated years
    if effective_lambda == 0.0:
        incident_counts = np.zeros(num_iterations, dtype=np.int32)
    else:
        incident_counts = rng.poisson(lam=effective_lambda, size=num_iterations)

    total_incidents = int(np.sum(incident_counts))
    annual_losses = np.zeros(num_iterations, dtype=np.float64)
    components = scenario.get("loss_components", [])
    component_means: Dict[str, float] = {}

    if total_incidents > 0 and len(components) > 0:
        # Sample loss per incident across all realized incidents
        incident_losses, comp_breakdown = aggregate_loss_components(
            components=components,
            size=total_incidents,
            rng=rng,
        )

        # Apply severity and downtime modifiers
        incident_losses = incident_losses * modifiers["severity_multiplier"] * modifiers["downtime_multiplier"]

        # Distribute incident losses into simulated years
        idx = 0
        for year in range(num_iterations):
            n = incident_counts[year]
            if n > 0:
                annual_losses[year] = np.sum(incident_losses[idx : idx + n])
                idx += n

        for comp_name, comp_arr in comp_breakdown.items():
            scaled = comp_arr * modifiers["severity_multiplier"]
            component_means[comp_name] = float(np.mean(scaled) * effective_lambda)
    else:
        for comp in components:
            component_means[comp.get("name", "Component")] = 0.0

    mean_eal = float(np.mean(annual_losses))
    var_95 = float(np.percentile(annual_losses, 95))
    var_99 = float(np.percentile(annual_losses, 99))
    max_loss = float(np.max(annual_losses))

    return ScenarioSimulationResult(
        scenario_id=scenario_id,
        scenario_name=scenario_name,
        annual_losses=annual_losses,
        incident_counts=incident_counts,
        mean_eal=mean_eal,
        var_95=var_95,
        var_99=var_99,
        max_loss=max_loss,
        effective_lambda=effective_lambda,
        modifiers=modifiers,
        component_means=component_means,
    )
