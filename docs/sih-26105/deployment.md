# SentinelAI: Deployment & Operations Guide (SIH-26105)

This document provides complete instructions for installing, configuring, deploying, and operating the SentinelAI Enterprise Cyber Risk Quantification Platform.

---

## 1. System Requirements

### Hardware:
- **Processor:** 4 CPU cores (x86_64 or ARM64)
- **RAM:** Minimum 8 GB (16 GB recommended for 10,000-trial Monte Carlo parallelization)
- **Disk:** 20 GB SSD storage

### Software:
- **Operating System:** Linux (Ubuntu 22.04+), macOS (13+), or Windows 11 with PowerShell
- **Python:** Version 3.12 or newer
- **Node.js:** Version 20 LTS or newer (with npm 10+)
- **MongoDB:** Version 6.0 or 7.0 (or MongoDB Atlas cluster)
- **Docker:** Docker Engine 24+ and Docker Compose v2+ (optional for containerized setup)

---

## 2. Environment Variables Configuration

Create a `.env` file inside `playstore-service/` (do not commit this file to version control):

```bash
# ─── Database Configuration ─────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/SentinelAI
DATABASE_NAME=SentinelAI

# ─── Cryptographic & JWT Authentication ────────────────────────
# Generate a secure 32-byte secret key with:
# python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY=9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# ─── Durable Job Queue ──────────────────────────────────────────
# Stored inside playstore-service/database/enterprise_jobs.db
JOB_DB_PATH=database/enterprise_jobs.db

# ─── Google Gemini AI Copilot (Optional) ────────────────────────
# If omitted or invalid, SentinelAI activates the offline deterministic AI synthesizer
GEMINI_API_KEY=your_gemini_api_key_here
```

Inside `frontend/`:
```bash
# Point React to the backend API microservice
VITE_API_URL=http://localhost:8080
```

---

## 3. Quickstart Option A: Local Development Setup

### 1. Backend Service (FastAPI):
```bash
# Navigate to repository root
cd d:\Projects\SentinelAI

# Activate virtual environment
.\.venv\Scripts\activate  # On Linux/macOS: source .venv/bin/activate

# Install required packages
cd playstore-service
pip install -r requirements.txt

# Run database verification & demo fixture pre-seed
python -c "from enterprise.demo.loader import load_demo_fixture; load_demo_fixture()"

# Launch server with hot reload
python main.py
# Server listening on: http://127.0.0.1:8080
# Interactive API documentation: http://127.0.0.1:8080/docs
```

### 2. Frontend Application (Vite + React 19):
```bash
# Open a new terminal
cd d:\Projects\SentinelAI\frontend

# Install Node modules
npm install

# Start Vite dev server
npm run dev
# Application running at: http://localhost:5173
```

---

## 4. Quickstart Option B: Single-Command Docker Deployment

To launch the complete three-tier architecture (MongoDB + FastAPI + React SPA via Nginx):

```bash
cd d:\Projects\SentinelAI

# Build and launch all containers in detached mode
docker-compose up --build -d

# Verify container health
docker-compose ps
```

| Service | Container Name | Host Port | Internal Port | Health Check URL |
|---|---|---|---|---|
| **MongoDB** | `sentinelai_mongo` | `27017` | `27017` | `mongosh --eval "db.adminCommand('ping')"` |
| **FastAPI Backend** | `sentinelai_backend` | `8080` | `8080` | `http://localhost:8080/health` |
| **Frontend UI** | `sentinelai_frontend` | `80` (or `5173`) | `80` | `http://localhost:80` |

To shut down the environment:
```bash
docker-compose down
```
*(Data in MongoDB persists in the Docker volume `sentinelai_mongo-data`).*

---

## 5. Automated Verification Test Suites

To verify all 6 implementation milestones independently:

```bash
# Milestone 1: Auth, RBAC & Data Models
python playstore-service/test_m1.py

# Milestone 2: Evidence Ingestion & Normalization
python playstore-service/test_m2.py

# Milestone 3: Actuarial Financial Quantification & Monte Carlo
python playstore-service/test_m3.py

# Milestone 4: What-If Simulation & Combinatorial Knapsack
python playstore-service/test_m4.py

# Milestone 5: SQLite Durable Queue & Grounded AI Assistant
python playstore-service/test_m5.py

# Milestone 6: Compliance Frameworks, JSON Export & PDF Reporting
python playstore-service/test_m6.py
```

---

## 6. Architecture & Resiliency Details

1. **MongoDB Offline Fallback**: If MongoDB is unreachable (e.g. during offline jury evaluation), the platform automatically falls back to in-memory fixtures (`get_demo_fixture_bundle()`), ensuring 100% demo uptime without throwing unhandled exceptions.
2. **Crash-Resilient Background Queue**: Long-running simulations and APK scans are persisted in an ACID SQLite database (`enterprise_jobs.db`). If the backend process crashes or terminates mid-task, recovered jobs are automatically dequeued and resumed on restart.
3. **ReportLab PDF Engine**: The boardroom PDF export operates completely offline without external browser dependencies or headless Chrome drivers.
