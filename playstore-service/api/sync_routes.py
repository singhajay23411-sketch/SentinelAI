from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from services.sync_service import export_scans, import_scans

router = APIRouter()

class ImportRequest(BaseModel):
    records: List[Dict[str, Any]]

@router.get("/export-scans")
async def export_scans_route():
    """Exports all scans to JSON."""
    try:
        return export_scans()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import-scans")
async def import_scans_route(request: ImportRequest):
    """Imports scans from JSON, skipping duplicates."""
    try:
        result = import_scans(request.records)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
