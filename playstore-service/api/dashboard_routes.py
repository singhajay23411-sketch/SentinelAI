from fastapi import APIRouter, HTTPException
from services.history_service import get_dashboard_stats

router = APIRouter()

@router.get("/dashboard-stats")
async def dashboard_stats():
    """Retrieves the current dashboard statistics."""
    try:
        stats = get_dashboard_stats()
        if not stats:
            # Fallback to zeroed stats if table is empty
            return {
                "total_scans": 0,
                "safe_apps": 0,
                "medium_risk": 0,
                "high_risk": 0
            }
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
