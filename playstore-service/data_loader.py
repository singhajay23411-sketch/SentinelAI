import os
import json
import logging

logger = logging.getLogger(__name__)

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "datasets")

_CACHE = {
    "trusted_apps": None,
    "trusted_developers": None,
    "trusted_packages": None,
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

def load_trusted_apps() -> list:
    if _CACHE["trusted_apps"] is None:
        raw_data_fin = _load_json_dataset("trusted_apps.json")
        raw_data_shop = _load_json_dataset("trusted_shopping_apps.json")
        
        apps = []
        if isinstance(raw_data_fin, dict):
            apps.extend(raw_data_fin.keys())
        if isinstance(raw_data_shop, dict):
            apps.extend(raw_data_shop.keys())
            
        _CACHE["trusted_apps"] = list(set(apps))
    return _CACHE["trusted_apps"]

def load_trusted_developers() -> dict:
    if _CACHE["trusted_developers"] is None:
        devs = _load_json_dataset("trusted_developers.json")
        shop_devs = _load_json_dataset("trusted_shopping_developers.json")
        
        if isinstance(devs, dict) and isinstance(shop_devs, dict):
            # Merge dictionaries
            for app, dev_list in shop_devs.items():
                if app in devs:
                    devs[app] = list(set(devs[app] + dev_list))
                else:
                    devs[app] = dev_list
        elif isinstance(shop_devs, dict):
            devs = shop_devs
        elif not isinstance(devs, dict):
            devs = {}
            
        _CACHE["trusted_developers"] = devs
    return _CACHE["trusted_developers"]

def load_trusted_packages() -> dict:
    if _CACHE["trusted_packages"] is None:
        pkgs = _load_json_dataset("trusted_packages.json")
        shop_pkgs = _load_json_dataset("trusted_shopping_packages.json")
        
        if isinstance(pkgs, dict) and isinstance(shop_pkgs, dict):
            # Merge dictionaries
            for app, pkg_list in shop_pkgs.items():
                if app in pkgs:
                    pkgs[app] = list(set(pkgs[app] + pkg_list))
                else:
                    pkgs[app] = pkg_list
        elif isinstance(shop_pkgs, dict):
            pkgs = shop_pkgs
        elif not isinstance(pkgs, dict):
            pkgs = {}
            
        _CACHE["trusted_packages"] = pkgs
    return _CACHE["trusted_packages"]

def load_trusted_metadata() -> list:
    if not _CACHE.get("trusted_metadata"):
        meta = _load_json_dataset("trusted_metadata.json")
        shop_meta = _load_json_dataset("trusted_shopping_metadata.json")
        
        merged = []
        if isinstance(meta, list):
            merged.extend(meta)
        if isinstance(shop_meta, list):
            merged.extend(shop_meta)
            
        _CACHE["trusted_metadata"] = merged
    return _CACHE["trusted_metadata"]

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
