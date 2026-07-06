"""
SentinelAI Manual Verification Engine
===================================
Provides utility functions for manual app analysis using data-driven intelligence:
- Name similarity against trusted brands
- Description fraud-keyword detection
- Developer matching
- Website domain similarity check
- APK Link analysis
- Final risk engine and reporting
"""

import re
from urllib.parse import urlparse
# pyrefly: ignore [missing-import]
from rapidfuzz import fuzz

import data_loader
import services.gemini_service as gemini_service

# Step 1: Name Similarity
def analyze_name_similarity(app_name: str) -> dict:
    if not app_name:
        return {"matched_app": None, "similarity_score": 0, "risk": 0}

    best_match = None
    best_score = 0
    legitimate_apps = data_loader.load_legitimate_apps()

    for known in legitimate_apps:
        score = fuzz.token_set_ratio(app_name.lower(), known.lower())
        if score > best_score:
            best_score = score
            best_match = known

    if best_score >= 90:
        risk = 90
    elif best_score >= 80:
        risk = 85
    elif best_score >= 70:
        risk = 75
    else:
        risk = 10

    return {
        "matched_app": best_match if best_score >= 70 else None,
        "similarity_score": round(best_score),
        "risk": risk
    }

# Step 2: Description Analysis
def analyze_description(description: str) -> dict:
    if not description:
        return {"matched_keywords": [], "risk": 0}
        
    desc_lower = description.lower()
    suspicious_keywords = data_loader.load_suspicious_keywords()
    
    matches = [kw for kw in suspicious_keywords if kw in desc_lower]
    
    if len(matches) >= 3:
        risk = 90
    elif len(matches) >= 2:
        risk = 70
    elif len(matches) == 1:
        risk = 40
    else:
        risk = 0
        
    return {"matched_keywords": matches, "risk": risk}

# Step 3: Developer Analysis
def analyze_developer(matched_app: str, developer: str) -> dict:
    if not matched_app or not developer:
        return {"developer_verified": False, "risk": 0, "expected_developer": None, "dev_similarity": 0}
        
    trusted_devs = data_loader.load_trusted_developers()
    official_dev = trusted_devs.get(matched_app)
    
    if not official_dev:
        return {"developer_verified": False, "risk": 0, "expected_developer": None, "dev_similarity": 0}
        
    dev_similarity = fuzz.token_set_ratio(developer.lower(), official_dev.lower())
    
    if dev_similarity >= 85:
        return {"developer_verified": True, "risk": 0, "expected_developer": official_dev, "dev_similarity": dev_similarity}
    else:
        return {"developer_verified": False, "risk": 80, "expected_developer": official_dev, "dev_similarity": dev_similarity}

# Step 4: Website Analysis
def analyze_website(website: str) -> dict:
    if not website:
        return {"website_risk": 0, "website_reason": None}
        
    try:
        parsed_url = urlparse(website if "://" in website else "http://" + website)
        domain = parsed_url.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
            
        trusted_domains = data_loader.load_trusted_domains()
        suspicious_terms = data_loader.load_suspicious_domain_terms()
        
        # Check if domain matches perfectly
        if domain in trusted_domains:
            return {"website_risk": 0, "website_reason": None}
            
        # Check domain similarity
        for trusted in trusted_domains:
            name_part = trusted.split('.')[0]
            if name_part in domain and domain != trusted:
                has_suspicious_term = any(term in domain for term in suspicious_terms)
                if has_suspicious_term:
                    return {
                        "website_risk": 80,
                        "website_reason": f"Website domain resembles trusted platform ({trusted}) and contains suspicious terms"
                    }
                return {
                    "website_risk": 50,
                    "website_reason": f"Website domain resembles a trusted financial platform ({trusted})"
                }
                
    except Exception:
        pass
        
    return {"website_risk": 0, "website_reason": None}

# Step 5: APK Link Analysis
def analyze_apk_link(apk_link: str) -> dict:
    if not apk_link:
        return {"apk_link_risk": 0}
        
    if ".apk" in apk_link.lower():
        try:
            parsed_url = urlparse(apk_link if "://" in apk_link else "http://" + apk_link)
            domain = parsed_url.netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]
                
            trusted_domains = data_loader.load_trusted_domains()
            if domain not in trusted_domains:
                return {"apk_link_risk": 25}
        except Exception:
            return {"apk_link_risk": 25}
            
    return {"apk_link_risk": 0}

# Step 6: Risk Engine & Threat Levels
def calculate_final_risk(name_risk, description_risk, developer_risk, website_risk, apk_link_risk):
    final_risk = (
        name_risk * 0.40 +
        description_risk * 0.25 +
        developer_risk * 0.20 +
        website_risk * 0.10 +
        apk_link_risk * 0.05
    )
    score = min(100, max(0, round(final_risk)))
    
    if score <= 30:
        threat_level = "Safe"
    elif score <= 60:
        threat_level = "Suspicious"
    else:
        threat_level = "High Risk"
        
    return score, threat_level

# Step 8: Confidence Score
def calculate_confidence(indicators_count, similarity_score, keyword_count):
    confidence = 70
    if similarity_score >= 80:
        confidence += 10
    elif similarity_score >= 60:
        confidence += 5
        
    confidence += (keyword_count * 5)
    confidence += (indicators_count * 5)
    
    return min(100, confidence)

# Orchestrator
def run_manual_analysis(data: dict) -> dict:
    app_name = data.get("app_name", "").strip()
    description = data.get("description", "").strip()
    developer = data.get("developer", "").strip()
    website = data.get("website", "").strip()
    apk_link = data.get("apk_link", "").strip()
    
    name_res = analyze_name_similarity(app_name)
    desc_res = analyze_description(description)
    dev_res = analyze_developer(name_res["matched_app"], developer)
    web_res = analyze_website(website)
    apk_res = analyze_apk_link(apk_link)
    
    name_risk = name_res["risk"]
    # If the developer is verified, this is the official app. Name similarity is expected, not a risk.
    if dev_res["developer_verified"]:
        name_risk = 0
    # Add a base risk if the app is completely unknown and no developer is provided
    elif not name_res["matched_app"] and not developer:
        name_risk = max(name_risk, 20)

    risk_score, threat_level = calculate_final_risk(
        name_risk,
        desc_res["risk"],
        dev_res["risk"],
        web_res["website_risk"],
        apk_res["apk_link_risk"]
    )
    
    reasons = []
    indicators = 0
    if name_res["risk"] >= 75:
        app = name_res["matched_app"]
        reasons.append(f"Application name is {name_res['similarity_score']}% similar to {app}")
        indicators += 1
    
    if desc_res["matched_keywords"]:
        # Only show the first few to avoid a massive list
        kw_str = ", ".join(desc_res["matched_keywords"][:3])
        if len(desc_res["matched_keywords"]) > 3:
            kw_str += f" and {len(desc_res['matched_keywords']) - 3} more"
        reasons.append(f"Detected suspicious phrase(s): {kw_str}")
        indicators += 1
        
    if name_res["matched_app"] and not dev_res["developer_verified"] and developer:
        if dev_res["expected_developer"]:
            reasons.append(f"Developer does not match {dev_res['expected_developer']}")
        else:
            reasons.append("Developer does not match the official developer")
        indicators += 1
        
    if web_res["website_reason"]:
        reasons.append(web_res["website_reason"])
        indicators += 1
        
    if apk_res["apk_link_risk"] > 0:
        reasons.append("Suspicious external APK download link provided")
        indicators += 1
        
    if not reasons:
        reasons.append("No significant fraud indicators detected.")
        
    confidence = calculate_confidence(indicators, name_res["similarity_score"], len(desc_res["matched_keywords"]))
    
    result = {
        "success": True,
        "risk_score": risk_score,
        "threat_level": threat_level,
        "confidence": confidence,
        "matched_app": name_res["matched_app"] or "None",
        "matched_keywords": desc_res["matched_keywords"],
        "developer_verified": dev_res["developer_verified"] if developer else False,
        "reasons": reasons,
        "app_name": app_name
    }
    
    result["ai_report"] = gemini_service.generate_ai_report(result)
    return result
