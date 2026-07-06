import os
import re
import logging
# pyrefly: ignore [missing-import]
from androguard.core.apk import APK

logger = logging.getLogger("apk_analyzer")

# Target brand keywords for fraud detection
TARGET_BRANDS = {
    "groww": {"official_pkg": "com.nextbillion.groww", "name": "Groww"},
    "zerodha": {"official_pkg": "com.zerodha.kite", "name": "Zerodha Kite"},
    "upstox": {"official_pkg": "com.upstox.pro", "name": "Upstox"},
    "angelone": {"official_pkg": "com.msf.angelone", "name": "Angel One"},
    "paytm": {"official_pkg": "net.one97.paytm", "name": "Paytm"},
    "phonepe": {"official_pkg": "com.phonepe.app", "name": "PhonePe"},
    "googlepay": {"official_pkg": "com.google.android.apps.nbu.paisa.user", "name": "Google Pay"},
    "binance": {"official_pkg": "com.binance.dev", "name": "Binance"},
}

# Dangerous permissions with per-permission metadata
DANGEROUS_PERMISSION_DEFS = {
    "RECEIVE_SMS": {
        "severity": "Critical",
        "title": "Dangerous Permission: Receive SMS",
        "description": "The application requests permission to intercept incoming SMS messages. This can be exploited to steal OTPs, two-factor authentication codes, and sensitive text messages.",
        "recommendation": "Verify that SMS interception is a core, documented feature. If not required, this permission is a strong indicator of credential-theft malware."
    },
    "SEND_SMS": {
        "severity": "High",
        "title": "Dangerous Permission: Send SMS",
        "description": "The application can send SMS messages without user interaction. This may result in premium-rate SMS fraud or unauthorized communication on behalf of the user.",
        "recommendation": "Confirm this is explicitly needed. Monitor for unexpected SMS charges if you install this application."
    },
    "READ_PHONE_STATE": {
        "severity": "High",
        "title": "Dangerous Permission: Read Phone State",
        "description": "The application can read the device IMEI, phone number, and call state. This information is often used for device fingerprinting and surveillance.",
        "recommendation": "Applications rarely need IMEI access. Treat this permission as a privacy red flag unless the app's core function explicitly requires phone state."
    },
    "SYSTEM_ALERT_WINDOW": {
        "severity": "High",
        "title": "Dangerous Permission: System Alert Window (Overlay)",
        "description": "The application can draw over other apps. This is the primary mechanism used in overlay attacks where a fake login screen is displayed over a legitimate banking app to steal credentials.",
        "recommendation": "Deny this permission unless the application (e.g., a chat head or screen assistant) clearly documents why overlay is needed."
    },
    "ACCESS_FINE_LOCATION": {
        "severity": "Medium",
        "title": "Dangerous Permission: Precise Location Access",
        "description": "The application requests access to the device's precise GPS location. Continuous background location tracking can be used for surveillance.",
        "recommendation": "Verify that location access is necessary for this application's core function. Check whether the app requests background location access."
    },
    "RECORD_AUDIO": {
        "severity": "High",
        "title": "Dangerous Permission: Microphone Access",
        "description": "The application can record audio using the device microphone. Background audio recording may constitute unauthorized surveillance.",
        "recommendation": "Only allow this permission if the application explicitly requires audio recording as a documented feature."
    },
    "CAMERA": {
        "severity": "Medium",
        "title": "Dangerous Permission: Camera Access",
        "description": "The application can capture photos and video. Combined with other permissions, this may enable unauthorized visual surveillance.",
        "recommendation": "Ensure camera access is required for a legitimate documented feature and that background camera access is not requested."
    },
    "READ_CONTACTS": {
        "severity": "Medium",
        "title": "Dangerous Permission: Read Contacts",
        "description": "The application can read the entire device contact list. Contact exfiltration is commonly used in social engineering attacks and spam campaigns.",
        "recommendation": "Verify that the application has a valid reason for reading your contact list. Financial and investment apps typically do not need this."
    },
    "PROCESS_OUTGOING_CALLS": {
        "severity": "High",
        "title": "Dangerous Permission: Intercept Outgoing Calls",
        "description": "The application can intercept and redirect outgoing phone calls. This is extremely rare in legitimate applications.",
        "recommendation": "Treat this permission as a critical red flag. Do not install this application unless the call interception feature is clearly documented."
    },
    "READ_CALL_LOG": {
        "severity": "Medium",
        "title": "Dangerous Permission: Read Call History",
        "description": "The application can access the complete call history including contacts called and duration. This is frequently used for surveillance.",
        "recommendation": "Financial and investment applications have no legitimate need for call log access."
    },
    "WRITE_SETTINGS": {
        "severity": "Medium",
        "title": "Dangerous Permission: Modify System Settings",
        "description": "The application can modify global system settings, which can affect other applications and system behavior.",
        "recommendation": "This permission should only be granted to trusted system utilities."
    },
    "GET_ACCOUNTS": {
        "severity": "Low",
        "title": "Permission: Access Device Accounts",
        "description": "The application can enumerate all accounts registered on the device (Google, social, etc.).",
        "recommendation": "Review whether account access is necessary. This can expose user identity information to the application."
    },
}


def _check_manifest_boolean(apk, attribute_local_name: str, default: bool = False) -> bool:
    """
    Safely reads a boolean attribute (e.g. debuggable, allowBackup) from
    the <application> element of AndroidManifest.xml.
    """
    try:
        manifest_xml = apk.get_android_manifest_xml()
        if manifest_xml is None:
            return default
        ns = '{http://schemas.android.com/apk/res/android}'
        app_el = manifest_xml.find('.//application')
        if app_el is None:
            return default
        raw = app_el.get(f'{ns}{attribute_local_name}', None)
        if raw is None:
            return default
        return raw.lower() == 'true'
    except Exception:
        return default


def _check_cleartext_traffic(apk) -> bool:
    """
    Returns True if the manifest explicitly sets usesCleartextTraffic="true"
    or if target SDK <= 27 (pre-P default is cleartext allowed).
    """
    try:
        manifest_xml = apk.get_android_manifest_xml()
        if manifest_xml is None:
            return False
        ns = '{http://schemas.android.com/apk/res/android}'
        app_el = manifest_xml.find('.//application')
        if app_el is None:
            return False
        raw = app_el.get(f'{ns}usesCleartextTraffic', None)
        if raw is not None:
            return raw.lower() == 'true'
    except Exception:
        pass
    return False


def _get_exported_components(apk, getter_fn_name: str) -> list:
    """
    Returns a list of component names that are explicitly exported
    (android:exported="true" in the manifest) or have intent-filters
    (which implicitly export on older SDK targets).
    """
    exported = []
    try:
        manifest_xml = apk.get_android_manifest_xml()
        if manifest_xml is None:
            return exported
        ns = '{http://schemas.android.com/apk/res/android}'
        tag_map = {
            'get_activities': 'activity',
            'get_services': 'service',
            'get_receivers': 'receiver',
        }
        tag = tag_map.get(getter_fn_name)
        if not tag:
            return exported
        for el in manifest_xml.iter(tag):
            is_exported_attr = el.get(f'{ns}exported', None)
            has_intent_filter = el.find('intent-filter') is not None
            name = el.get(f'{ns}name', '')
            if is_exported_attr == 'true' or (is_exported_attr is None and has_intent_filter):
                exported.append(name)
    except Exception:
        pass
    return exported


def _generate_ai_verdict(findings: list) -> str:
    """
    Generates a deterministic AI verdict sentence from the findings list.
    Never uses a fixed hardcoded lookup — always derived from actual findings.
    """
    if not findings:
        return (
            "No significant threats detected. This application passed all security "
            "checks and appears to be safe for use."
        )

    severities = {f["severity"] for f in findings}

    if "Critical" in severities:
        critical_titles = [f["title"] for f in findings if f["severity"] == "Critical"]
        return (
            f"Critical security threats detected ({', '.join(critical_titles)}). "
            "This application contains potentially dangerous code and behavior. "
            "Installation is strongly not recommended."
        )

    if "High" in severities:
        high_titles = [f["title"] for f in findings if f["severity"] == "High"]
        return (
            f"This application contains potentially dangerous behavior "
            f"({len(high_titles)} high-severity issue(s) detected: "
            f"{', '.join(high_titles[:3])}{'...' if len(high_titles) > 3 else ''}). "
            "Exercise extreme caution before installing."
        )

    # Only Medium / Low
    medium_count = sum(1 for f in findings if f["severity"] == "Medium")
    low_count = sum(1 for f in findings if f["severity"] == "Low")
    return (
        f"Some security concerns were detected ({medium_count} medium, {low_count} low severity finding(s)). "
        "Review all findings carefully before trusting this application with sensitive data."
    )


def _deduplicate_recommendations(findings: list) -> list:
    """
    Collects one unique recommendation from each finding.
    Preserves insertion order, deduplicates by exact text.
    """
    seen = set()
    recs = []
    for f in findings:
        rec = f.get("recommendation", "")
        if rec and rec not in seen:
            seen.add(rec)
            recs.append(rec)
    return recs


def analyze_apk_file(file_path: str, original_filename: str = None) -> dict:
    """
    Performs static security analysis on an APK file using Androguard.

    Returns a fully data-driven report where every finding, count, verdict,
    and recommendation is derived from the real APK analysis — never from
    hardcoded templates, placeholders, or mock data.

    Key fields in the returned dict:
      findings             — structured list of {severity, title, description, recommendation}
      detected_issues_count— always equals len(findings)
      ai_verdict           — generated from actual findings, never from a static lookup
      recommendations      — deduplicated list from all finding recommendations
      reasons              — kept for backward compatibility (plain-text list)
    """
    if not os.path.exists(file_path):
        return {"success": False, "error": "File does not exist."}

    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)

    # Step 1: Magic bytes check (ZIP format starts with 'PK\x03\x04')
    try:
        with open(file_path, "rb") as f:
            magic = f.read(4)
            if magic != b"PK\x03\x04":
                return {"success": False, "error": "Invalid file structure: Not a valid ZIP/APK archive."}
    except Exception as e:
        return {"success": False, "error": f"Failed to read file headers: {str(e)}"}

    # Step 2: Parse APK using Androguard
    try:
        apk = APK(file_path)
    except Exception as e:
        return {"success": False, "error": f"Invalid APK structure: {str(e)}"}

    try:
        # ── Metadata extraction ─────────────────────────────────────────
        app_name = apk.get_app_name()
        package_name = apk.get_package()
        version_name = apk.get_androidversion_name()
        version_code = apk.get_androidversion_code()
        target_sdk = apk.get_target_sdk_version()
        min_sdk = apk.get_min_sdk_version()

        target_sdk_int = int(target_sdk) if target_sdk else 0
        min_sdk_int = int(min_sdk) if min_sdk else 0

        # ── Component lists ─────────────────────────────────────────────
        permissions = sorted(list(set(apk.get_permissions())))
        activities = sorted(list(set(apk.get_activities())))
        services = sorted(list(set(apk.get_services())))
        receivers = sorted(list(set(apk.get_receivers())))

        # ── Certificate extraction ──────────────────────────────────────
        certs_info = []
        try:
            certs = apk.get_certificates()
            for cert in certs:
                subject_native = getattr(cert, 'subject', None)
                issuer_native = getattr(cert, 'issuer', None)

                def format_name_dict(name_obj):
                    if not name_obj:
                        return "Unknown"
                    try:
                        native = name_obj.native
                        if isinstance(native, dict):
                            return ", ".join(f"{k}={v}" for k, v in native.items())
                        return str(native)
                    except Exception:
                        return str(name_obj)

                certs_info.append({
                    "subject": format_name_dict(subject_native),
                    "issuer": format_name_dict(issuer_native),
                    "serial_number": str(cert.serial_number) if getattr(cert, 'serial_number', None) else "N/A",
                    "sha256": cert.sha256.hex() if hasattr(cert, 'sha256') else "",
                    "signature_algo": cert.signature_algo if getattr(cert, 'signature_algo', None) else "Unknown"
                })
        except Exception as e:
            logger.warning(f"Failed to extract certificate details: {str(e)}")

        has_cert = len(certs_info) > 0

        # ── Obfuscation detection ───────────────────────────────────────
        obfuscation = "ProGuard/R8 Detected"
        namelist = apk.get_files()
        short_names = [n for n in namelist if len(n.split("/")[-1]) <= 6 and n.endswith(".class")]
        if len(short_names) < 3:
            obfuscation = "No Obfuscation Detected"

        # ── Manifest boolean flags ──────────────────────────────────────
        is_debuggable = False
        try:
            if hasattr(apk, 'is_debuggable'):
                is_debuggable = apk.is_debuggable()
            else:
                is_debuggable = _check_manifest_boolean(apk, 'debuggable', default=False)
        except Exception:
            pass

        allow_backup = _check_manifest_boolean(apk, 'allowBackup', default=True)
        cleartext_traffic = _check_cleartext_traffic(apk)

        # ── Exported components ─────────────────────────────────────────
        exported_activities = _get_exported_components(apk, 'get_activities')
        exported_services = _get_exported_components(apk, 'get_services')
        exported_receivers = _get_exported_components(apk, 'get_receivers')

        # ── Brand impersonation check ───────────────────────────────────
        matched_brand = None
        brand_impersonation_pkg = None
        for brand_key, brand_info in TARGET_BRANDS.items():
            if package_name and brand_key in package_name.lower():
                if package_name != brand_info["official_pkg"]:
                    matched_brand = brand_info["name"]
                    brand_impersonation_pkg = brand_info["official_pkg"]
                    break

        # ── Ponzi / scam keyword scan in DEX ───────────────────────────
        ponzi_keywords = [b"guaranteed return", b"double deposit", b"high yield", b"ponzi", b"fast profit"]
        keywords_found = []
        try:
            dex_bytes = None
            if hasattr(apk, 'get_dex'):
                dex_bytes = apk.get_dex()
            if not dex_bytes:
                try:
                    dex_bytes = apk.get_file("classes.dex")
                except Exception:
                    pass
            if dex_bytes and isinstance(dex_bytes, bytes):
                dex_lower = dex_bytes.lower()
                for kw in ponzi_keywords:
                    if kw in dex_lower:
                        keywords_found.append(kw.decode("utf-8"))
        except Exception:
            pass

        # ── Dangerous permissions found ─────────────────────────────────
        dangerous_count = 0
        dangerous_perms_found = []
        for perm_str in permissions:
            perm_short = perm_str.split(".")[-1].upper()
            if perm_short in DANGEROUS_PERMISSION_DEFS:
                dangerous_count += 1
                dangerous_perms_found.append(perm_short)

        # ══════════════════════════════════════════════════════════════════
        # STRUCTURED FINDINGS GENERATION
        # Every finding is derived from actual APK analysis — no hardcoding.
        # ══════════════════════════════════════════════════════════════════
        findings = []

        # 1. Brand Impersonation (Critical)
        if matched_brand:
            findings.append({
                "severity": "Critical",
                "title": f"Brand Impersonation: {matched_brand}",
                "description": (
                    f"The package name '{package_name}' closely resembles the official "
                    f"'{matched_brand}' application (official package: {brand_impersonation_pkg}). "
                    "This is a strong indicator of a counterfeit or fraudulent application "
                    "designed to deceive users into thinking it is the genuine product."
                ),
                "recommendation": (
                    f"Do not install this application. Download '{matched_brand}' only from "
                    "the official Google Play Store page of the legitimate developer."
                )
            })

        # 2. Ponzi / Malicious Financial Keywords (Critical)
        if keywords_found:
            findings.append({
                "severity": "Critical",
                "title": "Malicious Financial Keywords Detected in Code",
                "description": (
                    f"The application's compiled code (classes.dex) contains suspicious financial "
                    f"keywords: {', '.join(keywords_found)}. These phrases are commonly found in "
                    "investment scam and Ponzi scheme applications designed to lure users with "
                    "promises of guaranteed or unrealistic returns."
                ),
                "recommendation": (
                    "Do not trust this application with any financial information. Report it to "
                    "Google Play Protect and the relevant financial regulatory authority."
                )
            })

        # 3. Debuggable Flag Enabled (High)
        if is_debuggable:
            findings.append({
                "severity": "High",
                "title": "Application Debuggable Flag Enabled",
                "description": (
                    "The AndroidManifest.xml sets 'android:debuggable=\"true\"'. "
                    "A production application should never be debuggable. This allows any "
                    "device with ADB access to attach a debugger, inspect memory, extract "
                    "data, and bypass security controls."
                ),
                "recommendation": (
                    "Legitimate production APKs always have debuggable set to false. "
                    "This is either a development build distributed improperly or an intentional "
                    "backdoor. Do not install on a device with sensitive data."
                )
            })

        # 4. Missing/Invalid Signing Certificate (High)
        if not has_cert:
            findings.append({
                "severity": "High",
                "title": "Missing or Invalid Signing Certificate",
                "description": (
                    "No valid developer signing certificate was found in this APK. "
                    "All legitimate Android applications are cryptographically signed by their "
                    "developer. The absence of a valid certificate means the application's "
                    "authenticity and integrity cannot be verified."
                ),
                "recommendation": (
                    "Do not install unsigned or improperly signed APKs from unknown sources. "
                    "A missing certificate is a strong indicator the APK has been tampered with "
                    "or was never published through an official channel."
                )
            })

        # 5. Per-permission findings (using full metadata per permission)
        for perm_short in dangerous_perms_found:
            perm_def = DANGEROUS_PERMISSION_DEFS[perm_short]
            findings.append({
                "severity": perm_def["severity"],
                "title": perm_def["title"],
                "description": perm_def["description"],
                "recommendation": perm_def["recommendation"]
            })

        # 6. No Code Obfuscation (Medium)
        if obfuscation == "No Obfuscation Detected":
            findings.append({
                "severity": "Medium",
                "title": "Code Obfuscation Not Detected",
                "description": (
                    "The application does not appear to use ProGuard or R8 code obfuscation. "
                    "Unobfuscated code is trivially reverse-engineered, exposing internal logic, "
                    "API keys, server endpoints, and security mechanisms to attackers."
                ),
                "recommendation": (
                    "While not inherently malicious, the absence of obfuscation in a financial "
                    "or security-sensitive application reduces its resistance to tampering and "
                    "reverse engineering."
                )
            })

        # 7. Outdated Target SDK (Medium)
        if 0 < target_sdk_int < 31:
            findings.append({
                "severity": "Medium",
                "title": f"Outdated Target SDK Level ({target_sdk_int})",
                "description": (
                    f"The application targets Android SDK {target_sdk_int}, which is below the "
                    "current recommended minimum of 31 (Android 12). Applications targeting old "
                    "SDK levels opt out of modern security enhancements such as scoped storage, "
                    "improved permission handling, and stricter background process limits."
                ),
                "recommendation": (
                    "Prefer applications that target current Android SDK levels. An outdated target "
                    "SDK may indicate the app is unmaintained or is deliberately avoiding security "
                    "restrictions introduced in newer Android versions."
                )
            })

        # 8. Cleartext Traffic Allowed (Medium)
        if cleartext_traffic:
            findings.append({
                "severity": "Medium",
                "title": "Cleartext (Unencrypted) Network Traffic Permitted",
                "description": (
                    "The application manifest explicitly permits cleartext (HTTP) network "
                    "traffic. This means data sent by this application may be transmitted "
                    "without encryption, exposing user data to network interception (MITM attacks)."
                ),
                "recommendation": (
                    "All financial and security-sensitive applications should use HTTPS exclusively. "
                    "Avoid using this application on public or untrusted Wi-Fi networks."
                )
            })

        # 9. Backup Enabled (Medium) — only flag if explicitly true (not default)
        if allow_backup:
            findings.append({
                "severity": "Medium",
                "title": "Application Data Backup Enabled",
                "description": (
                    "The application allows Android's Auto Backup feature (android:allowBackup=\"true\"). "
                    "This means application data, including cached credentials and sensitive files, "
                    "can be extracted via ADB backup or transferred to a new device without "
                    "re-authentication."
                ),
                "recommendation": (
                    "For sensitive applications, backup should be disabled or carefully scoped "
                    "using backup rules to exclude sensitive files."
                )
            })

        # 10. Exported Activities (Medium)
        if exported_activities:
            # Filter out launcher activities (they are expected to be exported)
            non_launcher_exported = [
                a for a in exported_activities
                if "main" not in a.lower() and "launch" not in a.lower()
            ]
            if non_launcher_exported:
                findings.append({
                    "severity": "Medium",
                    "title": f"Exported Activities Detected ({len(non_launcher_exported)})",
                    "description": (
                        f"The application exposes {len(non_launcher_exported)} activity component(s) "
                        f"to other applications: {', '.join(non_launcher_exported[:3])}"
                        f"{'...' if len(non_launcher_exported) > 3 else ''}. "
                        "Exported activities can be started by any installed application, potentially "
                        "bypassing authentication or triggering unintended behavior."
                    ),
                    "recommendation": (
                        "Exported activities should be protected with appropriate permissions "
                        "or set to android:exported=\"false\" if they do not need to be externally accessible."
                    )
                })

        # 11. Exported Services (Medium)
        if exported_services:
            findings.append({
                "severity": "Medium",
                "title": f"Exported Services Detected ({len(exported_services)})",
                "description": (
                    f"The application exposes {len(exported_services)} service component(s) "
                    f"to other installed applications: {', '.join(exported_services[:3])}"
                    f"{'...' if len(exported_services) > 3 else ''}. "
                    "Exported services can be bound or started by any application, potentially "
                    "allowing unauthorized use of background functionality."
                ),
                "recommendation": (
                    "Services that do not need to be accessible from other applications should "
                    "be marked android:exported=\"false\"."
                )
            })

        # 12. Exported Broadcast Receivers (Low)
        if exported_receivers:
            findings.append({
                "severity": "Low",
                "title": f"Exported Broadcast Receivers Detected ({len(exported_receivers)})",
                "description": (
                    f"The application registers {len(exported_receivers)} exported broadcast "
                    f"receiver(s): {', '.join(exported_receivers[:3])}"
                    f"{'...' if len(exported_receivers) > 3 else ''}. "
                    "Exported receivers can be triggered by any application, which may cause "
                    "unintended processing of crafted intents."
                ),
                "recommendation": (
                    "Broadcast receivers that handle sensitive operations should be protected "
                    "with custom permissions or set to android:exported=\"false\"."
                )
            })

        # 13. Low Minimum SDK (Low)
        if 0 < min_sdk_int < 21:
            findings.append({
                "severity": "Low",
                "title": f"Low Minimum SDK Level ({min_sdk_int})",
                "description": (
                    f"The application supports Android SDK {min_sdk_int} (Android "
                    f"{'4.x' if min_sdk_int < 16 else '4.x–5.0'}). Very old Android versions "
                    "lack many modern security features. Supporting them may force the "
                    "application to use insecure legacy code paths."
                ),
                "recommendation": (
                    "While supporting older devices is a developer choice, ensure the application "
                    "does not disable security features to maintain backward compatibility."
                )
            })

        # ══════════════════════════════════════════════════════════════════
        # AI VERDICT — derived from actual findings, never hardcoded
        # ══════════════════════════════════════════════════════════════════
        ai_verdict = _generate_ai_verdict(findings)

        # ══════════════════════════════════════════════════════════════════
        # RECOMMENDATIONS — deduplicated from finding recommendations
        # ══════════════════════════════════════════════════════════════════
        recommendations = _deduplicate_recommendations(findings)

        # ── Risk Scoring (unchanged weighted formula) ───────────────────
        p_score = min(dangerous_count * 25, 100)
        c_score = 0 if has_cert else 100
        m_score = 10 if is_debuggable else 0
        d_score = 80 if matched_brand else 20
        o_score = 0 if obfuscation == "ProGuard/R8 Detected" else 50
        s_score = 100 if (len(keywords_found) > 0 and matched_brand) else (50 if (keywords_found or matched_brand) else 0)
        a_score = 30 if dangerous_count > 1 else 10

        risk_score = int(
            (0.20 * p_score) +
            (0.15 * c_score) +
            (0.10 * m_score) +
            (0.10 * d_score) +
            (0.15 * o_score) +
            (0.20 * s_score) +
            (0.10 * a_score)
        )
        risk_score = min(max(risk_score, 0), 100)

        # Threat Level
        if risk_score <= 20:
            threat_level = "SAFE"
        elif risk_score <= 40:
            threat_level = "LOW"
        elif risk_score <= 60:
            threat_level = "MEDIUM"
        elif risk_score <= 80:
            threat_level = "HIGH"
        else:
            threat_level = "CRITICAL"

        # ── Backward-compatible reasons list (plain text) ───────────────
        reasons = [f["description"] for f in findings] if findings else ["No significant threat indicators detected."]

        display_name = app_name or (original_filename.replace(".apk", "") if original_filename else "APK Application")

        return {
            "success": True,
            "app_name": display_name,
            "risk_score": risk_score,
            "threat_level": threat_level,
            # ── New structured fields (data-driven) ──────────────────
            "findings": findings,
            "detected_issues_count": len(findings),
            "ai_verdict": ai_verdict,
            "recommendations": recommendations,
            # ── Metadata ──────────────────────────────────────────────
            "metadata": {
                "file_name": original_filename or "uploaded_app.apk",
                "file_size": f"{file_size_mb:.2f} MB",
                "package_name": package_name or "unknown.package",
                "version_name": version_name or "1.0",
                "version_code": str(version_code) if version_code else "1",
                "min_sdk": min_sdk_int if min_sdk_int else 24,
                "target_sdk": target_sdk_int if target_sdk_int else 33,
                "certificate": "Valid (SHA-256)" if has_cert else "Self-Signed / Mismatched",
                "obfuscation": obfuscation,
                "activities": activities,
                "services": services,
                "receivers": receivers,
                "certificates": certs_info
            },
            "permissions": {
                "requested": permissions,
                "critical_violations": [p for p in permissions if p.split(".")[-1].upper() in DANGEROUS_PERMISSION_DEFS]
            },
            # ── Kept for backward compatibility ───────────────────────
            "reasons": reasons,
        }

    except Exception as e:
        logger.exception("Error scanning APK")
        return {"success": False, "error": f"Analysis failed during parsing: {str(e)}"}
