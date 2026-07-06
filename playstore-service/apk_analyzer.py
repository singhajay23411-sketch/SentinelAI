"""
SentinelAI APK Identity Verification Engine
=============================================
Metadata-driven APK analysis that leverages the SentinelAI Intelligence Engine
and trusted datasets to verify app identity, detect brand impersonation, and
produce trust/threat/confidence scores consistent with Play Store and Manual
analysis modules.

This module extracts only the metadata needed for identity verification:
  - app_name, package_name, version_name, version_code
  - certificate_info, permissions, target_sdk, min_sdk

It does NOT perform deep code analysis, malware scanning, or reverse engineering.
"""

import os
import logging
# pyrefly: ignore [missing-import]
from androguard.core.apk import APK

from services.intelligence_engine import IntelligenceEngine
import services.gemini_service as gemini_service

logger = logging.getLogger("apk_analyzer")

# Permissions considered dangerous — used only for a lightweight count,
# not as the primary scoring factor.
DANGEROUS_PERMISSIONS = {
    "RECEIVE_SMS", "SEND_SMS", "READ_PHONE_STATE", "SYSTEM_ALERT_WINDOW",
    "ACCESS_FINE_LOCATION", "RECORD_AUDIO", "CAMERA", "READ_CONTACTS",
    "PROCESS_OUTGOING_CALLS", "READ_CALL_LOG", "WRITE_SETTINGS", "GET_ACCOUNTS",
}


def _extract_certificate_info(apk) -> tuple:
    """
    Extracts signing certificate details from the APK.
    Returns (certs_info_list, developer_hint) where developer_hint is the
    Organization or Common Name from the certificate subject, usable as
    a best-effort developer identifier.
    """
    certs_info = []
    developer_hint = ""
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

            # Try to extract a developer hint from the certificate subject
            if not developer_hint and subject_native:
                try:
                    native = subject_native.native
                    if isinstance(native, dict):
                        developer_hint = (
                            native.get("organization_name", "") or
                            native.get("common_name", "") or
                            ""
                        )
                except Exception:
                    pass

            certs_info.append({
                "subject": format_name_dict(subject_native),
                "issuer": format_name_dict(issuer_native),
                "serial_number": str(cert.serial_number) if getattr(cert, 'serial_number', None) else "N/A",
                "sha256": cert.sha256.hex() if hasattr(cert, 'sha256') else "",
                "signature_algo": cert.signature_algo if getattr(cert, 'signature_algo', None) else "Unknown"
            })
    except Exception as e:
        logger.warning(f"Failed to extract certificate details: {str(e)}")

    return certs_info, developer_hint


def analyze_apk_file(file_path: str, original_filename: str = None) -> dict:
    """
    Extracts APK metadata and runs it through the SentinelAI Intelligence Engine
    for identity verification and trust scoring.

    Returns a result dictionary with the same schema used by Play Store Analysis
    and Manual Verification (trust_score, threat_score, confidence_score, status).
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
        try:
            app_name = apk.get_app_name()
        except Exception as e:
            logger.warning(f"Failed to get app name: {e}")
            app_name = None

        try:
            package_name = apk.get_package()
        except Exception as e:
            logger.warning(f"Failed to get package name: {e}")
            package_name = None

        try:
            version_name = apk.get_androidversion_name()
        except Exception as e:
            logger.warning(f"Failed to get version name: {e}")
            version_name = None

        try:
            version_code = apk.get_androidversion_code()
        except Exception as e:
            logger.warning(f"Failed to get version code: {e}")
            version_code = None

        try:
            target_sdk = apk.get_target_sdk_version()
        except Exception as e:
            logger.warning(f"Failed to get target SDK: {e}")
            target_sdk = None

        try:
            min_sdk = apk.get_min_sdk_version()
        except Exception as e:
            logger.warning(f"Failed to get min SDK: {e}")
            min_sdk = None

        target_sdk_int = int(target_sdk) if target_sdk and str(target_sdk).isdigit() else 0
        min_sdk_int = int(min_sdk) if min_sdk and str(min_sdk).isdigit() else 0

        # ── Permissions ─────────────────────────────────────────────────
        try:
            permissions = sorted(list(set(apk.get_permissions())))
        except Exception as e:
            logger.warning(f"Failed to get permissions: {e}")
            permissions = []

        dangerous_count = sum(
            1 for p in permissions
            if p.split(".")[-1].upper() in DANGEROUS_PERMISSIONS
        )

        # ── Certificate extraction ──────────────────────────────────────
        certs_info, developer_hint = _extract_certificate_info(apk)
        certificate_present = len(certs_info) > 0

        # ── Display name ────────────────────────────────────────────────
        display_name = app_name or (
            original_filename.replace(".apk", "") if original_filename else "APK Application"
        )

        # ══════════════════════════════════════════════════════════════════
        # Run through the SentinelAI Intelligence Engine
        # Same engine used by Play Store Analysis and Manual Verification
        # ══════════════════════════════════════════════════════════════════
        analysis = IntelligenceEngine.analyze(
            app_name=display_name,
            developer=developer_hint,
            package_name=package_name or "",
            description="",           # APKs don't have descriptions
            rating=0.0,               # No Play Store rating available
            downloads=0,              # No download count available
            category="",              # No category available from APK
            certificate_present=certificate_present,
            dangerous_permission_count=dangerous_count,
        )

        # ── Generate Gemini AI report ───────────────────────────────────
        ai_report = gemini_service.generate_ai_report(analysis)

        # ══════════════════════════════════════════════════════════════════
        # Build the unified result — same schema as Play Store / Manual
        # ══════════════════════════════════════════════════════════════════
        return {
            "success": True,
            "app_name": display_name,
            "category": analysis.get("matched_category", ""),
            "matched_app": analysis.get("matched_app"),
            "package_verified": analysis.get("package_verified", False),
            "developer_verified": analysis.get("developer_verified", False),
            "certificate_present": certificate_present,
            # ── Scores from Intelligence Engine ───────────────────────
            "trust_score": analysis.get("trust_score", 0),
            "threat_score": analysis.get("threat_score", 0),
            "confidence_score": analysis.get("confidence_score", 0),
            "status": analysis.get("status", "Unknown"),
            # ── Intelligence details ──────────────────────────────────
            "issues": analysis.get("issues", []),
            "trust_signals": analysis.get("trust_signals", []),
            "matched_keywords": analysis.get("matched_keywords", []),
            "ai_report": ai_report,
            # ── APK Metadata (for display) ────────────────────────────
            "metadata": {
                "file_name": original_filename or "uploaded_app.apk",
                "file_size": f"{file_size_mb:.2f} MB",
                "package_name": package_name or "unknown.package",
                "version_name": version_name or "1.0",
                "version_code": str(version_code) if version_code else "1",
                "min_sdk": min_sdk_int if min_sdk_int else 24,
                "target_sdk": target_sdk_int if target_sdk_int else 33,
                "certificates": certs_info,
            },
            "permissions": {
                "requested": permissions,
                "dangerous_count": dangerous_count,
            },
        }

    except Exception as e:
        logger.exception("Error scanning APK")
        return {"success": False, "error": f"Analysis failed during parsing: {str(e)}"}
