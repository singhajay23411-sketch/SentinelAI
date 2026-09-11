"""
SentinelAI Enterprise - Loss Components & Distribution Sampler
Implements actuarial loss distributions (Modified PERT, Triangular, Lognormal)
with explicit overlap prevention and documented calibration basis.
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np


def sample_pert(
    min_val: float,
    most_likely: float,
    max_val: float,
    size: int,
    gamma: float = 4.0,
    rng: Optional[np.random.Generator] = None,
) -> np.ndarray:
    """
    Samples from a Modified PERT (Beta-PERT) distribution.
    Preferred in cybersecurity risk quantification (FAIR-aligned) because it
    places realistic weight on the most likely estimate while bounding extremes.
    """
    if rng is None:
        rng = np.random.default_rng()

    if min_val >= max_val:
        return np.full(size, float(min_val))
    if not (min_val <= most_likely <= max_val):
        most_likely = (min_val + max_val) / 2.0

    # Calculate PERT alpha and beta parameters
    mu = (min_val + gamma * most_likely + max_val) / (gamma + 2.0)
    if mu == most_likely:
        alpha = 1.0 + gamma / 2.0
        beta = alpha
    else:
        alpha = ((mu - min_val) * (2.0 * most_likely - min_val - max_val)) / (
            (most_likely - mu) * (max_val - min_val)
        )
        alpha = max(alpha, 1.0)
        beta = (alpha * (max_val - mu)) / (mu - min_val)
        beta = max(beta, 1.0)

    beta_samples = rng.beta(alpha, beta, size=size)
    return min_val + beta_samples * (max_val - min_val)


def sample_triangular(
    min_val: float,
    most_likely: float,
    max_val: float,
    size: int,
    rng: Optional[np.random.Generator] = None,
) -> np.ndarray:
    """Standard triangular distribution fallback."""
    if rng is None:
        rng = np.random.default_rng()
    if min_val >= max_val:
        return np.full(size, float(min_val))
    mode = min(max(most_likely, min_val), max_val)
    return rng.triangular(min_val, mode, max_val, size=size)


def evaluate_component_loss(
    comp: Dict[str, Any],
    size: int,
    rng: Optional[np.random.Generator] = None,
    condition_active: bool = True,
) -> np.ndarray:
    """
    Generates single-component loss samples across `size` simulated years.
    Handles conditional components (e.g. regulatory fines that only trigger if a threshold is crossed).
    """
    if rng is None:
        rng = np.random.default_rng()

    is_conditional = comp.get("conditional", False)
    if is_conditional and not condition_active:
        return np.zeros(size, dtype=np.float64)

    min_inr = float(comp.get("min_inr", 0.0))
    max_inr = float(comp.get("max_inr", 0.0))
    mode_inr = float(comp.get("most_likely_inr", min_inr))

    if max_inr <= 0:
        return np.zeros(size, dtype=np.float64)

    # Sample from Beta-PERT distribution
    samples = sample_pert(min_inr, mode_inr, max_inr, size=size, rng=rng)
    return np.maximum(samples, 0.0)


def aggregate_loss_components(
    components: List[Dict[str, Any]],
    size: int,
    rng: Optional[np.random.Generator] = None,
) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
    """
    Aggregates all components for an incident event while preventing double-counting.
    Returns:
        total_loss: ndarray of shape (size,)
        component_breakdown: Dict mapping component name -> ndarray of shape (size,)
    """
    if rng is None:
        rng = np.random.default_rng()

    total = np.zeros(size, dtype=np.float64)
    breakdown: Dict[str, np.ndarray] = {}
    evaluated_names: set = set()

    for comp in components:
        name = comp.get("name", "Unnamed Component")
        # Check overlaps
        overlaps = set(comp.get("overlaps_with", []))
        if overlaps.intersection(evaluated_names):
            # If explicit overlap exists, apply 50% discount to redundant portion
            raw_sample = evaluate_component_loss(comp, size=size, rng=rng) * 0.5
        else:
            raw_sample = evaluate_component_loss(comp, size=size, rng=rng)

        breakdown[name] = raw_sample
        total += raw_sample
        evaluated_names.add(name)

    return total, breakdown
