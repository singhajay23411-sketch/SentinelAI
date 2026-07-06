"""
SentinelAI Intelligence Engine 2.0
==================================
Unified Trust & Threat Analysis System for SentinelAI.
Evaluates app data through 9 layers of intelligence to calculate
separated Trust, Threat, and Confidence metrics.
"""

import re
from urllib.parse import urlparse
# pyrefly: ignore [missing-import]
from rapidfuzz import fuzz

import data_loader

class IntelligenceEngine:
    @staticmethod
    def analyze(
        app_name: str = "",
        developer: str = "",
        package_name: str = "",
        website: str = "",
        description: str = "",
        rating: float = 0.0,
        downloads: int = 0,
        category: str = "",
        certificate_present: bool = None,
        dangerous_permission_count: int = 0
    ) -> dict:
        """
        Run the complete intelligence pipeline on the provided application data.
        Returns a dictionary with trust, threat, confidence scores and final status.
        """
        app_name = (app_name or "").strip()
        developer = (developer or "").strip()
        package_name = (package_name or "").strip()
        website = (website or "").strip()
        description = (description or "").strip()
        category = (category or "").strip()

        # ==========================================
        # Layer 1: Brand Recognition
        # ==========================================
        best_match = None
        name_similarity = 0
        if app_name:
            trusted_apps = data_loader.load_trusted_apps()
            for known in trusted_apps:
                score = fuzz.token_set_ratio(app_name.lower(), known.lower())
                if score > name_similarity:
                    name_similarity = score
                    best_match = known
            if name_similarity < 70:
                best_match = None

        matched_app = best_match

        # ==========================================
        # Layer 2: Developer Verification
        # ==========================================
        developer_verified = False
        developer_confidence = 0
        expected_developer = None
        
        if matched_app and developer:
            trusted_devs = data_loader.load_trusted_developers()
            official_devs = trusted_devs.get(matched_app, [])
            if official_devs:
                expected_developer = official_devs[0]
                for official_dev in official_devs:
                    score = fuzz.token_set_ratio(developer.lower(), official_dev.lower())
                    if score > developer_confidence:
                        developer_confidence = score
                        expected_developer = official_dev
                if developer_confidence >= 85:
                    developer_verified = True

        # ==========================================
        # Layer 3: Package Verification
        # ==========================================
        package_verified = False
        expected_package = None
        if matched_app and package_name:
            trusted_pkgs = data_loader.load_trusted_packages()
            official_pkgs = trusted_pkgs.get(matched_app, [])
            if official_pkgs:
                expected_package = official_pkgs[0]
                if package_name in official_pkgs:
                    package_verified = True
                else:
                    # Minor fuzz check just in case, but package names are usually exact
                    for pkg in official_pkgs:
                        if package_name.lower() == pkg.lower():
                            package_verified = True
                            expected_package = pkg
                            break

        # ==========================================
        # Layer 4: Metadata Verification
        # ==========================================
        metadata_verified = False
        metadata_trust_bonus = 0
        if matched_app and (category or downloads > 0 or rating > 0):
            trusted_metadata = data_loader.load_trusted_metadata()
            # Find metadata for matched app
            app_meta = None
            for meta in trusted_metadata:
                if meta.get("app_name") == matched_app:
                    app_meta = meta
                    break
            
            if app_meta:
                # If they provided category and it matches, that's a signal
                cat_match = False
                if category and app_meta.get("category"):
                    cat_match = (category.lower() in app_meta.get("category").lower() or 
                                 app_meta.get("category").lower() in category.lower())
                
                # If they have significant downloads/rating, matches profile
                if cat_match or (downloads >= 1000 and rating >= 3.0):
                    metadata_verified = True
        elif not matched_app and (downloads > 0 or rating > 0):
            # Thorough analysis for apps not in our database
            if downloads >= 500000 and rating >= 4.0:
                metadata_trust_bonus = 50
                metadata_verified = True
            elif downloads >= 50000 and rating >= 3.5:
                metadata_trust_bonus = 30
                metadata_verified = True
            elif downloads >= 10000 and rating >= 3.0:
                metadata_trust_bonus = 15
                metadata_verified = True
            elif downloads >= 1000 and rating >= 3.0:
                metadata_trust_bonus = 5
                metadata_verified = True

        # ==========================================
        # Layer 5: Suspicious Keyword Analysis
        # ==========================================
        matched_keywords = []
        keyword_risk_score = 0
        if description:
            desc_lower = description.lower()
            suspicious_kws = data_loader.load_suspicious_keywords()
            matched_keywords = [kw for kw in suspicious_kws if kw in desc_lower]
            if len(matched_keywords) >= 3:
                keyword_risk_score = 90
            elif len(matched_keywords) >= 2:
                keyword_risk_score = 70
            elif len(matched_keywords) == 1:
                keyword_risk_score = 40

        # ==========================================
        # Layer 6: Domain Intelligence
        # ==========================================
        domain_verified = False
        domain_risk = 0
        domain_reason = None
        if website:
            try:
                parsed = urlparse(website if "://" in website else "http://" + website)
                domain = parsed.netloc.lower()
                if domain.startswith("www."):
                    domain = domain[4:]
                    
                trusted_domains = data_loader.load_trusted_domains()
                suspicious_terms = data_loader.load_suspicious_domain_terms()
                
                if domain in trusted_domains:
                    domain_verified = True
                else:
                    for trusted in trusted_domains:
                        name_part = trusted.split('.')[0]
                        if name_part in domain and domain != trusted:
                            has_suspicious_term = any(term in domain for term in suspicious_terms)
                            if has_suspicious_term:
                                domain_risk = 80
                                domain_reason = f"Website domain resembles trusted platform ({trusted}) and contains suspicious terms."
                            else:
                                domain_risk = 50
                                domain_reason = f"Website domain resembles a trusted financial platform ({trusted})."
            except Exception:
                pass

        # ==========================================
        # Layer 7: Trust Score (0-100)
        # ==========================================
        trust_score = 0
        if developer_verified:
            trust_score += 35
        if package_verified:
            trust_score += 35
        if domain_verified:
            trust_score += 20
        if metadata_verified:
            trust_score += 10
        if metadata_trust_bonus > 0:
            trust_score += metadata_trust_bonus
            
        # Certificate trust boost (APK scans)
        if certificate_present is True:
            trust_score += 10
            
        # New Risk Reduction Logic: Large Trust Boost
        if developer_verified and package_verified:
            trust_score += 30
            
        # Give some base trust if it doesn't match anything and has no red flags
        if trust_score == 0 and not matched_app and keyword_risk_score == 0 and domain_risk == 0:
            trust_score = 30 # Unknown, neutral apps

        trust_score = min(100, max(0, trust_score))

        # ==========================================
        # Layer 8: Threat Score (0-100)
        # ==========================================
        threat_score = 0
        
        # Brand Match + Developer Mismatch = High Threat (Impersonation)
        if matched_app and developer and not developer_verified:
            threat_score += 40
            
        # Brand Match + Package Mismatch = High Threat (Impersonation)
        if matched_app and package_name and not package_verified:
            threat_score += 30
            
        threat_score += (keyword_risk_score * 0.4)
        threat_score += (domain_risk * 0.4)
        
        if not matched_app and keyword_risk_score > 0:
            # Only apply generic threat penalty if we didn't establish high metadata trust
            if metadata_trust_bonus < 30:
                threat_score += 20 # Fake financial claims from unknown app

        # Missing certificate increases threat (APK scans)
        if certificate_present is False:
            threat_score += 15
            
        # Excessive dangerous permissions — supporting evidence only
        if dangerous_permission_count >= 5:
            threat_score += 10

        # Reduce threat significantly if both verified
        if developer_verified and package_verified:
            threat_score = max(0, threat_score - 50)
            
        # Reduce threat for highly downloaded/rated apps even if not in DB
        if not matched_app and metadata_trust_bonus >= 30:
            threat_score = max(0, threat_score - (metadata_trust_bonus / 2))

        threat_score = min(100, max(0, int(threat_score)))

        # ==========================================
        # Layer 9: Confidence Score (0-100)
        # ==========================================
        confidence_score = 0
        evidence_points = 0
        
        if developer: evidence_points += 20
        if package_name: evidence_points += 20
        if website: evidence_points += 20
        if description: evidence_points += 20
        if category or downloads: evidence_points += 20
        
        confidence_score += evidence_points
        
        # Add bonuses for exact matches
        if developer_verified: confidence_score += 10
        if package_verified: confidence_score += 10
        if domain_verified: confidence_score += 10
        
        # Certificate data provides additional evidence (APK scans)
        if certificate_present is not None:
            confidence_score += 10
        
        confidence_score = min(100, confidence_score)

        # ==========================================
        # Final Classification Engine
        # ==========================================
        status = "Unknown"
        if trust_score > 80 and threat_score < 20:
            status = "Official Verified Application"
        elif trust_score > 70 and threat_score < 30:
            status = "Trusted Application"
        elif threat_score > 80 and trust_score < 20:
            status = "High Risk Fraud"
        elif threat_score > 60 and trust_score < 40:
            status = "Suspicious"
        elif matched_app and threat_score > 50:
            status = "Potential Impersonation"
        elif 40 <= trust_score <= 70 and 30 <= threat_score <= 60:
            status = "Needs Review"
        else:
            if threat_score > trust_score:
                status = "Suspicious"
            else:
                status = "Likely Legitimate"

        # Prepare reasoning
        issues = []
        trust_signals = []
        
        if matched_app:
            trust_signals.append(f"App name matches known brand: {matched_app}")
        if developer_verified:
            trust_signals.append("Developer is officially verified")
        elif matched_app and developer:
            issues.append(f"Developer mismatch! Expected: {expected_developer}")
            
        if package_verified:
            trust_signals.append("Package name is officially verified")
        elif matched_app and package_name:
            issues.append(f"Package mismatch! Expected: {expected_package}")
            
        if domain_verified:
            trust_signals.append("Domain is verified and trusted")
        elif domain_reason:
            issues.append(domain_reason)
            
        if not matched_app and metadata_trust_bonus >= 15:
            trust_signals.append(f"Strong app metadata: {downloads}+ downloads and {rating} rating")
            
        if certificate_present is True:
            trust_signals.append("Signing certificate present")
        elif certificate_present is False:
            issues.append("Missing or invalid signing certificate")
            
        if matched_keywords:
            issues.append(f"Suspicious claims detected: {', '.join(matched_keywords[:3])}")

        # Resolve matched category from trusted metadata
        matched_category = ""
        if matched_app:
            trusted_metadata = data_loader.load_trusted_metadata()
            for meta in trusted_metadata:
                if meta.get("app_name") == matched_app:
                    matched_category = meta.get("category", "")
                    break

        return {
            "success": True,
            "trust_score": trust_score,
            "threat_score": threat_score,
            "confidence_score": confidence_score,
            "status": status,
            "matched_app": matched_app,
            "matched_category": matched_category,
            "developer_verified": developer_verified,
            "package_verified": package_verified,
            "matched_keywords": matched_keywords,
            "issues": issues,
            "trust_signals": trust_signals,
            "app_name": app_name
        }
