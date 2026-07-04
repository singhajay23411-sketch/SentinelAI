"""
Central Risk Engine and API Gateway for SentinelAI.
Exposes FastAPI endpoints to analyze app risk and check service health.
"""

import logging
# pyrefly: ignore [missing-import]
import uvicorn
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, status
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field

# Import detectors
from name_detector import analyze_app_name
from text_detector import analyze_description
# logo_detector is not currently integrated, but imported for future use
from logo_detector import analyze_logo

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("SentinelAI")

app = FastAPI(
    title="SentinelAI AI Engine",
    description="Hackathon MVP for detecting fake/look-alike investment applications.",
    version="1.0.0"
)

# --- Pydantic Models ---

class AnalysisRequest(BaseModel):
    app_name: str = Field(
        ..., 
        description="The name of the application to analyze",
        json_schema_extra={"example": "Groww Wealth Pro"}
    )
    description: str = Field(
        ..., 
        description="The description of the application to analyze",
        json_schema_extra={"example": "Guaranteed returns and risk free income."}
    )

class NameAnalysis(BaseModel):
    matched_app: str | None = Field(None, description="The closest matching trusted app name")
    similarity_score: int = Field(..., description="The name similarity score (0-100)")
    risk_score: int = Field(..., description="The calculated risk score for name similarity")
    reason: str = Field(..., description="Justification for the similarity score")

class DescriptionAnalysis(BaseModel):
    risk_score: int = Field(..., description="The calculated risk score for description claims")
    matched_keywords: list[str] = Field(..., description="List of detected suspicious keywords")
    reason: str = Field(..., description="Justification for the description risk score")

class AnalysisResponse(BaseModel):
    app_name: str = Field(..., description="The name of the analyzed application")
    final_risk_score: int = Field(..., description="Combined final risk score (0-100)")
    status: str = Field(..., description="Safety status: Safe, Suspicious, or High Risk")
    name_analysis: NameAnalysis = Field(..., description="Detailed name similarity analysis")
    description_analysis: DescriptionAnalysis = Field(..., description="Detailed description analysis")

class HealthCheckResponse(BaseModel):
    status: str = Field(..., description="The current status of the service")


# --- Helper Functions ---

def determine_status(risk_score: int) -> str:
    """
    Determines status label based on risk score.
    0-30   -> Safe
    31-60  -> Suspicious
    61-100 -> High Risk
    """
    if risk_score <= 30:
        return "Safe"
    elif risk_score <= 60:
        return "Suspicious"
    else:
        return "High Risk"


# --- API Endpoints ---

@app.get(
    "/health", 
    response_model=HealthCheckResponse, 
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check if the API server is running."
)
async def health_check() -> dict:
    """
    Returns the current health status of the microservice.
    """
    return {"status": "running"}


@app.post(
    "/analyze", 
    response_model=AnalysisResponse, 
    status_code=status.HTTP_200_OK,
    summary="Analyze Investment Application",
    description="Performs name similarity check and description text analysis to calculate risk."
)
async def analyze_app(request: AnalysisRequest) -> dict:
    """
    Accepts app metadata and runs name and description risk analysis.
    """
    try:
        logger.info(f"Received analysis request for app: '{request.app_name}'")
        
        # 1. Run Name Similarity Detection
        name_result = analyze_app_name(request.app_name)
        
        # 2. Run Description Analysis
        desc_result = analyze_description(request.description)
        
        # Extract individual risk scores
        name_risk = name_result["risk_score"]
        text_risk = desc_result["risk_score"]
        
        # 3. Central Risk Combination
        # Formula: final_score = (name_risk * 0.6) + (text_risk * 0.4)
        final_score_raw = (name_risk * 0.6) + (text_risk * 0.4)
        final_score = int(round(final_score_raw))
        
        # Determine overall safety status
        safety_status = determine_status(final_score)
        
        # Build Response payload matching AnalysisResponse schema
        response_payload = {
            "app_name": request.app_name,
            "final_risk_score": final_score,
            "status": safety_status,
            "name_analysis": {
                "matched_app": name_result["matched_app"],
                "similarity_score": name_result["similarity_score"],
                "risk_score": name_result["risk_score"],
                "reason": name_result["reason"]
            },
            "description_analysis": {
                "risk_score": desc_result["risk_score"],
                "matched_keywords": desc_result["matched_keywords"],
                "reason": desc_result["reason"]
            }
        }
        
        logger.info(f"Analysis completed for '{request.app_name}'. Final Risk Score: {final_score} ({safety_status})")
        return response_payload
        
    except Exception as e:
        logger.error(f"Error occurred during analysis: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred inside the central risk engine while analyzing the application."
        )


if __name__ == "__main__":
    # Task 6: uvicorn runner when file is executed directly.
    print("Starting SentinelAI central risk engine...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
