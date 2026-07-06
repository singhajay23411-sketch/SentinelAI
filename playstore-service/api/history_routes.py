from fastapi import APIRouter, HTTPException
from services.history_service import get_scan_history

router = APIRouter()

@router.get("/scan-history")
async def scan_history():
    """Retrieves all scan history."""
    try:
        history = get_scan_history()
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
