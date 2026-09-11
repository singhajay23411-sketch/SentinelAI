# SentinelAI SIH-26105 - Target Architecture

## Decision: FastAPI as Primary Backend

RATIONALE:
- All functional scanners and numerical risk work already reside in Python (playstore-service)
- Node.js backend has zero functional routes beyond /health
- Python has scipy/numpy/scikit-learn available for the financial risk engine
- Avoiding duplicate auth, history, and risk calculation implementations

OUTCOME:
- playstore-service/ is renamed/expanded to the unified enterprise backend
- New enterprise modules are added as Python sub-packages within the same FastAPI app
- Node.js backend is RETAINED as-is for its MongoDB models (migration path) but no new functionality is added there
- Frontend continues to call the FastAPI service (port 8080)

## Target System Architecture

`
[React 19 + Vite Frontend] (:5173 dev / dist/ production)
         |
         | REST/JSON (VITE_API_URL)
         v
[FastAPI Enterprise Backend] (:8080)
  |
  +-- /enterprise/        Enterprise risk engine
  |     +-- /orgs         Organization & business unit CRUD
  |     +-- /assets       Asset inventory & dependencies
  |     +-- /services     Business service catalog
  |     +-- /evidence     Evidence ingestion & findings
  |     +-- /controls     Control library & effectiveness
  |     +-- /scenarios    Risk scenario modeling
  |     +-- /assessments  Assessment snapshots & history
  |     +-- /simulations  What-if simulation
  |     +-- /optimizer    Budget optimization
  |     +-- /frameworks   Framework mappings
  |     +-- /reports      Report generation
  |     +-- /jobs         Background job status
  |
  +-- /auth/              Authentication & organization access
  |     +-- /register, /login, /refresh, /logout
  |
  +-- /api/v1/            Existing scanner endpoints (preserved)
  |     +-- /scans/       APK upload workflow
  |
  +-- /analyze-playstore-app   (preserved)
  +-- /manual-analysis         (preserved)
  +-- /analyze-website         (preserved)
  +-- /health
  |
  +-- Background Job System
        (SQLite-backed queue for restartable jobs)
         |
         +-- Ingestion jobs
         +-- Risk reassessment jobs
         +-- Simulation/optimization jobs
         +-- Report generation jobs

[MongoDB Atlas]
  - Enterprise collections (organizations, assets, scenarios, assessments, etc.)
  - Scanner collections (apk_reports, scan_history - existing)
  - Authoritative write owner: FastAPI backend

[SQLite (local)]
  - Scanner scan history (existing, preserved)
  - Background job queue (new)
  - Used ONLY for scanner caching and job state, not enterprise truth

[Python Sub-packages in playstore-service/]
  enterprise/
    models/         Pydantic schemas (not Mongoose; Python-native)
    db/             PyMongo collection wrappers
    engine/         Financial risk calculation (pure functions, testable)
    ingestion/      Connector adapters and normalization pipeline
    simulation/     What-if scenario runner
    optimizer/      Budget optimization (enumeration or scipy.optimize)
    ai/             Gemini integration + query handler (reuses existing gemini_service.py)
    frameworks/     Framework mapping data and endpoint
    reporting/      Report assembly and PDF export (reportlab or weasyprint)
    jobs/           Durable background job queue
    auth/           JWT authentication and RBAC
    demo/           Demo fixture loader and reset logic
`

## MongoDB Collection Plan

Enterprise collections (NEW):
  organizations           - Multi-tenant root
  business_units          - Org-scoped
  assets                  - Inventory with stable IDs
  business_services       - Service catalog
  evidence               - Findings and observations (append-mostly)
  controls               - Control library and effectiveness
  risk_scenarios         - Scenario definitions
  assessments            - Immutable snapshots (never updated)
  simulations            - What-if runs (immutable)
  optimization_runs      - Budget optimizer results
  mitigation_catalogue   - Available mitigation actions
  framework_mappings     - Control-to-framework references
  reports                - Generated report records
  audit_events           - Security audit log
  job_queue              - Durable background jobs
  users                  - Authentication (replacing Node User model)
  org_members            - Organization membership and roles

Existing scanner collections (PRESERVED):
  apkreports             - APK scan cache (existing)
  apk_reports            - APK scan cache (existing alias)

## Security Architecture

- JWT tokens: Access (15 min) + Refresh (7 days)
- Organization scoping: enforced server-side on every query
- Demo org: isolated by org_id; reset does not touch other orgs
- No client-supplied org_id trusted for authorization
- Secrets: only via environment variables, never in code or logs
- Imported text: never interpreted as instructions by AI layer
- Rate limiting: on auth and upload endpoints
- Upload validation: magic bytes check, size limit on APK uploads

## Frontend Navigation (New + Existing)

Existing (PRESERVED under /external-threats):
  / (landing), /home, /dashboard, /scan-app, /flagged-apps, /threat-intelligence, /scan-history
  /scan/playstore, /scan/manual, /scan/apk, /scan/website, /scan/results/:id

New enterprise routes:
  /enterprise/overview        Executive Overview
  /enterprise/assets          Asset & Business Service inventory
  /enterprise/evidence        Evidence & Integrations
  /enterprise/risk-register   Risk Register
  /enterprise/simulator       Scenario Simulator
  /enterprise/planner         Investment Planner
  /enterprise/controls        Controls & Frameworks
  /enterprise/reports         Reports & Audit History
  /enterprise/settings        Organization Settings
  /login, /register
