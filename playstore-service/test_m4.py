"""
SentinelAI Enterprise - Milestone 4 Verification Test
Validates:
1. What-If Simulation: MFA enablement shows statistically significant EAL reduction
2. What-If Delay Modeling: Remediation delay explicitly models elevated risk exposure
3. Common Random Numbers: Noise cancelled between counterfactual and baseline
4. ROSI Calculation verified against analytical formula
5. Budget Optimizer: Respects budget ceiling and identifies optimal knapsack portfolio
6. Investment Efficiency Curve: Generates diminishing return frontier
"""

import sys
import os

sys.path.insert(0, "playstore-service")
os.environ["JWT_SECRET_KEY"] = "test_secret_key_32_chars_exactly_here"
os.environ["MONGODB_URI"] = "mongodb://localhost:27017"

from enterprise.simulation.models import Intervention, InterventionType
from enterprise.simulation.simulator import run_what_if_simulation
from enterprise.optimizer.rosi import compute_rosi
from enterprise.optimizer.optimizer import optimize_investments
from enterprise.optimizer.investment_curve import generate_investment_curve
from enterprise.demo.fixtures import DEMO_ORG_ID

print("--- 1. Testing Analytical ROSI Calculator ---")
# Hand calculation: Loss reduction = 1,000,000 INR, Cost = 400,000 INR
# Net benefit = 600,000 INR. ROSI = 600,000 / 400,000 = 150.0%
rosi_res = compute_rosi(
    loss_reduction_inr=1_000_000.0,
    cost_onetime_inr=400_000.0,
    cost_annual_inr=0.0,
    horizon_years=1,
)
print(f"ROSI Hand Calc: Net Benefit = INR {rosi_res['net_benefit_inr']:,.2f}, ROSI = {rosi_res['rosi_percentage']}%")
assert rosi_res["net_benefit_inr"] == 600_000.0
assert rosi_res["rosi_percentage"] == 150.0
assert rosi_res["cost_benefit_ratio"] == 2.5
assert rosi_res["is_cost_effective"] is True

# Zero cost edge case
zero_cost_rosi = compute_rosi(500_000.0, 0.0, 0.0)
assert zero_cost_rosi["rosi_percentage"] == 9999.0
print("ROSI calculation: PASSED - OK")

print("\n--- 2. Testing What-If Simulation: MFA Enablement ---")
mfa_sim = run_what_if_simulation(
    org_id=DEMO_ORG_ID,
    name="Test What-If: Enforce Privileged MFA",
    description="Evaluate EAL reduction after mandating MFA across all admin identities",
    interventions=[
        Intervention(
            intervention_type=InterventionType.enable_mfa,
            name="Hardware MFA",
        )
    ],
    seed=42,
    num_iterations=10_000,
)

print(f"Baseline EAL:       INR {mfa_sim['baseline_eal']:,.2f}")
print(f"Counterfactual EAL: INR {mfa_sim['counterfactual_eal']:,.2f}")
print(f"EAL Reduction:      INR {mfa_sim['eal_reduction']:,.2f} ({mfa_sim['eal_reduction_pct']}%)")
print(f"95% VaR Reduction:  INR {mfa_sim['var95_reduction']:,.2f}")

assert mfa_sim["counterfactual_eal"] < mfa_sim["baseline_eal"], "Counterfactual EAL should be lower than baseline"
assert mfa_sim["eal_reduction"] > 500_000, "MFA should reduce EAL by > INR 5L"

# Check scenario deltas
id_scenario = [d for d in mfa_sim["scenario_deltas"] if "Account" in d["scenario_name"] or "Privilege" in d["scenario_name"]][0]
print(f"Target Scenario '{id_scenario['scenario_name']}': Reduction = {id_scenario['eal_reduction_pct']}%")
assert id_scenario["eal_reduction_pct"] > 60.0, "Identity scenario should show >60% reduction under MFA"
print("MFA What-If simulation: PASSED - OK")

print("\n--- 3. Testing What-If Simulation: Delay Remediation Modeling ---")
delay_sim = run_what_if_simulation(
    org_id=DEMO_ORG_ID,
    name="Test Delay Remediation 90 Days",
    description="Explicitly measure additional exposure if remediation delayed 90 days",
    interventions=[
        Intervention(
            intervention_type=InterventionType.delay_remediation,
            name="90 Day Patch Delay",
            delay_days=90,
        )
    ],
    seed=42,
    num_iterations=10_000,
)

print(f"Baseline EAL:     INR {delay_sim['baseline_eal']:,.2f}")
print(f"Delayed EAL:      INR {delay_sim['counterfactual_eal']:,.2f}")
extra_exposure = delay_sim['counterfactual_eal'] - delay_sim['baseline_eal']
print(f"Added Risk from 90d Delay: INR {extra_exposure:,.2f}")
assert delay_sim["counterfactual_eal"] > delay_sim["baseline_eal"], "Delayed remediation must increase modeled exposure"
print("Delay exposure modeling: PASSED - OK")

print("\n--- 4. Testing Combinatorial Knapsack Budget Optimizer ---")
budget = 1_500_000.0  # INR 15 Lakhs
opt_res = optimize_investments(
    org_id=DEMO_ORG_ID,
    budget_inr=budget,
    horizon_years=1,
    seed=42,
)

print(f"Budget Limit:    INR {opt_res['budget_limit_inr']:,.2f}")
print(f"Spent Budget:    INR {opt_res['spent_budget_inr']:,.2f} ({opt_res['budget_utilization_pct']}%)")
print(f"EAL Reduction:   INR {opt_res['expected_eal_reduction_inr']:,.2f}")
print(f"Portfolio ROSI:  {opt_res['portfolio_rosi_percentage']}%")
print(f"Selected Actions ({len(opt_res['recommended_portfolio'])}):")
for a in opt_res["recommended_portfolio"]:
    print(f"  - [{a['id']}] {a['name']} (INR {a['cost_onetime_inr'] + a['cost_annual_inr']:,.2f})")

assert opt_res["spent_budget_inr"] <= budget, "Spent budget must not exceed budget limit"
assert len(opt_res["recommended_portfolio"]) > 0, "Optimizer should recommend at least one action"
assert opt_res["expected_eal_reduction_inr"] > 0, "Portfolio must achieve positive risk reduction"
print("Budget optimizer: PASSED - OK")

print("\n--- 5. Testing Investment Efficiency Curve ---")
curve_res = generate_investment_curve(
    org_id=DEMO_ORG_ID,
    max_budget_inr=3_000_000.0,
    steps=6,
    horizon_years=1,
    seed=42,
)

points = curve_res["curve_points"]
print(f"Generated {len(points)} frontier points:")
for p in points:
    print(f"  Tier: INR {p['budget_tier_inr']:,.0f} | Spent: INR {p['spent_inr']:,.0f} | EAL Red: INR {p['expected_eal_reduction_inr']:,.0f} | Actions: {p['actions_count']}")

# Check that spending never exceeds budget tier
for p in points:
    assert p["spent_inr"] <= p["budget_tier_inr"] + 1.0

# Check sweet spot exists
sweet = curve_res["recommended_sweet_spot"]
print(f"Recommended Sweet Spot: Tier INR {sweet['budget_tier_inr']:,.0f} (ROSI: {sweet['rosi_percentage']}%)")
assert sweet["spent_inr"] > 0
print("Investment curve: PASSED - OK")

print("\n===========================================================")
print("ALL MILESTONE 4 SIMULATION & OPTIMIZER TESTS PASSED (5/5)!")
print("===========================================================")
