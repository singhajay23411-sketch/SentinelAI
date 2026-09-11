"""
SentinelAI Enterprise - Analytics & Monitoring API Routes
Endpoints for risk trends, posture anomaly alerts, and forward-looking forecasts.
"""

from fastapi import APIRouter, Depends, Query

from enterprise.auth.dependencies import get_current_user, get_current_org_id, TokenData
from enterprise.analytics.trend import get_risk_trend
from enterprise.analytics.anomaly import detect_posture_anomalies
from enterprise.analytics.forecaster import forecast_risk_posture

router = APIRouter(prefix="/enterprise/analytics", tags=["Risk Analytics & Trends"])


@router.get("/trend")
def get_trend(
    limit: int = Query(12, ge=2, le=36),
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Retrieve historical time-series of Expected Annual Loss and 95% VaR."""
    return get_risk_trend(org_id=org_id, limit=limit)


@router.get("/anomalies")
def get_anomalies(
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Detect posture degradation signals and risk concentrations across assets."""
    return {"anomalies": detect_posture_anomalies(org_id=org_id)}


@router.get("/forecast")
def get_forecast(
    horizon_months: int = Query(3, ge=1, le=12),
    org_id: str = Depends(get_current_org_id),
    current_user: TokenData = Depends(get_current_user),
):
    """Retrieve forward-looking risk trajectory under status quo vs planned mitigations."""
    return forecast_risk_posture(org_id=org_id, horizon_months=horizon_months)
