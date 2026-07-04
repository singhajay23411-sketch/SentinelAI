"""
Name Similarity Detection Module for SentinelAI.
Detects whether an app name is highly similar to known trusted investment apps,
suggesting possible impersonation or brand spoofing.
"""

# pyrefly: ignore [missing-import]
from rapidfuzz import fuzz

import os
import json

# Setup dynamic path to datasets directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "legitimate_apps.json")

# Default fallback list of known apps
DEFAULT_KNOWN_APPS = [
    "Groww",
    "Zerodha",
    "Upstox",
    "Angel One",
    "Paytm Money",
    "ICICI Direct",
    "HDFC Securities",
    "Kotak Securities"
]

try:
    if os.path.exists(DATASET_PATH):
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            KNOWN_APPS = json.load(f)
    else:
        KNOWN_APPS = DEFAULT_KNOWN_APPS
except Exception:
    KNOWN_APPS = DEFAULT_KNOWN_APPS


def analyze_app_name(app_name: str) -> dict:
    """
    Analyzes an application name against a list of trusted apps using RapidFuzz.
    
    Args:
        app_name (str): The name of the application to analyze.
        
    Returns:
        dict: Analysis results containing matched app, similarity score, risk score, and reason.
    """
    if not app_name or not app_name.strip():
        return {
            "matched_app": None,
            "similarity_score": 0,
            "risk_score": 10,
            "reason": "Empty or invalid app name provided"
        }

    # Normalize whitespace
    cleaned_name = " ".join(app_name.strip().split())
    
    best_match = None
    best_score = 0.0
    
    for known in KNOWN_APPS:
        # Using WRatio (Weighted Ratio) which is highly effective for handling
        # case differences, substring matches (e.g. "Groww Wealth Pro" matching "Groww"),
        # and minor typos/spelling variations.
        score = fuzz.WRatio(cleaned_name, known)
        if score > best_score:
            best_score = score
            best_match = known
            
    similarity_score = int(round(best_score))
    
    # Apply Risk Rules:
    # 90+ similarity -> risk 90
    # 80-89 -> risk 70
    # 70-79 -> risk 50
    # below 70 -> risk 10
    if similarity_score >= 90:
        risk_score = 90
        reason = f"App name is highly similar to {best_match}"
    elif similarity_score >= 80:
        risk_score = 70
        reason = f"App name is similar to {best_match}"
    elif similarity_score >= 70:
        risk_score = 50
        reason = f"App name has some resemblance to {best_match}"
    else:
        risk_score = 10
        reason = "App name does not impersonate any known trusted app"
        
    return {
        "matched_app": best_match,
        "similarity_score": similarity_score,
        "risk_score": risk_score,
        "reason": reason
    }
