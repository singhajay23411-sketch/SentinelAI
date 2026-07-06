import os
import json
import logging

logger = logging.getLogger(__name__)

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "datasets")

_CACHE = {
    "legitimate_apps": None,
    "trusted_developers": None,
    "trusted_domains": None,
    "suspicious_keywords": None,
    "suspicious_domain_terms": None
}

def _load_json_dataset(filename: str):
    filepath = os.path.join(DATASETS_DIR, filename)
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load dataset {filename}: {e}")
        return []

def load_legitimate_apps() -> list:
    if _CACHE["legitimate_apps"] is None:
        raw_data = _load_json_dataset("legitimate_apps.json")
        flattened = []
        if isinstance(raw_data, dict):
            for category, apps in raw_data.items():
                flattened.extend(apps)
        else:
            flattened = raw_data
        _CACHE["legitimate_apps"] = flattened
    return _CACHE["legitimate_apps"]

def load_trusted_developers() -> dict:
    if _CACHE["trusted_developers"] is None:
        _CACHE["trusted_developers"] = _load_json_dataset("trusted_developers.json")
    return _CACHE["trusted_developers"]

def load_trusted_domains() -> list:
    if _CACHE["trusted_domains"] is None:
        _CACHE["trusted_domains"] = _load_json_dataset("trusted_domains.json")
    return _CACHE["trusted_domains"]

def load_suspicious_keywords() -> list:
    if _CACHE["suspicious_keywords"] is None:
        raw_data = _load_json_dataset("suspicious_keywords.json")
        flattened = []
        if isinstance(raw_data, dict):
            for category, words in raw_data.items():
                flattened.extend(words)
        else:
            flattened = raw_data
        _CACHE["suspicious_keywords"] = flattened
    return _CACHE["suspicious_keywords"]

def load_suspicious_domain_terms() -> list:
    if _CACHE["suspicious_domain_terms"] is None:
        _CACHE["suspicious_domain_terms"] = _load_json_dataset("suspicious_domain_terms.json")
    return _CACHE["suspicious_domain_terms"]
