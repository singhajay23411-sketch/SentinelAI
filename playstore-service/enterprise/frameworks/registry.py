"""
SentinelAI Enterprise - Regulatory & Security Frameworks Registry
Tracks standards, regulatory mandates (RBI, SEBI, CERT-In), and control gap evaluations.
All references point to authoritative public specifications; no restricted text is reproduced.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

FRAMEWORKS_METADATA: Dict[str, Dict[str, Any]] = {
    "iso27001_2022": {
        "id": "iso27001_2022",
        "name": "ISO/IEC 27001:2022 Information Security Management",
        "authority": "International Organization for Standardization",
        "edition": "2022 Revision",
        "official_url": "https://www.iso.org/standard/27001",
        "review_date": "2026-01-15",
        "category": "International Standard",
    },
    "nist_csf_2_0": {
        "id": "nist_csf_2_0",
        "name": "NIST Cybersecurity Framework (CSF) 2.0",
        "authority": "National Institute of Standards and Technology (US)",
        "edition": "Version 2.0 (Feb 2024)",
        "official_url": "https://www.nist.gov/cyberframework",
        "review_date": "2026-01-20",
        "category": "Risk Management Framework",
    },
    "cis_controls_v8": {
        "id": "cis_controls_v8",
        "name": "CIS Critical Security Controls v8",
        "authority": "Center for Internet Security",
        "edition": "Version 8",
        "official_url": "https://www.cisecurity.org/controls/v8",
        "review_date": "2026-02-01",
        "category": "Technical Benchmark",
    },
    "rbi_csf_2023": {
        "id": "rbi_csf_2023",
        "name": "RBI Cyber Security Framework for Banks & NBFCs",
        "authority": "Reserve Bank of India (Cyber Security Cell)",
        "edition": "Master Direction / CSCRF 2023",
        "official_url": "https://www.rbi.org.in",
        "review_date": "2026-01-10",
        "category": "Indian Banking Regulation",
    },
    "sebi_cscrf_2024": {
        "id": "sebi_cscrf_2024",
        "name": "SEBI Cybersecurity and Cyber Resilience Framework (CSCRF)",
        "authority": "Securities and Exchange Board of India",
        "edition": "CSCRF Master Circular 2024",
        "official_url": "https://www.sebi.gov.in",
        "review_date": "2026-02-15",
        "category": "Indian Securities Regulation",
    },
}


def _get_mappings_dir() -> str:
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "mappings")


def load_framework_mapping(framework_id: str) -> Optional[Dict[str, Any]]:
    """Loads a specific framework mapping JSON file."""
    fpath = os.path.join(_get_mappings_dir(), f"{framework_id}.json")
    if not os.path.exists(fpath):
        return None
    try:
        with open(fpath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed loading framework mapping {framework_id}: {e}")
        return None


def get_all_frameworks_summary() -> List[Dict[str, Any]]:
    """Returns metadata and control coverage summary for all frameworks."""
    summaries = []
    for fid, meta in FRAMEWORKS_METADATA.items():
        data = load_framework_mapping(fid)
        if data:
            controls = data.get("controls", [])
            total = len(controls)
            mapped = sum(1 for c in controls if c.get("status") in ("implemented", "evidence_available"))
            partial = sum(1 for c in controls if c.get("status") == "partial")
            gaps = sum(1 for c in controls if c.get("status") == "gap")
            pct = round((mapped / total * 100.0) if total > 0 else 0.0, 1)
        else:
            total, mapped, partial, gaps, pct = 0, 0, 0, 0, 0.0

        summaries.append({
            **meta,
            "total_controls": total,
            "implemented_controls": mapped,
            "partial_controls": partial,
            "gap_controls": gaps,
            "coverage_percentage": pct,
        })
    return summaries
