"""
SentinelAI Enterprise - Common Random Numbers (CRN)
Implements variance reduction via synchronized random streams.
Ensures baseline and counterfactual runs use identical stochastic samples
to isolate the true causal effect of security mitigations.
"""

from typing import Tuple
import numpy as np


class SynchronizedRNG:
    """Provides twin generators initialized with the exact same seed."""

    def __init__(self, seed: int = 42):
        self.seed = seed

    def get_generators(self) -> Tuple[np.random.Generator, np.random.Generator]:
        """Returns (baseline_rng, counterfactual_rng) with identical seeds."""
        return np.random.default_rng(self.seed), np.random.default_rng(self.seed)
