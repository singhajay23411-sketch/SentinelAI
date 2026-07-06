"""
SentinelAI – Automated Play Store Trusted Dataset Builder
==========================================================
Discovers legitimate financial applications from Google Play Store
and generates trusted datasets for SentinelAI's fraud detection engine.

Usage:
    python dataset_builder.py

Generated datasets:
    datasets/trusted_apps.json
    datasets/trusted_developers.json
    datasets/trusted_packages.json
    datasets/trusted_metadata.json
"""

import json
import os
import time
import logging
from typing import Optional

# pyrefly: ignore [missing-import]
from google_play_scraper import search, app as fetch_app
# pyrefly: ignore [missing-import]
from google_play_scraper.exceptions import NotFoundError

# ─────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────

DATASETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datasets")

MIN_RATING = 4.0
MIN_INSTALLS = 100_000
SEARCH_HITS = 100
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds

SEARCH_CATEGORIES: Dict[str, List[str]] = {
    "Broker": [
        "stock broker",
        "stock trading",
        "mutual fund",
        "investment app",
        "share market",
        "demat account",
    ],
    "Bank": [
        "mobile banking",
        "bank app",
        "net banking",
    ],
    "UPI": [
        "upi payment",
        "wallet",
        "digital payments",
    ],
    "Insurance": [
        "insurance",
        "health insurance",
        "car insurance",
    ],
    "Crypto": [
        "crypto exchange",
        "bitcoin trading",
        "cryptocurrency",
    ],
    "Wealth Management": [
        "wealth management",
        "financial planning",
        "investment advisor",
    ],
    "Government Finance": [
        "income tax",
        "epfo",
        "nps",
        "government finance",
        "digital india",
    ],
}

# ─────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("dataset_builder")

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _retry(fn, *args, retries: int = MAX_RETRIES, **kwargs):
    """Call *fn* with retries and exponential back-off."""
    for attempt in range(1, retries + 1):
        try:
            return fn(*args, **kwargs)
        except Exception as exc:
            if attempt == retries:
                logger.warning("  ✗ Failed after %d attempts: %s", retries, exc)
                return None
            wait = RETRY_DELAY * attempt
            logger.debug("  Retry %d/%d in %ds – %s", attempt, retries, wait, exc)
            time.sleep(wait)


def _parse_installs(raw: Optional[Union[str, int]]) -> int:
    """Convert install strings like '10,000,000+' → 10000000."""
    if raw is None:
        return 0
    if isinstance(raw, int):
        return raw
    return int(raw.replace(",", "").replace("+", "").strip() or "0")


def _format_installs(count: int) -> str:
    """Pretty-print an install count: 10000000 → '10M+'."""
    if count >= 1_000_000_000:
        return f"{count // 1_000_000_000}B+"
    if count >= 1_000_000:
        return f"{count // 1_000_000}M+"
    if count >= 1_000:
        return f"{count // 1_000}K+"
    return str(count)


def _classify_category(
    genre: str,
    title: str,
    description: str,
    search_category: str,
) -> str:
    """Determine SentinelAI category from available metadata."""
    text = f"{genre} {title} {description}".lower()

    if search_category != "Other Financial":
        return search_category

    # Fallback heuristic
    if any(kw in text for kw in ("broker", "trading", "demat", "stock", "share")):
        return "Broker"
    if any(kw in text for kw in ("bank", "banking")):
        return "Bank"
    if any(kw in text for kw in ("upi", "wallet", "payment")):
        return "UPI"
    if "insurance" in text:
        return "Insurance"
    if any(kw in text for kw in ("crypto", "bitcoin", "coin")):
        return "Crypto"
    if any(kw in text for kw in ("wealth", "financial planning", "advisor")):
        return "Wealth Management"
    if any(kw in text for kw in ("tax", "epfo", "nps", "government")):
        return "Government Finance"
    return "Other Financial"


# ─────────────────────────────────────────────
# Pipeline stages
# ─────────────────────────────────────────────

def discover_apps(category: str, keywords: List[str]) -> Dict[str, dict]:
    """Search Play Store for *keywords* and return deduplicated hits."""
    discovered: Dict[str, dict] = {}  # appId → basic info

    for keyword in keywords:
        logger.info("  🔍  Searching: '%s'", keyword)
        results = _retry(search, keyword, n_hits=SEARCH_HITS, lang="en", country="in")
        if not results:
            continue

        logger.info("     Found %d results", len(results))
        for r in results:
            app_id = r.get("appId")
            if app_id and app_id not in discovered:
                discovered[app_id] = {
                    "title": r.get("title", ""),
                    "appId": app_id,
                    "search_category": category,
                }
        # Be polite to Google
        time.sleep(1)

    return discovered


def fetch_details(discovered: Dict[str, dict]) -> List[dict]:
    """Fetch full metadata for each discovered app and apply quality filters."""
    accepted: List[dict] = []
    rejected_count = 0

    total = len(discovered)
    for idx, (app_id, basic) in enumerate(discovered.items(), 1):
        if idx % 20 == 0 or idx == total:
            logger.info("  Fetching details… %d / %d", idx, total)

        details = _retry(fetch_app, app_id, lang="en", country="in")
        if details is None:
            rejected_count += 1
            continue

        rating = details.get("score") or 0
        installs_raw = details.get("realInstalls") or details.get("installs") or 0
        installs = _parse_installs(installs_raw)
        title = details.get("title", basic["title"])

        # Quality filter
        if rating < MIN_RATING:
            logger.debug("  ✗ Rejected: %-40s  (rating %.1f)", title, rating)
            rejected_count += 1
            continue
        if installs < MIN_INSTALLS:
            logger.debug("  ✗ Rejected: %-40s  (installs %s)", title, _format_installs(installs))
            rejected_count += 1
            continue

        category = _classify_category(
            details.get("genre", ""),
            title,
            details.get("description", ""),
            basic["search_category"],
        )

        accepted.append({
            "app_name": title,
            "developer": details.get("developer", "Unknown"),
            "package_name": app_id,
            "category": category,
            "rating": round(rating, 1),
            "installs": _format_installs(installs),
            "installs_raw": installs,
            "playstore_url": details.get("url", f"https://play.google.com/store/apps/details?id={app_id}"),
            "genre": details.get("genre", ""),
            "source": "google_play_store",
        })
        logger.debug("  ✓ Accepted: %s", title)

        # Throttle to avoid rate limiting
        time.sleep(0.3)

    logger.info("  ── Accepted: %d  |  Rejected: %d", len(accepted), rejected_count)
    return accepted


def deduplicate(records: List[dict]) -> List[dict]:
    """Remove duplicate entries by package_name, keeping the richer record."""
    seen: Dict[str, dict] = {}
    for rec in records:
        pkg = rec["package_name"]
        if pkg not in seen:
            seen[pkg] = rec
        else:
            # Keep the one with more installs
            if rec["installs_raw"] > seen[pkg]["installs_raw"]:
                seen[pkg] = rec
    return list(seen.values())


# ─────────────────────────────────────────────
# Dataset generation
# ─────────────────────────────────────────────

def generate_datasets(records: List[dict]) -> None:
    """Write the four JSON dataset files from accepted records."""
    os.makedirs(DATASETS_DIR, exist_ok=True)

    trusted_apps: dict = {}
    trusted_developers: dict = {}
    trusted_packages: dict = {}
    trusted_metadata: List[dict] = []

    for rec in sorted(records, key=lambda r: r["app_name"]):
        name = rec["app_name"]
        dev = rec["developer"]
        pkg = rec["package_name"]

        # trusted_apps.json
        trusted_apps[name] = {
            "developer": dev,
            "package_name": pkg,
            "category": rec["category"],
            "rating": rec["rating"],
            "installs": rec["installs"],
        }

        # trusted_developers.json  (array for future aliases)
        if name in trusted_developers:
            if dev not in trusted_developers[name]:
                trusted_developers[name].append(dev)
        else:
            trusted_developers[name] = [dev]

        # trusted_packages.json  (array for future aliases)
        if name in trusted_packages:
            if pkg not in trusted_packages[name]:
                trusted_packages[name].append(pkg)
        else:
            trusted_packages[name] = [pkg]

        # trusted_metadata.json
        trusted_metadata.append({
            "app_name": name,
            "developer": dev,
            "package_name": pkg,
            "category": rec["category"],
            "rating": rec["rating"],
            "installs": rec["installs"],
            "playstore_url": rec["playstore_url"],
            "source": rec["source"],
        })

    _write_json("trusted_apps.json", trusted_apps)
    _write_json("trusted_developers.json", trusted_developers)
    _write_json("trusted_packages.json", trusted_packages)
    _write_json("trusted_metadata.json", trusted_metadata)


def _write_json(filename: str, data) -> None:
    path = os.path.join(DATASETS_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info("  📄  Written: %s  (%d entries)", filename, len(data) if isinstance(data, (dict, list)) else 0)


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

def main() -> None:
    logger.info("=" * 60)
    logger.info("SentinelAI – Automated Play Store Dataset Builder")
    logger.info("=" * 60)

    all_discovered: Dict[str, dict] = {}
    stats = {"discovered": 0, "keywords": 0}

    for category, keywords in SEARCH_CATEGORIES.items():
        logger.info("")
        logger.info("━━  Category: %s  (%d keywords)  ━━", category, len(keywords))
        cat_discovered = discover_apps(category, keywords)
        stats["keywords"] += len(keywords)

        # Merge into global pool (first category wins for classification)
        for app_id, info in cat_discovered.items():
            if app_id not in all_discovered:
                all_discovered[app_id] = info

    stats["discovered"] = len(all_discovered)
    logger.info("")
    logger.info("━━  Discovery complete: %d unique apps found  ━━", stats["discovered"])

    # Fetch details & filter
    logger.info("")
    logger.info("Fetching detailed metadata & applying quality filters…")
    accepted = fetch_details(all_discovered)

    # Deduplicate
    accepted = deduplicate(accepted)
    logger.info("After deduplication: %d apps", len(accepted))

    # Generate datasets
    logger.info("")
    logger.info("Generating datasets…")
    generate_datasets(accepted)

    # Final statistics
    categories = {}
    for rec in accepted:
        cat = rec["category"]
        categories[cat] = categories.get(cat, 0) + 1

    logger.info("")
    logger.info("=" * 60)
    logger.info("FINAL STATISTICS")
    logger.info("=" * 60)
    logger.info("  Keywords searched:    %d", stats["keywords"])
    logger.info("  Apps discovered:      %d", stats["discovered"])
    logger.info("  Apps accepted:        %d", len(accepted))
    logger.info("  Developers collected: %d", len({r["developer"] for r in accepted}))
    logger.info("  Packages collected:   %d", len({r["package_name"] for r in accepted}))
    logger.info("")
    logger.info("  Category breakdown:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        logger.info("    %-25s %d", cat, count)
    logger.info("")
    logger.info("✅  Datasets generated successfully in: %s", DATASETS_DIR)
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
