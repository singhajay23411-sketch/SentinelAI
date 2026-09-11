"""
SentinelAI Enterprise - Collection Accessors
Named accessors for all enterprise MongoDB collections with index definitions.
Write ownership: FastAPI enterprise backend only.
"""

import logging
from enterprise.db.connection import get_db

logger = logging.getLogger(__name__)

# ─── Collection Names ─────────────────────────────────────────────────────────
ORGANIZATIONS    = "organizations"
BUSINESS_UNITS   = "business_units"
ASSETS           = "assets"
BUSINESS_SERVICES = "business_services"
EVIDENCE         = "evidence"
CONTROLS         = "controls"
RISK_SCENARIOS   = "risk_scenarios"
ASSESSMENTS      = "assessments"
SIMULATIONS      = "simulations"
OPTIMIZATION_RUNS = "optimization_runs"
MITIGATION_CATALOGUE = "mitigation_catalogue"
FRAMEWORK_MAPPINGS = "framework_mappings"
REPORTS          = "reports"
AUDIT_EVENTS     = "audit_events"
JOB_QUEUE        = "job_queue"
USERS            = "users"
ORG_MEMBERS      = "org_members"

# ─── Accessors ───────────────────────────────────────────────────────────────

def col(name: str):
    """Return a collection handle by name."""
    return get_db()[name]

def organizations():    return get_db()[ORGANIZATIONS]
def business_units():   return get_db()[BUSINESS_UNITS]
def assets():           return get_db()[ASSETS]
def business_services(): return get_db()[BUSINESS_SERVICES]
def evidence():         return get_db()[EVIDENCE]
def controls():         return get_db()[CONTROLS]
def risk_scenarios():   return get_db()[RISK_SCENARIOS]
def assessments():      return get_db()[ASSESSMENTS]
def simulations():      return get_db()[SIMULATIONS]
def optimization_runs(): return get_db()[OPTIMIZATION_RUNS]
def mitigation_catalogue(): return get_db()[MITIGATION_CATALOGUE]
def framework_mappings(): return get_db()[FRAMEWORK_MAPPINGS]
def reports():          return get_db()[REPORTS]
def audit_events():     return get_db()[AUDIT_EVENTS]
def job_queue():        return get_db()[JOB_QUEUE]
def users():            return get_db()[USERS]
def org_members():      return get_db()[ORG_MEMBERS]


# ─── Index Initialization ────────────────────────────────────────────────────

def init_indexes():
    """Create all required indexes. Idempotent — safe to call on startup."""
    db = get_db()
    try:
        # Users
        db[USERS].create_index("email", unique=True)
        db[USERS].create_index("org_id")

        # Org members
        db[ORG_MEMBERS].create_index([("org_id", 1), ("user_id", 1)], unique=True)

        # Assets
        db[ASSETS].create_index([("org_id", 1), ("internal_id", 1)], unique=True)
        db[ASSETS].create_index([("org_id", 1), ("asset_type", 1)])

        # Business units
        db[BUSINESS_UNITS].create_index([("org_id", 1)])

        # Business services
        db[BUSINESS_SERVICES].create_index([("org_id", 1)])

        # Evidence
        db[EVIDENCE].create_index([("org_id", 1), ("source_id", 1)])
        db[EVIDENCE].create_index([("org_id", 1), ("asset_id", 1)])
        db[EVIDENCE].create_index([("org_id", 1), ("status", 1)])
        db[EVIDENCE].create_index([("org_id", 1), ("ingestion_time", -1)])

        # Controls
        db[CONTROLS].create_index([("org_id", 1)])

        # Risk scenarios
        db[RISK_SCENARIOS].create_index([("org_id", 1)])

        # Assessments (immutable snapshots — never deleted)
        db[ASSESSMENTS].create_index([("org_id", 1), ("created_at", -1)])
        db[ASSESSMENTS].create_index([("org_id", 1), ("is_latest", 1)])

        # Simulations
        db[SIMULATIONS].create_index([("org_id", 1), ("created_at", -1)])

        # Optimization runs
        db[OPTIMIZATION_RUNS].create_index([("org_id", 1), ("created_at", -1)])

        # Audit events
        db[AUDIT_EVENTS].create_index([("org_id", 1), ("timestamp", -1)])

        # Job queue
        db[JOB_QUEUE].create_index([("org_id", 1), ("status", 1)])
        db[JOB_QUEUE].create_index("created_at")

        # Mitigation catalogue
        db[MITIGATION_CATALOGUE].create_index([("org_id", 1)])

        logger.info("Enterprise MongoDB indexes initialized.")
    except Exception as exc:
        logger.error(f"Failed to initialize indexes: {exc}")
        raise
