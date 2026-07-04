"""
Description Analysis Module for SentinelAI.
Detects potential fraud by searching for suspicious investment claims and keywords
within the application description.
"""

import os
import json

# Setup dynamic path to datasets directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "scam_keywords.json")

# Default fallback list of suspicious keywords
DEFAULT_SUSPICIOUS_KEYWORDS = [
    "guaranteed returns",
    "100% profit",
    "double your money",
    "instant income",
    "risk free",
    "quick money",
    "daily profit",
    "fixed returns",
    "earn lakhs",
    "unlimited income",
    "get rich",
    "investment scheme",
    "assured profit"
]

try:
    if os.path.exists(DATASET_PATH):
        with open(DATASET_PATH, "r", encoding="utf-8") as f:
            SUSPICIOUS_KEYWORDS = json.load(f)
    else:
        SUSPICIOUS_KEYWORDS = DEFAULT_SUSPICIOUS_KEYWORDS
except Exception:
    SUSPICIOUS_KEYWORDS = DEFAULT_SUSPICIOUS_KEYWORDS


def analyze_description(description: str) -> dict:
    """
    Analyzes the description of an application for suspicious financial keywords.
    
    Args:
        description (str): The app description to analyze.
        
    Returns:
        dict: Analysis results containing risk score, list of matched keywords, and a reason.
    """
    if not description or not description.strip():
        return {
            "risk_score": 0,
            "matched_keywords": [],
            "reason": "No description provided"
        }

    # Convert text to lowercase
    description_lower = description.lower()
    
    # Store matched keywords
    matched_keywords = []
    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in description_lower:
            matched_keywords.append(keyword)
            
    match_count = len(matched_keywords)
    
    # Risk Rules:
    # 0 matches -> risk 0
    # 1 match -> risk 25
    # 2 matches -> risk 50
    # 3 matches -> risk 75
    # 4+ matches -> risk 90
    if match_count == 0:
        risk_score = 0
        reason = "No suspicious investment claims detected"
    elif match_count == 1:
        risk_score = 25
        reason = "Single suspicious investment claim detected"
    elif match_count == 2:
        risk_score = 50
        reason = "Multiple suspicious investment claims detected"
    elif match_count == 3:
        risk_score = 75
        reason = "Multiple suspicious investment claims detected"
    else:
        risk_score = 90
        reason = "Highly suspicious investment claims detected"
        
    return {
        "risk_score": risk_score,
        "matched_keywords": matched_keywords,
        "reason": reason
    }
