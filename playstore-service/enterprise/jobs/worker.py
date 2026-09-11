"""
SentinelAI Enterprise - Durable Queue Worker
Picks jobs from the durable queue and executes their corresponding handler.
Ensures failed tasks are retried and captures execution telemetry.
"""

import time
import threading
import logging
from typing import Dict, Any, Optional

from enterprise.jobs.queue import dequeue_next_job, complete_job, fail_job

logger = logging.getLogger(__name__)

_worker_thread = None
_stop_event = threading.Event()


def handle_job(job: Dict[str, Any]) -> Dict[str, Any]:
    """Dispatches job payload to the appropriate subsystem handler."""
    job_type = job["job_type"]
    org_id = job["org_id"]
    payload = job["payload"]

    if job_type == "evidence_ingest":
        from enterprise.ingestion.pipeline import run_ingestion_pipeline
        return run_ingestion_pipeline(
            source_type=payload["source_type"],
            raw_data=payload["raw_data"],
            org_id=org_id,
            triggered_by=f"durable_job:{job['id']}",
        )

    elif job_type == "risk_reassess":
        from enterprise.engine.assessment_builder import create_assessment_snapshot
        return create_assessment_snapshot(
            org_id=org_id,
            triggered_by=payload.get("triggered_by", "incremental_reassess"),
            num_iterations=payload.get("num_iterations", 5_000),
            seed=payload.get("seed", 42),
        )

    elif job_type == "simulation_run":
        from enterprise.simulation.simulator import run_what_if_simulation
        from enterprise.simulation.models import Intervention
        interventions = [Intervention(**i) for i in payload.get("interventions", [])]
        return run_what_if_simulation(
            org_id=org_id,
            name=payload.get("name", "Queued What-If"),
            description=payload.get("description", ""),
            interventions=interventions,
            seed=payload.get("seed", 42),
            num_iterations=payload.get("num_iterations", 5_000),
        )

    elif job_type == "apk_scan":
        # Migrated APK scan handler
        from apk_analyzer import analyze_apk
        file_path = payload.get("file_path")
        result = analyze_apk(file_path)
        # Ingest finding into evidence collection
        from enterprise.ingestion.scanner_findings import ScannerFindingsAdapter
        from enterprise.ingestion.pipeline import run_ingestion_pipeline
        run_ingestion_pipeline(
            source_type="scanner_findings",
            raw_data=result,
            org_id=org_id,
            triggered_by=f"apk_scan:{job['id']}"
        )
        return {"scan_id": job["id"], "result_summary": result.get("risk_score", 0)}

    else:
        raise ValueError(f"Unknown job_type: {job_type}")


def process_one_job() -> bool:
    """Dequeues and executes a single job. Returns True if a job was processed, False if queue empty."""
    job = dequeue_next_job()
    if not job:
        return False

    job_id = job["id"]
    logger.info(f"Worker processing job {job_id} ({job['job_type']})...")
    try:
        res = handle_job(job)
        complete_job(job_id, res if isinstance(res, dict) else {"status": "ok"})
        return True
    except Exception as e:
        logger.exception(f"Worker failed executing job {job_id}: {e}")
        fail_job(job_id, str(e))
        return True


def _worker_loop():
    logger.info("Durable Queue Worker background thread started.")
    while not _stop_event.is_set():
        try:
            processed = process_one_job()
            if not processed:
                _stop_event.wait(timeout=2.0)
        except Exception as e:
            logger.error(f"Worker loop uncaught error: {e}")
            _stop_event.wait(timeout=5.0)
    logger.info("Durable Queue Worker background thread stopped.")


def start_worker_thread():
    global _worker_thread
    if _worker_thread is None or not _worker_thread.is_alive():
        _stop_event.clear()
        _worker_thread = threading.Thread(target=_worker_loop, daemon=True, name="SentinelAI-JobWorker")
        _worker_thread.start()


def stop_worker_thread():
    global _worker_thread
    _stop_event.set()
    if _worker_thread and _worker_thread.is_alive():
        _worker_thread.join(timeout=3.0)
        _worker_thread = None
