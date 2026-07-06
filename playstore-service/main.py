"""
SentinelAI Play Store Analysis API
====================================
FastAPI server exposing endpoints for Play Store app fraud analysis.

Endpoints:
    GET  /health                → Health check
    POST /analyze-playstore-app → Full Play Store app analysis
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from app_fetcher import run_full_analysis
from manual_analyzer import run_manual_analysis

# ─────────────────────────────────────────────
# App Initialization
# ─────────────────────────────────────────────

app = FastAPI(
    title="SentinelAI Play Store Analysis API",
    description="AI-powered fraud detection for Play Store applications",
    version="1.0.0",
)

# ─────────────────────────────────────────────
# TASK 9: CORS Configuration
# ─────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:3000",   # Fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    url: str = Field(..., description="Google Play Store app URL", examples=[
        "https://play.google.com/store/apps/details?id=com.upstox.app"
    ])

class ManualAnalysisRequest(BaseModel):
    app_name: str = Field(..., description="Name of the app")
    description: str = Field(..., description="App description or promotional text")
    developer: str = Field(default="", description="Developer name")
    website: str = Field(default="", description="App website URL")
    apk_link: str = Field(default="", description="Direct link to APK file")


# ─────────────────────────────────────────────
# TASK 11: Health Endpoint
# ─────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Returns server health status."""
    return {"status": "running"}


# ─────────────────────────────────────────────
# TASK 8: Play Store Analysis Endpoint
# ─────────────────────────────────────────────

@app.post("/analyze-playstore-app")
async def analyze_playstore_app(request: AnalyzeRequest):
    """
    Analyzes a Google Play Store app for fraud indicators.
    
    Accepts a Play Store URL, fetches app metadata, runs the
    AI analysis pipeline, and returns a structured risk report.
    """
    try:
        result = run_full_analysis(request.url)

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Analysis failed.")
            )

        return result

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# ─────────────────────────────────────────────
# TASK 12: Manual Verification Endpoint
# ─────────────────────────────────────────────

@app.post("/manual-analysis")
async def manual_analysis(request: ManualAnalysisRequest):
    """
    Analyzes a manually provided app for fraud indicators.
    """
    try:
        data = request.model_dump() if hasattr(request, 'model_dump') else request.dict()
        result = run_manual_analysis(data)

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Analysis failed.")
            )

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    print("Starting SentinelAI Play Store Analysis API...")
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)
