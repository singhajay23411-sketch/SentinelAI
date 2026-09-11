"""
SentinelAI Enterprise - Ingestion and Evidence Routes
API endpoints for data ingestion, adapter discovery, connector health,
and evidence inventory querying.
"""

import os
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Body

from enterprise.auth.dependencies import get_current_user, require_role, get_current_org_id
from enterprise.auth.models import Role, TokenData
from enterprise.ingestion.pipeline import (
    run_ingestion_pipeline,
    list_available_adapters,
    get_adapter,
)
import enterprise.db.collections as cols

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enterprise", tags=["Enterprise Ingestion & Evidence"])


@router.get("/ingest/adapters")
def get_adapters(current_user: TokenData = Depends(get_current_user)):
    """List all registered ingestion adapters and their expected input schemas."""
    return {"adapters": list_available_adapters()}


@router.post("/ingest/{source_type}")
async def ingest_data(
    source_type: str,
    file: Optional[UploadFile] = File(None),
    raw_csv: Optional[str] = Body(None, embed=True),
    current_user: TokenData = Depends(require_role(Role.analyst)),
    org_id: str = Depends(get_current_org_id),
):
    """
    Ingest data via CSV file upload or raw CSV string body.
    Normalized, deduplicated, and audited under the current user's organization.
    """
    adapter = get_adapter(source_type)
    if not adapter:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown source_type '{source_type}'. Use GET /enterprise/ingest/adapters to see valid options."
        )

    content: str = ""
    if file:
        file_bytes = await file.read()
        try:
            content = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            content = file_bytes.decode("latin-1")
    elif raw_csv:
        content = raw_csv
    else:
        raise HTTPException(
            status_code=400,
            detail="Must provide either a file upload or 'raw_csv' in request body."
        )

    try:
        summary = run_ingestion_pipeline(
            source_type=source_type,
            raw_data=content,
            org_id=org_id,
            triggered_by=f"user:{current_user.user_id}"
        )
        return summary
    except Exception as e:
        logger.exception(f"Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest/sample/{source_type}")
def ingest_sample(
    source_type: str,
    current_user: TokenData = Depends(require_role(Role.analyst)),
    org_id: str = Depends(get_current_org_id),
):
    """
    Convenience endpoint to load one of the pre-packaged sample files.
    Ideal for SIH 2026 live demonstrations.
    """
    mapping = {
        "asset_csv": "assets.csv",
        "vuln_csv": "vulnerabilities.csv",
        "iam_csv": "iam_export.csv",
        "siem_csv": "siem_alerts.csv",
    }
    filename = mapping.get(source_type)
    if not filename:
        raise HTTPException(status_code=400, detail=f"No sample file for '{source_type}'. Valid: {list(mapping.keys())}")

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sample_path = os.path.join(base_dir, "demo", "sample_imports", filename)

    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail=f"Sample file {filename} not found on server.")

    with open(sample_path, "r", encoding="utf-8") as f:
        content = f.read()

    summary = run_ingestion_pipeline(
        source_type=source_type,
        raw_data=content,
        org_id=org_id,
        triggered_by=f"sample_demo:{source_type}"
    )
    return summary


@router.get("/ingest/jobs")
def list_ingestion_jobs(
    limit: int = Query(20, ge=1, le=100),
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """List recent ingestion jobs and audit manifests for this organization."""
    cursor = cols.jobs().find({"org_id": org_id}).sort("created_at", -1).limit(limit)
    jobs = []
    for doc in cursor:
        doc["id"] = doc.pop("_id")
        jobs.append(doc)
    return {"jobs": jobs}


@router.get("/connectors/health")
def get_connectors_health(
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """
    Returns telemetry on configured connectors, total ingested findings,
    last synchronization timestamps, and adapter status.
    """
    connectors = [
        {"id": "asset_csv", "name": "Asset Inventory CSV", "type": "batch_file", "category": "CMDB / Inventory"},
        {"id": "vuln_csv", "name": "Vulnerability Scanner Export", "type": "batch_file", "category": "Vulnerability Management"},
        {"id": "iam_csv", "name": "IAM & Directory Export", "type": "batch_file", "category": "Identity & Access"},
        {"id": "siem_csv", "name": "SIEM & SOC Alert Export", "type": "batch_file", "category": "Security Monitoring"},
        {"id": "scanner_findings", "name": "SentinelAI Built-in Scanners", "type": "internal_engine", "category": "Application Security"},
    ]

    telemetry = []
    for conn in connectors:
        count = cols.evidence().count_documents({"org_id": org_id, "source_integration": conn["id"]})
        if conn["id"] == "asset_csv":
            count = cols.assets().count_documents({"org_id": org_id, "source_integration": "asset_csv"})

        last_job = cols.jobs().find_one(
            {"org_id": org_id, "payload.source_type": conn["id"]},
            sort=[("created_at", -1)]
        )

        telemetry.append({
            **conn,
            "record_count": count,
            "status": "active" if count > 0 or last_job else "ready",
            "last_sync": last_job["completed_at"].isoformat() if last_job and "completed_at" in last_job else None,
            "last_status": last_job.get("status") if last_job else "idle",
        })

    return {"connectors": telemetry, "org_id": org_id}


@router.get("/evidence")
def list_evidence(
    asset_id: Optional[str] = None,
    finding_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """
    Query normalized evidence records with multi-dimensional filtering.
    """
    query: dict = {"org_id": org_id}
    if asset_id:
        query["asset_id"] = asset_id
    if finding_type:
        query["finding_type"] = finding_type
    if severity:
        query["severity"] = severity
    if status:
        query["status"] = status

    total = cols.evidence().count_documents(query)
    cursor = cols.evidence().find(query).sort("observation_time", -1).skip(offset).limit(limit)

    records = []
    for doc in cursor:
        doc["id"] = doc.pop("_id")
        records.append(doc)

    return {
        "evidence": records,
        "total": total,
        "limit": limit,
        "offset": offset,
    }
