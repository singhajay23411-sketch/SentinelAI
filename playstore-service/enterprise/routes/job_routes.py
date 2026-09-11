"""
SentinelAI Enterprise - Job Queue API Routes
Endpoints for monitoring and inspecting the durable SQLite background queue.
"""

from fastapi import APIRouter, Depends
from enterprise.auth.dependencies import get_current_user, get_current_org_id, require_role, TokenData
from enterprise.auth.models import Role
from enterprise.jobs.queue import get_queue_stats
from enterprise.jobs.worker import process_one_job

router = APIRouter(prefix="/enterprise/jobs", tags=["Durable Job Queue"])


@router.get("/queue")
def get_queue_status(
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Returns real-time status and throughput counts of the durable job queue."""
    stats = get_queue_stats(org_id=org_id)
    return {"queue_stats": stats, "org_id": org_id}


@router.post("/process-next")
def process_next_job_endpoint(
    current_user: TokenData = Depends(require_role(Role.admin)),
):
    """Manually triggers execution of the next queued job (useful for deterministic tests)."""
    processed = process_one_job()
    return {"processed": processed}
