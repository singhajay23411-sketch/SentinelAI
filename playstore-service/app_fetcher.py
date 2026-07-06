"""
SentinelAI Play Store App Fetcher & Analysis Engine
====================================================
Provides utility functions for:
- Extracting package names from Play Store URLs
- Fetching app metadata via direct HTTP scraping
- Name similarity analysis against known trusted apps
- Description fraud-keyword detection
- Developer verification
- Install count risk assessment
- Composite risk scoring engine
"""

import re
import json
import time
import logging
from functools import lru_cache
from urllib.parse import urlparse, parse_qs

import requests
# pyrefly: ignore [missing-import]
from rapidfuzz import fuzz
import data_loader
import services.gemini_service as gemini_service

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# HTTP Session with browser-like headers
# ─────────────────────────────────────────────

_SESSION = requests.Session()
_SESSION.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
})

MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds, doubles each retry


# ─────────────────────────────────────────────
# (Constants have been moved to JSON datasets and data_loader.py)
# ─────────────────────────────────────────────


# ─────────────────────────────────────────────
# TASK 1: Extract Package Name from URL
# ─────────────────────────────────────────────

def extract_package_name(url: str) -> dict:
    """
    Extracts the package name (app ID) from a Google Play Store URL.
    
    Args:
        url: A Google Play Store URL, e.g.
             https://play.google.com/store/apps/details?id=com.upstox.app
    
    Returns:
        dict with 'success' bool and either 'package_name' or 'error'.
    """
    if not url or not isinstance(url, str):
        return {"success": False, "error": "URL is empty or invalid."}

    url = url.strip()

    # If it's already just a package name, return it directly
    if re.match(r'^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$', url):
        return {"success": True, "package_name": url}

    # Ensure URL has scheme for proper urlparse behavior
    test_url = url
    if not (url.startswith("http://") or url.startswith("https://")):
        test_url = "https://" + url

    try:
        parsed = urlparse(test_url)
    except Exception:
        return {"success": False, "error": "Malformed URL. Could not parse."}

    # Extract the 'id' parameter via query parsing first
    query_params = parse_qs(parsed.query)
    package_name = query_params.get("id", [None])[0]

    # Resilient fallback: use regex search for id=...
    if not package_name:
        match = re.search(r'[?&]id=([^&]+)', url)
        if match:
            package_name = match.group(1)

    if not package_name:
        return {"success": False, "error": "Could not extract app package ID ('id' parameter) from URL."}

    # Basic validation of the package name format
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$', package_name):
        return {"success": False, "error": f"Invalid package name format extracted: {package_name}"}

    return {"success": True, "package_name": package_name}


# ─────────────────────────────────────────────
# TASK 2: Fetch App Details from Play Store
#   Using direct HTTP requests instead of the
#   unreliable google-play-scraper library.
# ─────────────────────────────────────────────

# Regex patterns for extracting JSON datasets from Play Store HTML
_SCRIPT_RE = re.compile(r"AF_initDataCallback\(\{[^}]*key:\s*'ds:(\d+)'[^}]*data:\s*(.*?)(?:,\s*sideChannel:\s*\{.*?\})?\}\);\s*<\/script", re.DOTALL)


def _fetch_play_store_page(package_name: str, lang: str = "en", country: str = "in") -> str:
    """
    Fetches the raw HTML of a Play Store app page with retry logic.
    """
    url = (
        f"https://play.google.com/store/apps/details"
        f"?id={package_name}&hl={lang}&gl={country}"
    )
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            resp = _SESSION.get(url, timeout=15)
            if resp.status_code == 404:
                return None  # App genuinely not found
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as e:
            last_error = e
            logger.warning(f"Attempt {attempt + 1}/{MAX_RETRIES} failed for {package_name}: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (2 ** attempt))
    raise ConnectionError(f"Failed after {MAX_RETRIES} retries: {last_error}")


def _parse_play_store_html(html: str) -> dict:
    """
    Parses the embedded AF_initDataCallback JSON datasets from Play Store HTML.
    Returns a dict keyed by dataset number (e.g. 'ds:5').
    """
    datasets = {}
    for match in _SCRIPT_RE.finditer(html):
        key = match.group(1)
        raw_data = match.group(2).strip()
        # Remove trailing comma if present
        if raw_data.endswith(","):
            raw_data = raw_data[:-1]
        try:
            datasets[f"ds:{key}"] = json.loads(raw_data)
        except (json.JSONDecodeError, ValueError):
            continue
    return datasets


def _safe_get(data, *path, default=None):
    """
    Safely navigates nested lists/dicts. Returns default if any index is out of range.
    """
    current = data
    for key in path:
        try:
            if current is None:
                return default
            current = current[key]
        except (IndexError, KeyError, TypeError):
            return default
    return current if current is not None else default


def _extract_app_details(datasets: dict, package_name: str) -> dict:
    """
    Extracts structured app details from the parsed Play Store datasets.
    Google embeds app data primarily in ds:5 (main details).
    """
    # Try common dataset keys where Google stores app info
    main_data = None
    for key in ["ds:5", "ds:4", "ds:6", "ds:3"]:
        candidate = datasets.get(key)
        if candidate and isinstance(candidate, list):
            main_data = candidate
            break

    if not main_data:
        return None

    # Navigate the nested structure to extract fields
    # Google's internal data structure uses deeply nested lists
    title = (
        _safe_get(main_data, 0, 0, 0, default="") or
        _safe_get(main_data, 1, 2, 0, 0, default="")
    )
    
    description = (
        _safe_get(main_data, 0, 10, 0, 1, default="") or
        _safe_get(main_data, 1, 2, 72, 0, 1, default="")
    )
    
    summary = (
        _safe_get(main_data, 0, 10, 1, 1, default="") or
        _safe_get(main_data, 1, 2, 73, 0, 1, default="")
    )
    
    developer = (
        _safe_get(main_data, 0, 14, default="") or
        _safe_get(main_data, 1, 2, 68, 0, default="")
    )
    
    # Score (rating)
    score = (
        _safe_get(main_data, 0, 6, 0, 1, default=0) or
        _safe_get(main_data, 1, 2, 51, 0, 1, default=0)
    )
    
    # Ratings count
    ratings = (
        _safe_get(main_data, 0, 6, 2, 1, default=0) or
        _safe_get(main_data, 1, 2, 51, 2, 1, default=0)
    )
    
    # Install info
    installs = (
        _safe_get(main_data, 0, 12, 0) or
        _safe_get(main_data, 1, 2, 13, 0) or
        "0"
    )
    
    real_installs = (
        _safe_get(main_data, 0, 12, 3, default=0) or
        _safe_get(main_data, 1, 2, 13, 2, default=0)
    )
    
    # Icon
    icon = (
        _safe_get(main_data, 0, 12, 1, 3, 2, default="") or
        _safe_get(main_data, 1, 2, 95, 0, 3, 2, default="")
    )
    
    # Genre/category
    genre = (
        _safe_get(main_data, 0, 12, 13, 0, 0, default="") or
        _safe_get(main_data, 1, 2, 79, 0, 0, 0, default="")
    )
    
    # Screenshots
    screenshots = []
    screenshot_data = (
        _safe_get(main_data, 0, 12, 0, default=None) or
        _safe_get(main_data, 1, 2, 78, 0, default=None)
    )
    if isinstance(screenshot_data, list):
        for item in screenshot_data:
            img_url = _safe_get(item, 3, 2, default=None)
            if img_url and isinstance(img_url, str) and img_url.startswith("http"):
                screenshots.append(img_url)
    
    # Content rating
    content_rating = (
        _safe_get(main_data, 0, 12, 4, 0, default="") or
        _safe_get(main_data, 1, 2, 9, 0, default="")
    )
    
    # Version
    version = (
        _safe_get(main_data, 0, 12, 5, 0) or
        _safe_get(main_data, 1, 2, 103, "141", 0, 0, 0) or
        _safe_get(main_data, 1, 2, 140, 0, 0, 0) or
        ""
    )
    
    url = f"https://play.google.com/store/apps/details?id={package_name}&hl=en&gl=in"
    
    return {
        "title": str(title) if title else "Unknown",
        "developer": str(developer) if developer else "Unknown",
        "description": str(description) if description else "",
        "summary": str(summary) if summary else "",
        "installs": str(installs) if installs else "0",
        "real_installs": int(real_installs) if real_installs else 0,
        "score": float(score) if score else 0,
        "ratings": int(ratings) if ratings else 0,
        "reviews": 0,
        "icon": str(icon) if icon else "",
        "screenshots": screenshots[:8],
        "genre": str(genre) if genre else "",
        "content_rating": str(content_rating) if content_rating else "",
        "released": "",
        "updated": "",
        "version": str(version) if version else "",
        "url": url,
    }


# In-memory cache: avoids re-scraping the same app in one server session
_app_cache: dict = {}


def fetch_app_details(package_name: str) -> dict:
    """
    Fetches app metadata from the Google Play Store using direct HTTP requests.
    Uses a session cache to ensure consistent results for repeated calls.
    
    Args:
        package_name: The app's package ID, e.g. 'com.upstox.pro'
    
    Returns:
        dict with 'success' bool and either 'data' (app details) or 'error'.
    """
    # Return cached result if available (ensures consistency)
    if package_name in _app_cache:
        return _app_cache[package_name]

    try:
        html = _fetch_play_store_page(package_name)

        if html is None:
            result = {"success": False, "error": f"App '{package_name}' not found on Google Play Store."}
            _app_cache[package_name] = result
            return result

        datasets = _parse_play_store_html(html)

        if not datasets:
            # Fallback: try to extract title/dev from HTML meta tags
            app_details = _extract_from_meta_tags(html, package_name)
            if app_details:
                result = {"success": True, "data": app_details}
                _app_cache[package_name] = result
                return result
            result = {"success": False, "error": "Could not parse Play Store page. Google may have changed their format."}
            _app_cache[package_name] = result
            return result

        app_details = _extract_app_details(datasets, package_name)

        if not app_details or app_details.get("title") == "Unknown":
            # Fallback to meta tags
            app_details = _extract_from_meta_tags(html, package_name) or app_details

        if not app_details:
            result = {"success": False, "error": "Could not extract app details from Play Store page."}
            _app_cache[package_name] = result
            return result

        result = {"success": True, "data": app_details}
        _app_cache[package_name] = result
        return result

    except ConnectionError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        logger.exception(f"Unexpected error fetching {package_name}")
        return {"success": False, "error": f"Failed to fetch app details: {str(e)}"}


def _extract_from_meta_tags(html: str, package_name: str) -> dict | None:
    """
    Fallback: Extract basic app info from HTML meta/title tags.
    More reliable than parsing the AF_initDataCallback datasets
    when Google changes their internal data structure.
    """
    import re as _re

    # <title>App Name - Apps on Google Play</title>
    title_match = _re.search(r'<title>(.+?)\s*[-–]\s*Apps on Google Play</title>', html)
    title = title_match.group(1).strip() if title_match else None

    # <meta name="description" content="...">
    desc_match = _re.search(r'<meta\s+name="description"\s+content="([^"]*?)"', html)
    description = desc_match.group(1).strip() if desc_match else ""

    # og:image for icon
    icon_match = _re.search(r'<meta\s+property="og:image"\s+content="([^"]*?)"', html)
    icon = icon_match.group(1).strip() if icon_match else ""

    # Developer name from structured data or page content
    dev_match = _re.search(r'"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"', html)
    developer = dev_match.group(1).strip() if dev_match else ""
    
    # Genre from structured data
    genre_match = _re.search(r'"genre"\s*:\s*"([^"]+)"', html)
    genre = genre_match.group(1).strip() if genre_match else ""
    
    # Rating from structured data
    rating_match = _re.search(r'"ratingValue"\s*:\s*"?([\d.]+)"?', html)
    score = float(rating_match.group(1)) if rating_match else 0

    # Rating count
    count_match = _re.search(r'"ratingCount"\s*:\s*"?(\d+)"?', html)
    ratings = int(count_match.group(1)) if count_match else 0

    if not title:
        return None

    return {
        "title": title,
        "developer": developer or "Unknown",
        "description": description,
        "summary": description[:200] if description else "",
        "installs": "0",
        "real_installs": 0,
        "score": score,
        "ratings": ratings,
        "reviews": 0,
        "icon": icon,
        "screenshots": [],
        "genre": genre,
        "content_rating": "",
        "released": "",
        "updated": "",
        "version": "",
        "url": f"https://play.google.com/store/apps/details?id={package_name}&hl=en&gl=in",
    }


# ─────────────────────────────────────────────
# TASK 3: Name Similarity Analysis
# ─────────────────────────────────────────────

def analyze_name_similarity(app_name: str) -> dict:
    """
    Compares the app name against a list of known trusted investment apps
    using fuzzy string matching to detect look-alikes.
    
    Returns:
        dict with 'matched_app', 'similarity' score (0-100), and 'risk' level.
    """
    if not app_name:
        return {"matched_app": None, "similarity": 0, "risk": 0}

    best_match = None
    best_score = 0

    legitimate_apps = data_loader.load_legitimate_apps()
    for known in legitimate_apps:
        # Use token_set_ratio for flexibility with word ordering and subset matching
        score = fuzz.token_set_ratio(app_name.lower(), known.lower())
        if score > best_score:
            best_score = score
            best_match = known

    # Determine risk based on similarity threshold
    if best_score >= 90:
        risk = 90
    elif best_score >= 80:
        risk = 70
    elif best_score >= 70:
        risk = 50
    else:
        risk = 10

    return {
        "matched_app": best_match,
        "similarity": round(best_score),
        "risk": risk,
    }


# ─────────────────────────────────────────────
# TASK 4: Description Keyword Analysis
# ─────────────────────────────────────────────

def analyze_description(description: str) -> dict:
    """
    Scans the app description for suspicious keywords commonly found
    in fraudulent investment apps.
    
    Returns:
        dict with 'matches' (list of found keywords) and 'risk' score.
    """
    if not description:
        return {"matches": [], "risk": 0}

    desc_lower = description.lower()
    suspicious_keywords = data_loader.load_suspicious_keywords()
    matches = [kw for kw in suspicious_keywords if kw in desc_lower]

    # Risk scales with number of matches
    if len(matches) >= 4:
        risk = 90
    elif len(matches) >= 2:
        risk = 60
    elif len(matches) == 1:
        risk = 30
    else:
        risk = 0

    return {"matches": matches, "risk": risk}


# ─────────────────────────────────────────────
# TASK 5: Developer Verification
# ─────────────────────────────────────────────

def verify_developer(app_name: str, developer: str) -> dict:
    """
    Checks if the app's developer matches the official developer of a
    similar known trusted app. A mismatch indicates potential impersonation.
    
    Returns:
        dict with 'trusted' bool, 'expected_developer', and 'risk' score.
    """
    if not app_name or not developer:
        return {"trusted": True, "expected_developer": None, "risk": 0}

    # Find the closest matching known app
    similarity_result = analyze_name_similarity(app_name)
    matched_app = similarity_result.get("matched_app")
    similarity_score = similarity_result.get("similarity", 0)

    # Only check developer if the name is reasonably similar
    if similarity_score < 60 or not matched_app:
        return {"trusted": True, "expected_developer": None, "risk": 0}

    trusted_devs = data_loader.load_trusted_developers()
    expected = trusted_devs.get(matched_app)
    if not expected:
        return {"trusted": True, "expected_developer": None, "risk": 0}

    # Fuzzy match developer names (allow for minor variations)
    dev_similarity = fuzz.token_set_ratio(developer.lower(), expected.lower())

    if dev_similarity >= 85:
        return {"trusted": True, "expected_developer": expected, "risk": 0}
    else:
        # Higher risk when name is very similar but developer is different
        risk = 90 if similarity_score >= 80 else 80
        return {
            "trusted": False,
            "expected_developer": expected,
            "risk": risk,
        }


# ─────────────────────────────────────────────
# TASK 6: Install Count Analysis
# ─────────────────────────────────────────────

def analyze_installs(installs: str, real_installs: int = 0) -> dict:
    """
    Assesses risk based on install count. Fake apps typically have
    far fewer installs than legitimate versions.
    
    Returns:
        dict with 'install_count', 'risk' score, and 'note'.
    """
    # Parse install string to a number
    count = real_installs
    if count == 0 and installs:
        cleaned = installs.replace(",", "").replace("+", "").strip()
        try:
            count = int(cleaned)
        except (ValueError, TypeError):
            count = 0

    if count >= 10_000_000:
        risk = 5
        note = "Very high install count — likely legitimate."
    elif count >= 1_000_000:
        risk = 10
        note = "High install count — likely legitimate."
    elif count >= 100_000:
        risk = 30
        note = "Moderate install count."
    elif count >= 10_000:
        risk = 50
        note = "Low install count — moderate concern."
    elif count >= 1_000:
        risk = 70
        note = "Very low install count — elevated risk."
    else:
        risk = 90
        note = "Extremely low install count — high risk indicator."

    return {"install_count": count, "risk": risk, "note": note}


# ─────────────────────────────────────────────
# TASK 7: Risk Scoring Engine
# ─────────────────────────────────────────────

def calculate_risk_score(
    name_risk: int,
    description_risk: int,
    developer_risk: int,
    install_risk: int,
) -> dict:
    """
    Computes the final weighted risk score and assigns a threat level.
    
    Weights:
        Name Similarity:  35%
        Description:      25%
        Developer:        25%
        Installs:         15%
    
    Returns:
        dict with 'risk_score' (0-100) and 'threat_level' label.
    """
    score = (
        name_risk * 0.35
        + description_risk * 0.25
        + developer_risk * 0.25
        + install_risk * 0.15
    )
    risk_score = min(100, max(0, round(score)))

    if risk_score <= 30:
        threat_level = "Safe"
    elif risk_score <= 60:
        threat_level = "Suspicious"
    else:
        threat_level = "High Risk"

    return {"risk_score": risk_score, "threat_level": threat_level}


# ─────────────────────────────────────────────
# Orchestrator: Full Analysis Pipeline
# ─────────────────────────────────────────────

def run_full_analysis(url: str) -> dict:
    """
    Orchestrates the entire Play Store analysis pipeline:
    1. Extract package name from URL
    2. Fetch app metadata
    3. Run all analysis modules
    4. Compute final risk score
    5. Return structured result
    
    Args:
        url: Google Play Store URL
    
    Returns:
        Complete analysis result dict.
    """
    # Step 1: Extract package name
    pkg_result = extract_package_name(url)
    if not pkg_result["success"]:
        return {"success": False, "error": pkg_result["error"]}

    package_name = pkg_result["package_name"]

    # Step 2: Fetch app details
    app_result = fetch_app_details(package_name)
    if not app_result["success"]:
        return {"success": False, "error": app_result["error"]}

    details = app_result["data"]

    # Step 3: Run analysis modules
    name_analysis = analyze_name_similarity(details["title"])
    desc_analysis = analyze_description(details["description"])
    dev_analysis = verify_developer(details["title"], details["developer"])
    install_analysis = analyze_installs(details["installs"], details.get("real_installs", 0))

    # Step 4: Calculate composite risk
    risk_result = calculate_risk_score(
        name_risk=name_analysis["risk"],
        description_risk=desc_analysis["risk"],
        developer_risk=dev_analysis["risk"],
        install_risk=install_analysis["risk"],
    )

    # Step 5: Compile reasons
    reasons = []
    if name_analysis["similarity"] >= 70:
        reasons.append(f"Name similarity to '{name_analysis['matched_app']}' ({name_analysis['similarity']}%)")
    if desc_analysis["matches"]:
        reasons.append(f"Suspicious keywords found: {', '.join(desc_analysis['matches'])}")
    if not dev_analysis["trusted"] and dev_analysis["expected_developer"]:
        reasons.append(f"Developer mismatch — expected '{dev_analysis['expected_developer']}'")
    if install_analysis["risk"] >= 50:
        reasons.append(install_analysis["note"])

    # If no major concerns found, note that
    if not reasons:
        reasons.append("No significant fraud indicators detected.")

    return {
        "success": True,
        "app_details": {
            "title": details["title"],
            "developer": details["developer"],
            "description": details.get("summary", details["description"][:200]),
            "installs": details["installs"],
            "real_installs": details.get("real_installs", 0),
            "score": details["score"],
            "ratings": details["ratings"],
            "reviews": details.get("reviews", 0),
            "icon": details["icon"],
            "screenshots": details["screenshots"][:8],  # Limit to 8
            "genre": details.get("genre", ""),
            "version": details.get("version", ""),
            "released": details.get("released", ""),
            "updated": details.get("updated", ""),
            "content_rating": details.get("content_rating", ""),
            "url": details.get("url", ""),
        },
        "analysis": {
            "risk_score": risk_result["risk_score"],
            "threat_level": risk_result["threat_level"],
            "matched_app": name_analysis["matched_app"],
            "name_similarity": name_analysis["similarity"],
            "reasons": reasons,
            "breakdown": {
                "name": {"risk": name_analysis["risk"], "similarity": name_analysis["similarity"], "matched": name_analysis["matched_app"]},
                "description": {"risk": desc_analysis["risk"], "keywords_found": desc_analysis["matches"]},
                "developer": {"risk": dev_analysis["risk"], "trusted": dev_analysis["trusted"], "expected": dev_analysis.get("expected_developer")},
                "installs": {"risk": install_analysis["risk"], "count": install_analysis["install_count"], "note": install_analysis["note"]},
            },
        },
    }
    
    # Generate Gemini report
    gemini_payload = {
        "app_name": details["title"],
        "risk_score": risk_result["risk_score"],
        "threat_level": risk_result["threat_level"],
        "matched_app": name_analysis["matched_app"] or "None",
        "developer_verified": dev_analysis["trusted"],
        "matched_keywords": desc_analysis["matches"],
        "reasons": reasons
    }
    result["analysis"]["ai_report"] = gemini_service.generate_ai_report(gemini_payload)

    return result
