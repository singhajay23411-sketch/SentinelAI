# SentinelAI: SIH 2026 Problem Statement 26105 Requirements Traceability Matrix

**Problem Statement ID:** 26105  
**Title:** AI-Powered Continuous Cyber Risk Quantification and Investment Optimization Platform  
**Organization:** All India Council for Technical Education — Cyber Security Cell  
**Theme:** Blockchain & Cybersecurity  

---

## 1. Traceability Matrix

| Req ID | Requirement Description | Architecture Component | Implementation Milestone | Status | Verification Reference |
|---|---|---|---|---|---|
| **REQ-01** | Unified backend foundation preserving existing scanner workflows | FastAPI (`playstore-service/main.py`) | Milestone 1 | **Implemented & Verified** | `test_m1.py`, 4 scanner endpoints preserved intact |
| **REQ-02** | Role-based Access Control (Admin, Analyst, Executive) & multi-tenancy | `enterprise/auth/` (JWT + bcrypt + RBAC) | Milestone 1 | **Implemented & Verified** | `enterprise/auth/service.py`, `dependencies.py`, `test_m1.py` |
| **REQ-03** | Enterprise data models (Org, BU, Assets, Services, Evidence, Controls, Scenarios, Assessments) | `enterprise/models/` | Milestone 1 | **Implemented & Verified** | Pydantic schemas in `enterprise/models/`, `test_m1.py` |
| **REQ-04** | Synthetic demo organization fixture with Indian BFSI context | `enterprise/demo/` ("Sentinel Demo Financial Services") | Milestone 1 | **Implemented & Verified** | 13 assets, 3 services, 3 scenarios, idempotent loader |
| **REQ-05** | Credential security & no silent fallback in scanner UI | `.gitignore`, `.env.example`, `mockAnalyzers.js` | Milestone 1 | **Implemented & Verified** | Committed keys scrubbed, error surfaces explicitly |
| **REQ-06** | Normalized multi-source ingestion pipeline (CSV, JSON, Scanner) | `enterprise/ingestion/` | Milestone 2 | **Implemented & Verified** | Adapters for Assets, Vulns, IAM, SIEM, Scanner, `test_m2.py` |
| **REQ-07** | Deduplication, provenance tracking & rejected-row reporting | `enterprise/ingestion/pipeline.py` | Milestone 2 | **Implemented & Verified** | Content SHA-256 hashing, rejected-row audit logs, `test_m2.py` |
| **REQ-08** | Compound loss scenarios (Ransomware, Identity Compromise, Data Breach) | `enterprise/engine/scenario_model.py` | Milestone 3 | **Implemented & Verified** | Downtime, response, recovery, breach, regulatory; `test_m3.py` |
| **REQ-09** | Monte Carlo simulation engine & VaR calculation (EAL, 95th/99th VaR) | `enterprise/engine/monte_carlo.py`, `var_calculator.py` | Milestone 3 | **Implemented & Verified** | 10,000 seeded NumPy iterations, hand-calc calibration, `test_m3.py` |
| **REQ-10** | Immutable assessment snapshotting with full parameter history | `enterprise/engine/assessment_builder.py` | Milestone 3 | **Implemented & Verified** | Snapshot documents, history preservation, `test_m3.py` |
| **REQ-11** | Counterfactual What-If simulation with common random numbers | `enterprise/simulation/` | Milestone 4 | **Implemented & Verified** | SynchronizedRNG noise reduction, delay inflation, `test_m4.py` |
| **REQ-12** | Mitigation action catalogue & budget optimizer with ROSI | `enterprise/optimizer/` | Milestone 4 | **Implemented & Verified** | Exact $2^N$ combinatorial knapsack solver, ROSI curve, `test_m4.py` |
| **REQ-13** | Durable SQLite background queue for scans & risk reassessment | `enterprise/jobs/` (`enterprise_jobs.db`) | Milestone 5 | **Implemented & Verified** | Crash recovery, atomic dequeue, background worker, `test_m5.py` |
| **REQ-14** | Risk history, trend analytics & posture anomaly detection | `enterprise/analytics/` | Milestone 5 | **Implemented & Verified** | Trend rollups, CVE/MFA anomalies, 3-mo forecaster, `test_m5.py` |
| **REQ-15** | Grounded GenAI natural language risk query interface | `enterprise/ai/` | Milestone 5 | **Implemented & Verified** | 7 canonical questions, prompt sanitizer, fact validator, `test_m5.py` |
| **REQ-16** | Regulatory & compliance framework mappings (ISO, NIST, CIS, RBI, SEBI) | `enterprise/frameworks/` | Milestone 6 | **Implemented & Verified** | 5 frameworks loaded, gap reports & control metrics, `test_m6.py` |
| **REQ-17** | Executive & Technical frontend dashboards | `frontend/src/pages/enterprise/EnterpriseOverview.jsx` | Milestone 6 | **Implemented & Verified** | React 19 UI with 9 tabs, dark theme, Vite production build clean |
| **REQ-18** | Automated executive report generation (PDF & JSON export) | `enterprise/reporting/` | Milestone 6 | **Implemented & Verified** | ReportLab PDF generator, structured audit JSON, `test_m6.py` |
| **REQ-19** | Turnkey containerized deployment & demo runbook | `docker-compose.yml`, `demo-runbook.md`, `deployment.md` | Milestone 6 | **Implemented & Verified** | Multi-container Docker Compose, step-by-step SIH runbook |

---

## 2. Milestone Summary

- **Milestone 1 — Stabilize Foundation**: Complete & Verified (`test_m1.py`). Core DB layer, auth, data models, demo fixtures, frontend route scaffolding, and security hygiene established.
- **Milestone 2 — Assets & Evidence**: Complete & Verified (`test_m2.py`). Ingestion adapters (Asset CSV, Vuln CSV, IAM CSV, SIEM CSV, Scanner Findings), deduplication, provenance, connector health.
- **Milestone 3 — Financial Quantification Engine**: Complete & Verified (`test_m3.py`). Compound incident modeling, loss components (downtime, response, recovery, breach, regulatory), 10,000-trial Monte Carlo simulation, EAL & VaR calculations with statutory disclaimers.
- **Milestone 4 — Simulation & Optimization**: Complete & Verified (`test_m4.py`). What-if simulator with common random numbers, mitigation catalogue, exact combinatorial knapsack optimizer, ROSI metrics, investment efficiency curve.
- **Milestone 5 — Continuous Processing & Grounded AI**: Complete & Verified (`test_m5.py`). Durable SQLite queue, crash-resilient worker, incremental reassessment, trend analytics, grounded Gemini natural language assistant.
- **Milestone 6 — Governance, Reporting & Delivery**: Complete & Verified (`test_m6.py`). Framework mapping files (ISO 27001, NIST CSF 2.0, CIS, RBI, SEBI), executive/technical UI pages, ReportLab PDF report generator, Docker Compose, demo runbook.
