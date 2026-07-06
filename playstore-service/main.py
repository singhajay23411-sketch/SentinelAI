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
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from app_fetcher import run_full_analysis
from manual_analyzer import run_manual_analysis
from services.database_service import init_db
from services.history_service import save_scan
from api.history_routes import router as history_router
from api.dashboard_routes import router as dashboard_router
from api.sync_routes import router as sync_router

# ─────────────────────────────────────────────
# App Initialization
# ─────────────────────────────────────────────

app = FastAPI(
    title="SentinelAI Play Store Analysis API",
    description="AI-powered fraud detection for Play Store applications",
    version="1.0.0",
)

@app.on_event("startup")
async def startup_event():
    """Initialize the database on application startup."""
    init_db()

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

from fastapi import Request
@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.url.path == "/analyze-playstore-app":
        print(f"Incoming {request.method} request headers:")
        for k, v in request.headers.items():
            print(f"  {k}: {v}")
    response = await call_next(request)
    if request.url.path == "/analyze-playstore-app":
        print(f"Response status: {response.status_code}")
    return response

app.include_router(history_router)
app.include_router(dashboard_router)
app.include_router(sync_router)

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

        # Save to SQLite history
        scan_uuid = save_scan(result, scan_type="Play Store", source_user="LocalUser")
        result["id"] = scan_uuid
        return result

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# ─────────────────────────────────────────────
# APK Scanner Background Task & Endpoints
# ─────────────────────────────────────────────

import os
import hashlib
import time
from datetime import datetime
# pyrefly: ignore [missing-import]
import pymongo
from fastapi import Request, BackgroundTasks
from apk_analyzer import analyze_apk_file

# In-memory database of scan states
_scans_db = {}
_ticket_counter = 0

# MongoDB Connection Initialization
MONGODB_URI = os.environ.get("MONGODB_URI")
DATABASE_NAME = os.environ.get("DATABASE_NAME", "SentinelAI")

db_client = None
db = None

if MONGODB_URI:
    try:
        db_client = pymongo.MongoClient(
            MONGODB_URI,
            maxPoolSize=10,
            minPoolSize=2,
            serverSelectionTimeoutMS=5000
        )
        db = db_client[DATABASE_NAME]
        print(f"Python microservice connected to MongoDB database: {DATABASE_NAME}")
    except Exception as e:
        print(f"Python microservice failed to connect to MongoDB: {str(e)}")

def get_report_collection():
    if db is None:
        return None
    try:
        cols = db.list_collection_names()
        # Handle both Mongoose default pluralization and specified collection name
        if "apkreports" in cols and "apk_reports" not in cols:
            return db["apkreports"]
    except Exception:
        pass
    return db["apk_reports"]

def get_cached_scan(file_hash: str) -> dict:
    col = get_report_collection()
    if col is None:
        return None
    try:
        doc = col.find_one({"sha256": file_hash})
        if doc:
            if "_id" in doc:
                del doc["_id"]
            return doc
    except Exception as e:
        print(f"Failed to query MongoDB cache: {str(e)}")
    return None

def save_scan_to_mongodb(result: dict):
    col = get_report_collection()
    if col is None:
        return
    try:
        col.update_one(
            {"sha256": result["sha256"]},
            {"$set": result},
            upsert=True
        )
    except Exception as e:
        print(f"Failed to save report to MongoDB: {str(e)}")

def calculate_sha256(file_path: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def run_apk_scan_task(scan_id: str, file_path: str, file_hash: str, original_filename: str):
    try:
        # State: Validating
        _scans_db[scan_id]["status"] = "PROCESSING"
        _scans_db[scan_id]["progress"] = 25
        _scans_db[scan_id]["current_stage"] = "Validating File Structure"
        _scans_db[scan_id]["detail"] = "Verifying APK magic bytes and checking zip indexes."
        time.sleep(1.0)
        
        # State: Extracting
        _scans_db[scan_id]["progress"] = 50
        _scans_db[scan_id]["current_stage"] = "Extracting AndroidManifest.xml"
        _scans_db[scan_id]["detail"] = "Opening classes.dex and locating permission signatures."
        time.sleep(1.0)
        
        # State: Analyzing
        _scans_db[scan_id]["progress"] = 75
        _scans_db[scan_id]["current_stage"] = "Static Code Auditing"
        _scans_db[scan_id]["detail"] = "Applying weighted threat scoring models and checking brand signatures."
        time.sleep(1.0)
        
        # Real Analysis Execution
        result = analyze_apk_file(file_path, original_filename=original_filename)
        
        if result.get("success"):
            # Set deterministic values
            result["timestamp"] = datetime.utcnow()
            result["scan_id"] = f"apk_{file_hash}"
            result["sha256"] = file_hash
            
            # Cache the completed result to MongoDB
            save_scan_to_mongodb(result)
            
            _scans_db[scan_id]["status"] = "COMPLETED"
            _scans_db[scan_id]["progress"] = 100
            _scans_db[scan_id]["current_stage"] = "Scan Complete"
            _scans_db[scan_id]["detail"] = "Security report generated successfully."
            _scans_db[scan_id]["result"] = result
        else:
            _scans_db[scan_id]["status"] = "FAILED"
            _scans_db[scan_id]["progress"] = 100
            _scans_db[scan_id]["current_stage"] = "Scan Failed"
            _scans_db[scan_id]["detail"] = result.get("error", "Static analysis failed.")
            
    except Exception as e:
        _scans_db[scan_id]["status"] = "FAILED"
        _scans_db[scan_id]["progress"] = 100
        _scans_db[scan_id]["current_stage"] = "Scan Failed"
        _scans_db[scan_id]["detail"] = f"Internal processing error: {str(e)}"
    finally:
        # Background Cleanup: Delete the raw uploaded APK file from sandbox
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

class UploadTicketRequest(BaseModel):
    file_name: str
    file_size: int

@app.post("/api/v1/scans/upload-ticket")
def create_upload_ticket(request: UploadTicketRequest):
    global _ticket_counter
    _ticket_counter += 1
    scan_id = f"apk_ticket_{_ticket_counter}"
    file_path = os.path.join("uploads", f"{scan_id}.apk")
    
    _scans_db[scan_id] = {
        "status": "PENDING",
        "progress": 0,
        "current_stage": "Pending",
        "detail": "Waiting for file upload to start.",
        "file_path": file_path,
        "file_name": request.file_name,
        "result": None
    }
    
    return {
        "scan_id": scan_id,
        "upload_url": f"http://127.0.0.1:8080/api/v1/scans/upload/{scan_id}"
    }

@app.put("/api/v1/scans/upload/{scan_id}")
async def upload_apk_file(scan_id: str, request: Request):
    if scan_id not in _scans_db:
        raise HTTPException(status_code=404, detail="Upload ticket not found.")
    
    file_path = _scans_db[scan_id]["file_path"]
    
    try:
        os.makedirs("uploads", exist_ok=True)
        with open(file_path, "wb") as f:
            async for chunk in request.stream():
                f.write(chunk)
                
        _scans_db[scan_id]["status"] = "QUEUED"
        _scans_db[scan_id]["progress"] = 10
        _scans_db[scan_id]["current_stage"] = "File Uploaded"
        _scans_db[scan_id]["detail"] = "APK file uploaded, awaiting triggers."
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

class TriggerScanRequest(BaseModel):
    scan_id: str

@app.post("/api/v1/scans/trigger")
def trigger_apk_scan(request: TriggerScanRequest, background_tasks: BackgroundTasks):
    scan_id = request.scan_id
    if scan_id not in _scans_db:
        raise HTTPException(status_code=404, detail="Scan ID not found.")
    
    file_path = _scans_db[scan_id]["file_path"]
    original_filename = _scans_db[scan_id]["file_name"]
    
    # Calculate hash of the uploaded file
    try:
        file_hash = calculate_sha256(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate file hash: {str(e)}")
        
    _scans_db[scan_id]["hash"] = file_hash
    
    # Check cache in MongoDB
    cached_result = get_cached_scan(file_hash)
    if cached_result:
        # Cache hit! Copy the cached results immediately
        _scans_db[scan_id]["status"] = "COMPLETED"
        _scans_db[scan_id]["progress"] = 100
        _scans_db[scan_id]["current_stage"] = "Scan Complete"
        _scans_db[scan_id]["detail"] = "Security report retrieved from MongoDB cache (identical APK)."
        
        # When returning the result, map the cache result's timestamp to string if it is a datetime object
        if isinstance(cached_result.get("timestamp"), datetime):
            cached_result["timestamp"] = cached_result["timestamp"].strftime("%Y-%m-%dT%H:%M:%SZ")
            
        _scans_db[scan_id]["result"] = cached_result
        
        # Clean up uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        return {"scan_id": scan_id, "status": "COMPLETED"}
        
    # Cache miss. Enqueue background task
    _scans_db[scan_id]["status"] = "QUEUED"
    _scans_db[scan_id]["progress"] = 15
    _scans_db[scan_id]["current_stage"] = "Enqueued"
    _scans_db[scan_id]["detail"] = "Scan task enqueued in background thread pool."
    
    background_tasks.add_task(run_apk_scan_task, scan_id, file_path, file_hash, original_filename)
    return {"scan_id": scan_id, "status": "QUEUED"}

@app.get("/api/v1/scans/status/{scan_id}")
def get_scan_status(scan_id: str):
    if scan_id not in _scans_db:
        raise HTTPException(status_code=404, detail="Scan ID not found.")
    
    state = _scans_db[scan_id]
    return {
        "scan_id": scan_id,
        "status": state["status"],
        "progress": state["progress"],
        "current_stage": state["current_stage"],
        "detail": state["detail"]
    }

@app.get("/api/v1/scans/results/{scan_id}")
def get_scan_results(scan_id: str):
    if scan_id not in _scans_db:
        raise HTTPException(status_code=404, detail="Scan ID not found.")
    
    state = _scans_db[scan_id]
    if state["status"] != "COMPLETED" or not state["result"]:
        raise HTTPException(status_code=400, detail="Scan is not complete or failed.")
    
    result = state["result"]
    # Handle datetime serialization if it is a datetime object
    if isinstance(result.get("timestamp"), datetime):
        result["timestamp"] = result["timestamp"].strftime("%Y-%m-%dT%H:%M:%SZ")
        
    return result

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

        # Save to SQLite history
        scan_uuid = save_scan(result, scan_type="Manual Analysis", source_user="LocalUser")
        result["id"] = scan_uuid
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
