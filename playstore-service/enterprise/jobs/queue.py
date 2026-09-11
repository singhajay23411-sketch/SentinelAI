"""
SentinelAI Enterprise - Durable SQLite Job Queue
Provides crash-resilient, restart-persistent background task processing.
Jobs survive server process termination and automatically recover on startup.
"""

import os
import json
import uuid
import sqlite3
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

DEFAULT_DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "database",
    "enterprise_jobs.db"
)


def _get_connection(db_path: str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn


def init_job_db(db_path: str = DEFAULT_DB_PATH):
    """Creates the durable_jobs table and indexes if not present."""
    with _get_connection(db_path) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS durable_jobs (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                job_type TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                retry_count INTEGER NOT NULL DEFAULT 0,
                max_retries INTEGER NOT NULL DEFAULT 3,
                created_at TEXT NOT NULL,
                started_at TEXT,
                completed_at TEXT,
                result_json TEXT,
                error_message TEXT
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_durable_jobs_status ON durable_jobs (status, created_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_durable_jobs_org ON durable_jobs (org_id)")
        conn.commit()


def enqueue_job(
    org_id: str,
    job_type: str,
    payload: Dict[str, Any],
    max_retries: int = 3,
    db_path: str = DEFAULT_DB_PATH,
) -> str:
    """Enqueues a new background job into durable storage."""
    init_job_db(db_path)
    job_id = f"job-{uuid.uuid4()}"
    now_iso = datetime.now(timezone.utc).isoformat()

    with _get_connection(db_path) as conn:
        conn.execute(
            """
            INSERT INTO durable_jobs (
                id, org_id, job_type, payload_json, status,
                retry_count, max_retries, created_at
            ) VALUES (?, ?, ?, ?, 'pending', 0, ?, ?)
            """,
            (job_id, org_id, job_type, json.dumps(payload), max_retries, now_iso),
        )
        conn.commit()

    logger.info(f"Enqueued durable job {job_id} of type '{job_type}' for org {org_id}")
    return job_id


def dequeue_next_job(db_path: str = DEFAULT_DB_PATH) -> Optional[Dict[str, Any]]:
    """
    Atomically retrieves and transitions the oldest pending job to 'running'.
    Returns None if queue is empty.
    """
    init_job_db(db_path)
    now_iso = datetime.now(timezone.utc).isoformat()

    with _get_connection(db_path) as conn:
        cursor = conn.execute(
            """
            SELECT id, org_id, job_type, payload_json, retry_count, max_retries
            FROM durable_jobs
            WHERE status = 'pending'
            ORDER BY created_at ASC
            LIMIT 1
            """
        )
        row = cursor.fetchone()
        if not row:
            return None

        job_id = row["id"]
        # Atomically mark running
        conn.execute(
            "UPDATE durable_jobs SET status = 'running', started_at = ? WHERE id = ? AND status = 'pending'",
            (now_iso, job_id)
        )
        conn.commit()

        return {
            "id": job_id,
            "org_id": row["org_id"],
            "job_type": row["job_type"],
            "payload": json.loads(row["payload_json"]),
            "retry_count": row["retry_count"],
            "max_retries": row["max_retries"],
        }


def complete_job(job_id: str, result: Dict[str, Any], db_path: str = DEFAULT_DB_PATH):
    """Marks a running job as completed and records results."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with _get_connection(db_path) as conn:
        conn.execute(
            """
            UPDATE durable_jobs
            SET status = 'completed', completed_at = ?, result_json = ?
            WHERE id = ?
            """,
            (now_iso, json.dumps(result), job_id)
        )
        conn.commit()
    logger.info(f"Durable job {job_id} marked COMPLETED")


def fail_job(job_id: str, error_message: str, db_path: str = DEFAULT_DB_PATH):
    """Marks job as failed or schedules retry if retries remaining."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with _get_connection(db_path) as conn:
        cursor = conn.execute("SELECT retry_count, max_retries FROM durable_jobs WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        if row and row["retry_count"] < row["max_retries"]:
            # Schedule retry
            conn.execute(
                """
                UPDATE durable_jobs
                SET status = 'pending', retry_count = retry_count + 1, error_message = ?
                WHERE id = ?
                """,
                (f"Retry {row['retry_count'] + 1}: {error_message}", job_id)
            )
            logger.warning(f"Durable job {job_id} failed; retrying ({row['retry_count'] + 1}/{row['max_retries']})")
        else:
            conn.execute(
                """
                UPDATE durable_jobs
                SET status = 'failed', completed_at = ?, error_message = ?
                WHERE id = ?
                """,
                (now_iso, error_message, job_id)
            )
            logger.error(f"Durable job {job_id} permanently FAILED: {error_message}")
        conn.commit()


def recover_stalled_jobs(db_path: str = DEFAULT_DB_PATH) -> int:
    """
    On server startup, resets in-flight jobs that were interrupted by a crash.
    Transitions 'running' -> 'pending'.
    """
    init_job_db(db_path)
    with _get_connection(db_path) as conn:
        cursor = conn.execute(
            "UPDATE durable_jobs SET status = 'pending' WHERE status = 'running'"
        )
        recovered = cursor.rowcount
        conn.commit()
    if recovered > 0:
        logger.warning(f"Durable Queue recovered {recovered} interrupted jobs after restart.")
    return recovered


def get_queue_stats(org_id: Optional[str] = None, db_path: str = DEFAULT_DB_PATH) -> Dict[str, Any]:
    """Returns status breakdown counts for the queue."""
    init_job_db(db_path)
    with _get_connection(db_path) as conn:
        if org_id:
            cursor = conn.execute(
                "SELECT status, count(*) as cnt FROM durable_jobs WHERE org_id = ? GROUP BY status",
                (org_id,)
            )
        else:
            cursor = conn.execute("SELECT status, count(*) as cnt FROM durable_jobs GROUP BY status")
        counts = {row["status"]: row["cnt"] for row in cursor.fetchall()}

    return {
        "pending": counts.get("pending", 0),
        "running": counts.get("running", 0),
        "completed": counts.get("completed", 0),
        "failed": counts.get("failed", 0),
        "total": sum(counts.values()),
    }
