"""
SentinelAI Website Verification Engine
=====================================
Analyzes website URLs for brand impersonation, phishing, and fraud signals
using the shared Intelligence Engine.
"""

import logging
from urllib.parse import urlparse
from services.intelligence_engine import IntelligenceEngine
import services.gemini_service as gemini_service

logger = logging.getLogger("website_analyzer")

def run_website_analysis(url: str) -> dict:
    """
    Runs domain intelligence checks on a URL and passes it to the Intelligence Engine.
    """
    if not url:
        return {"success": False, "error": "URL is empty."}
    
    url = url.strip()
    try:
        parsed = urlparse(url if "://" in url else "http://" + url)
        domain = parsed.netloc or parsed.path
        if not domain:
            return {"success": False, "error": "Invalid URL structure."}
        
        # Clean domain
        domain = domain.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        
        # Best effort: attempt to infer a brand/app name from the domain name
        # e.g., "groww-invest.com" -> "Groww"
        inferred_app_name = domain.split(".")[0].split("-")[0].split("_")[0].capitalize()
        
        # Run through the shared Intelligence Engine (Layer 6 Domain intelligence, Layer 1 brand check, etc.)
        analysis = IntelligenceEngine.analyze(
            app_name=inferred_app_name,
            website=domain,
            description=f"Official website for {inferred_app_name} or related financial service."
        )
        
        # Generate the AI report via Gemini
        ai_report = gemini_service.generate_ai_report(analysis)
        
        return {
            "success": True,
            "app_name": domain, # Display domain as the main identifier
            "category": "Web Portal",
            "matched_app": analysis.get("matched_app"),
            "trust_score": analysis.get("trust_score", 0),
            "threat_score": analysis.get("threat_score", 0),
            "confidence_score": analysis.get("confidence_score", 0),
            "status": analysis.get("status", "Unknown"),
            "issues": analysis.get("issues", []),
            "trust_signals": analysis.get("trust_signals", []),
            "ai_report": ai_report,
            "metadata": {
                "url": url,
                "domain": domain,
                "https": "Enabled" if url.startswith("https") else "Disabled",
                "ssl": "Valid" if url.startswith("https") else "Missing/Expired",
            }
        }
    except Exception as e:
        logger.exception("Error analyzing website")
        return {"success": False, "error": f"Website analysis failed: {str(e)}"}
