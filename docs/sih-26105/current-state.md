# SentinelAI - Repository Audit: Current State
Audit Date: 2026-09-11
Purpose: Honest baseline for SIH-26105 expansion

## 1. Repository Structure

SentinelAI/
- ai-engine/              Legacy MVP FastAPI service (port 8000)
- backend/                Node.js/Express API (port 5000)
- datasets/               Minimal root-level datasets (stale; superseded)
- docs/sih-26105/         [NEW] This audit and planning docs
- frontend/               React 19 + Vite + Tailwind v4 SPA
- playstore-service/      Primary Python FastAPI service (port 8080)
- venv/                   Python virtual environment

## 2. Working Capabilities (Verified by Source Inspection)

### Python FastAPI Service (playstore-service/main.py, port 8080)

WORKING:
- GET /health
- POST /analyze-playstore-app (scrapes Google Play, runs IntelligenceEngine, calls Gemini)
- POST /manual-analysis (routes through IntelligenceEngine)
- POST /analyze-website (domain checks via IntelligenceEngine Layer 6)
- POST /api/v1/scans/upload-ticket (creates upload ticket in in-memory _scans_db)
- PUT /api/v1/scans/upload/{id} (writes streamed APK bytes to disk)
- POST /api/v1/scans/trigger (SHA-256, MongoDB cache check, starts background task)
- GET /api/v1/scans/status/{id} (returns in-memory task progress)
- GET /api/v1/scans/results/{id} (returns completed results)

CRITICAL LIMITATIONS:
- _scans_db is in-process memory; APK scan state is lost on restart
- BackgroundTasks does not survive restarts
- GEMINI_API_KEY is committed in plain text in playstore-service/.env - MUST ROTATE

### Frontend (React 19 / Vite, frontend/)

ALL COMPLETE:
- Landing page (SentinelAI.jsx)
- Dashboard (Dashboard.jsx, 113 KB)
- Scan hub (ScannApp.jsx, 38 KB)
- Play Store scanner, Manual verification, APK scanner, Website analyzer
- Scan results, Scan history, Flagged Apps, Threat Intelligence
- All routes wired in App.jsx

API base URL: Reads from VITE_API_URL env var (defaults to http://161.118.177.73:8080)

### Node.js Backend (backend/, port 5000)

WORKING:
- Express server startup
- MongoDB connection with pooling and retry (requires MONGODB_URI)
- 6 Mongoose models registered (User, ApkScan, ApkReport, ScanHistory, FlaggedApp, ThreatIntelligence)
- GET /health endpoint

NOT IMPLEMENTED:
- routes/ directory is EMPTY - no functional routes
- No authentication or authorization
- No session management

ASSESSMENT: Node backend is a skeleton. Zero functional routes beyond /health.

### Intelligence Engine (9 Layers - ALL WORKING)
L1: Brand recognition (RapidFuzz token-set ratio against trusted_apps.json)
L2: Developer verification (fuzzy match against trusted_developers.json)
L3: Package name verification (exact match against trusted_packages.json)
L4: Metadata verification (downloads + rating thresholds)
L5: Keyword analysis (suspicious_keywords.json substring scan)
L6: Domain intelligence (trusted domain list + suspicious terms)
L7: Trust score (additive signals 0-100)
L8: Threat score (weighted risk signals 0-100)
L9: Classification (status string from score combination)

SEMANTIC LIMITATIONS:
- Scores reflect identity metadata similarity, NOT calibrated incident probability
- MUST NOT be converted to rupee losses or used as enterprise VaR inputs directly

### Gemini Integration
- SDK: google-generativeai==0.8.6 (installed)
- Model: gemini-2.5-flash (configured)
- Status: Working when GEMINI_API_KEY is set
- SECURITY ISSUE: API key committed in playstore-service/.env

### Persistence
- SQLite (playstore-service/database/sentinelai.db): WORKING - stores scan history, dashboard stats
- MongoDB (Atlas via pymongo): PARTIAL - APK scan caching works; no enterprise models
- MongoDB (Mongoose, Node backend): PARTIAL - models registered; no write routes
- SQLite <-> MongoDB sync: NOT IMPLEMENTED

## 3. Partial Implementations

- playstore-service/api/dashboard_routes.py: Dashboard stats from SQLite only
- playstore-service/api/sync_routes.py: Export/import endpoint exists, sync never automated
- ai-engine/logo_detector.py: Placeholder - returns mock result
- backend/routes/: Empty directory

## 4. Dead / Duplicate Code

- ai-engine/ (entire service): Superseded by playstore-service/
- datasets/ (root level): Superseded by playstore-service/datasets/
- Multiple trace_*.py scripts in playstore-service/: Debug utilities, not production code

## 5. Mock Data and Simulations - HIGH RISK

LOCATION: frontend/Resourses/services/mockAnalyzers.js
CONTENT: Client-side fallback simulation generating random threat scores, fake issues, fake developer names when live API fails
RISK: HIGH - currently masks live failures with invented data. Violates engineering principle 6.

## 6. Authentication and Authorization - ALL MISSING

- User registration/login: No endpoints
- JWT or session tokens: Not implemented
- Role-based access control: Not implemented
- Organization scoping: Not implemented
- Demo vs real data isolation: Not implemented

User Mongoose model exists but no routes use it.

## 7. What Does NOT Exist Yet (Required for SIH-26105)

- Enterprise data model (organizations, business units, assets, controls, scenarios)
- Financial risk engine (EAL, VaR, Monte Carlo)
- What-if simulation framework
- Budget optimization engine
- Continuous assessment / durable job queue
- Framework mappings (ISO 27001, NIST CSF, CIS Controls, RBI, SEBI)
- Ingestion pipeline / connectors
- Multi-tenant authentication and RBAC
- Executive and technical dashboards for enterprise risk
- Report generation (PDF / structured export)
- AI-grounded natural language query interface
- Predictive / trend analytics
- Demo fixture data (Sentinel Demo Financial Services)

## 8. Key Risks and Blockers

- CRITICAL: GEMINI_API_KEY committed in .env - Rotate key; add to .gitignore
- HIGH: Mock data masks live failures silently - Add explicit error states
- HIGH: No auth/RBAC - Milestone 1 priority
- MEDIUM: In-process APK job state lost on restart - Implement durable queue in Milestone 5
- MEDIUM: Node backend has no functional routes - FastAPI as primary; Node deprecated
- MEDIUM: SQLite not suitable for multi-org enterprise - MongoDB as enterprise truth
