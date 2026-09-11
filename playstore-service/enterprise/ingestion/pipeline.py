"""
SentinelAI Enterprise - Ingestion Pipeline
Central orchestrator for all data normalization, deduplication, asset linking,
provenance storage, and job auditing.
"""

import logging
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime

from enterprise.ingestion.base import NormalizationAdapter, IngestionBatchResult
from enterprise.ingestion.asset_csv import AssetCSVAdapter
from enterprise.ingestion.vuln_csv import VulnCSVAdapter
from enterprise.ingestion.iam_csv import IAMCSVAdapter
from enterprise.ingestion.siem_csv import SIEMCSVAdapter
from enterprise.ingestion.scanner_findings import ScannerFindingsAdapter
import enterprise.db.collections as cols
from enterprise.models.job import JobType, JobStatus

logger = logging.getLogger(__name__)

ADAPTERS: Dict[str, NormalizationAdapter] = {
    "asset_csv": AssetCSVAdapter(),
    "vuln_csv": VulnCSVAdapter(),
    "iam_csv": IAMCSVAdapter(),
    "siem_csv": SIEMCSVAdapter(),
    "scanner_findings": ScannerFindingsAdapter(),
}


def get_adapter(source_type: str) -> Optional[NormalizationAdapter]:
    return ADAPTERS.get(source_type)


def list_available_adapters() -> List[Dict[str, Any]]:
    return [
        {
            "source_type": key,
            "description": adapter.description,
            "required_headers": adapter.required_headers,
        }
        for key, adapter in ADAPTERS.items()
    ]


def run_ingestion_pipeline(
    source_type: str,
    raw_data: Any,
    org_id: str,
    triggered_by: str = "manual_upload"
) -> Dict[str, Any]:
    """
    Executes the ingestion pipeline:
    1. Adapter normalization
    2. Asset linking & deduplication
    3. Storage in MongoDB (upsert to prevent duplicate inflation)
    4. Audit job record creation
    """
    adapter = get_adapter(source_type)
    if not adapter:
        raise ValueError(f"Unknown ingestion source_type '{source_type}'. Available: {list(ADAPTERS.keys())}")

    job_id = f"job-{uuid.uuid4()}"
    now = datetime.utcnow()

    # Step 1: Normalize
    batch_result: IngestionBatchResult = adapter.normalize(raw_data=raw_data, org_id=org_id)

    inserted_count = 0
    updated_count = 0
    unchanged_count = 0

    # Determine destination collection
    if source_type == "asset_csv":
        target_collection = cols.assets()
    else:
        target_collection = cols.evidence()

    # Step 2 & 3: Deduplicate & Upsert records
    for record in batch_result.valid_records:
        rec_id = record["_id"]
        # Use update_one with upsert
        # If exists, update updated_at and status/severity if changed
        res = target_collection.update_one(
            {"_id": rec_id},
            {
                "$set": {k: v for k, v in record.items() if k not in ("_id", "created_at")},
                "$setOnInsert": {"_id": rec_id, "created_at": record.get("created_at", now)},
            },
            upsert=True,
        )
        if res.upserted_id is not None:
            inserted_count += 1
        elif res.modified_count > 0:
            updated_count += 1
        else:
            unchanged_count += 1

    # Step 4: Record Job in database
    job_record = {
        "_id": job_id,
        "org_id": org_id,
        "job_type": JobType.evidence_ingest.value,
        "status": JobStatus.completed.value if batch_result.rejected_count == 0 else JobStatus.completed.value,
        "payload": {
            "source_type": source_type,
            "source_integration": batch_result.source_integration,
            "triggered_by": triggered_by,
        },
        "result": {
            "total_rows": batch_result.total_rows,
            "valid_count": batch_result.valid_count,
            "inserted": inserted_count,
            "updated": updated_count,
            "unchanged": unchanged_count,
            "rejected_count": batch_result.rejected_count,
            "rejected_rows": [r.dict() for r in batch_result.rejected_rows[:50]],  # Cap for document size
        },
        "retry_count": 0,
        "max_retries": 1,
        "created_at": now,
        "started_at": now,
        "completed_at": datetime.utcnow(),
    }

    try:
        cols.jobs().insert_one(job_record)
    except Exception as e:
        logger.warning(f"Could not persist job record to MongoDB: {e}")

    logger.info(
        f"Ingestion [{source_type}] completed for org {org_id}: "
        f"{inserted_count} new, {updated_count} updated, {batch_result.rejected_count} rejected."
    )

    return {
        "job_id": job_id,
        "source_type": source_type,
        "total_rows": batch_result.total_rows,
        "valid_count": batch_result.valid_count,
        "inserted": inserted_count,
        "updated": updated_count,
        "unchanged": unchanged_count,
        "rejected_count": batch_result.rejected_count,
        "rejected_rows": [r.dict() for r in batch_result.rejected_rows],
        "completed_at": datetime.utcnow().isoformat(),
    }
