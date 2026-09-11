"""
SentinelAI Enterprise - Milestone 3 Verification Test
Validates:
1. Hand-calculated case: 2 incidents/yr * 1,000,000 INR = 2,000,000 EAL within simulation tolerance
2. Zero incidents -> zero loss
3. Seed determinism: same seed yields bitwise identical results
4. VaR-95 is empirical (not EAL * multiplier)
5. Control effectiveness correctly scales frequency and downtime
6. Portfolio Monte Carlo across all 3 Sentinel Demo scenarios
"""

import sys
import os
import numpy as np

sys.path.insert(0, "playstore-service")
os.environ["JWT_SECRET_KEY"] = "test_secret_key_32_chars_exactly_here"
os.environ["MONGODB_URI"] = "mongodb://localhost:27017"

from enterprise.engine.loss_components import sample_pert, evaluate_component_loss, aggregate_loss_components
from enterprise.engine.control_effectiveness import compute_aggregate_control_modifiers
from enterprise.engine.scenario_model import simulate_scenario
from enterprise.engine.var_calculator import calculate_var_metrics, evaluate_appetite
from enterprise.engine.monte_carlo import run_monte_carlo
from enterprise.demo.fixtures import get_demo_fixture_bundle

print("--- 1. Testing Hand-Calculated Case ---")
# 2 incidents/year * 1,000,000 INR = 2,000,000 EAL
test_scenario = {
    "_id": "SCN-HAND-CALC",
    "name": "Hand Calculated Test Scenario",
    "expected_incidents_per_year": 2.0,
    "loss_components": [
        {
            "name": "Deterministic Outage",
            "min_inr": 1_000_000,
            "most_likely_inr": 1_000_000,
            "max_inr": 1_000_000,
            "conditional": False,
        }
    ]
}

res = simulate_scenario(test_scenario, num_iterations=50_000, rng=np.random.default_rng(123))
theoretical_eal = 2_000_000.0
error_pct = abs(res.mean_eal - theoretical_eal) / theoretical_eal * 100.0
print(f"Theoretical EAL: INR {theoretical_eal:,.2f} | Modeled EAL: INR {res.mean_eal:,.2f} (Error: {error_pct:.2f}%)")
assert error_pct < 2.0, f"Error {error_pct}% exceeds 2% tolerance"
print("Hand-calculated calibration: PASSED - OK")

print("\n--- 2. Testing Zero Incidents Case ---")
zero_scenario = {
    "_id": "SCN-ZERO",
    "name": "Zero Frequency Scenario",
    "expected_incidents_per_year": 0.0,
    "loss_components": [
        {"name": "Heavy Loss", "min_inr": 10_000_000, "most_likely_inr": 20_000_000, "max_inr": 30_000_000}
    ]
}
zero_res = simulate_scenario(zero_scenario, num_iterations=10_000, rng=np.random.default_rng(42))
assert zero_res.mean_eal == 0.0, f"Expected 0 EAL, got {zero_res.mean_eal}"
assert zero_res.var_95 == 0.0
assert zero_res.max_loss == 0.0
print("Zero incident rate produces exact zero loss - OK")

print("\n--- 3. Testing Exact Seed Reproducibility ---")
run1 = simulate_scenario(test_scenario, num_iterations=10_000, rng=np.random.default_rng(999))
run2 = simulate_scenario(test_scenario, num_iterations=10_000, rng=np.random.default_rng(999))
assert run1.mean_eal == run2.mean_eal, "EAL differed with same seed"
assert run1.var_95 == run2.var_95, "VaR-95 differed with same seed"
assert np.array_equal(run1.annual_losses, run2.annual_losses), "Loss vectors differed with same seed"
print(f"Seed reproducibility confirmed: Run 1 = INR {run1.mean_eal:,.2f}, Run 2 = INR {run2.mean_eal:,.2f} - OK")

print("\n--- 4. Testing Empirical VaR-95 vs Fixed Multiplier ---")
skewed_scenario = {
    "_id": "SCN-SKEWED",
    "name": "Skewed Tail Scenario",
    "expected_incidents_per_year": 0.05,  # ~1 incident every 20 years
    "loss_components": [
        {"name": "Catastrophic Breach", "min_inr": 10_000_000, "most_likely_inr": 30_000_000, "max_inr": 80_000_000}
    ]
}
skewed_res = simulate_scenario(skewed_scenario, num_iterations=20_000, rng=np.random.default_rng(42))
var_metrics = calculate_var_metrics(skewed_res.annual_losses)
print(f"Skewed Scenario - Mean EAL: INR {var_metrics['mean_eal']:,.2f} | VaR-95: INR {var_metrics['var_95']:,.2f} | VaR-99: INR {var_metrics['var_99']:,.2f}")
# In 95.1% of years (lambda=0.05, P(N=0)=e^-0.05~95.1%), exactly 0 incidents occur.
# Thus VaR-95 is 0.00, whereas VaR-99 is heavily elevated. This proves empirical extraction.
assert var_metrics['var_99'] > var_metrics['mean_eal'] * 10, "VaR-99 should capture the catastrophic tail"
print("Empirical VaR captures zero-inflation for rare events and tail risk at 99% - OK")

# Now test moderate frequency where VaR-95 captures tail above EAL
mod_scenario = {
    "_id": "SCN-MOD",
    "name": "Moderate Frequency Scenario",
    "expected_incidents_per_year": 1.0,
    "loss_components": [
        {"name": "Standard Breach", "min_inr": 1_000_000, "most_likely_inr": 2_000_000, "max_inr": 5_000_000}
    ]
}
mod_res = simulate_scenario(mod_scenario, num_iterations=20_000, rng=np.random.default_rng(42))
mod_metrics = calculate_var_metrics(mod_res.annual_losses)
print(f"Moderate Scenario - Mean EAL: INR {mod_metrics['mean_eal']:,.2f} | VaR-95: INR {mod_metrics['var_95']:,.2f}")
assert mod_metrics['var_95'] > mod_metrics['mean_eal'], "VaR-95 should exceed mean EAL for moderate frequency"
print("Empirical VaR-95 extraction confirmed - OK")

print("\n--- 5. Testing Control Modifiers (MFA & Backups) ---")
mfa_control = [{"name": "Enforce FIDO2/Hardware MFA for All Privileged Accounts", "coverage_percentage": 100.0}]
modifiers = compute_aggregate_control_modifiers(mfa_control)
print(f"MFA Control Modifiers: {modifiers}")
assert modifiers["frequency_multiplier"] < 0.5, "MFA should significantly reduce frequency"

backup_control = [{"name": "Immutable & Air-Gapped Backup System with Automated DR", "coverage_percentage": 100.0}]
b_modifiers = compute_aggregate_control_modifiers(backup_control)
print(f"Backup Control Modifiers: {b_modifiers}")
assert b_modifiers["downtime_multiplier"] <= 0.5, "Backups should cut downtime by at least 50%"
print("Targeted parameter modification: PASSED - OK")

print("\n--- 6. Testing Full Portfolio Monte Carlo on Sentinel Demo ---")
bundle = get_demo_fixture_bundle()
scenarios = bundle["scenarios"]
org = bundle["org"]

portfolio_res = run_monte_carlo(
    org_id=bundle["org_id"],
    scenarios=scenarios,
    controls=[],
    num_iterations=10_000,
    seed=42,
    risk_appetite=org.get("risk_appetite"),
)

data = portfolio_res.to_dict()
total_eal = data["summary"]["expected_annual_loss_inr"]
var_95 = data["summary"]["var_95_inr"]
var_99 = data["summary"]["var_99_inr"]
appetite_status = data["summary"]["appetite_evaluation"]["status"]

print(f"Portfolio Total EAL: INR {total_eal:,.2f}")
print(f"Portfolio 95% VaR:   INR {var_95:,.2f}")
print(f"Portfolio 99% VaR:   INR {var_99:,.2f}")
print(f"Appetite Status:    {appetite_status}")
print("Top Risk Contributors:")
for c in data["top_contributors"]:
    print(f"  - {c['scenario_name']}: INR {c['expected_annual_loss_inr']:,.2f} ({c['percentage_of_total_eal']}%)")

assert total_eal > 1_000_000, f"Expected realistic total EAL > INR 10L, got {total_eal}"
assert var_95 > total_eal, f"Expected 95% VaR > EAL, got VaR={var_95}, EAL={total_eal}"
assert len(data["top_contributors"]) == 3, f"Expected 3 contributors, got {len(data['top_contributors'])}"

print("\n=======================================================")
print("ALL MILESTONE 3 FINANCIAL ENGINE TESTS PASSED (6/6)!")
print("=======================================================")
