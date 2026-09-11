"""
SentinelAI Enterprise - Incremental Reassessment Scheduler & Debouncer
Debounces high-frequency evidence events before triggering full Monte Carlo reassessments.
Prevents pipeline thrashing during bulk ingestion jobs.
"""

import time
import logging
from typing import Dict
from enterprise.jobs.queue import enqueue_job, _get_connection, init_job_db

logger = logging.getLogger(__name__)

_last_evidence_timestamp: Dict[str, float] = {}


def trigger_debounced_reassessment(org_id: str, debounce_seconds: int = 15) -> bool:
    """
    Checks if a risk_reassess job is already pending for this org.
    If not, enqueues a new reassessment job.
    """
    init_job_db()
    now = time.time()
    _last_evidence_timestamp[org_id] = now

    # Check if a pending reassessment already exists
    with _get_connection() as conn:
        cursor = conn.execute(
            """
            SELECT count(*) as cnt FROM durable_jobs
            WHERE org_id = ? AND job_type = 'risk_reassess' AND status = 'pending'
            """,
            (org_id,)
        )
        if cursor.fetchone()["cnt"] > 0:
            logger.debug(f"Reassessment already pending for org {org_id}; skipping duplicate enqueue.")
            return False

    # Enqueue new reassessment
    enqueue_job(
        org_id=org_id,
        job_type="risk_reassess",
        payload={"triggered_by": "continuous_evidence_stream", "num_iterations": 5_000},
    )
    logger.info(f"Triggered incremental reassessment job for org {org_id}")
    return True
