# SentinelAI: SIH 2026 Jury Demonstration Runbook

**Problem Statement ID:** 26105  
**Title:** AI-Powered Continuous Cyber Risk Quantification and Investment Optimization Platform  
**Organization:** All India Council for Technical Education (AICTE) — Cyber Security Cell  
**Theme:** Blockchain & Cybersecurity  
**Demonstration Scenario:** *Sentinel Demo Financial Services [DEMO]* — Tier-2 Scheduled Commercial Bank & Digital Payment Switch (Regulated by RBI & SEBI).

---

## 1. Executive Summary & Value Proposition for the Jury

Traditional enterprise cybersecurity relies on qualitative "High/Medium/Low" heatmaps and static compliance checklists that fail to answer the primary boardroom question:
> **"What is our actual financial exposure in Indian Rupees (INR), and which exact security investments give us the highest return on investment?"**

SentinelAI bridges technical telemetry and financial reality through:
1. **Actuarial Financial Loss Engine**: Beta-PERT loss distributions and 10,000-trial Monte Carlo simulations modeling frequency (Poisson) and compound losses across downtime, incident response, data breach, and regulatory fines.
2. **Strict Provenance & Mandate Adherence**: Zero fabricated figures. All 95th-percentile VaRs are labeled with statutory disclaimers (*"Model-estimated annual loss threshold exceeded in ~5% of simulated years, subject to documented assumptions. Not a maximum possible loss."*).
3. **Exact Combinatorial Knapsack Optimizer**: Evaluates $2^N$ mitigation combinations under an executive budget constraint (e.g. ₹15,00,000) to find the mathematically optimal portfolio maximizing Return on Security Investment (ROSI).
4. **Indian Regulatory Native**: Built-in mapping and automated gap analysis for **RBI Cyber Security Framework (2023)** and **SEBI CSCRF (2024)** alongside ISO 27001, NIST CSF 2.0, and CIS Controls v8.
5. **Grounded AI Copilot**: Strict fact-bound LLM query interface answering canonical executive questions with zero hallucinations.

---

## 2. Pre-Demo Setup & Environment Verification

### Rapid Local Launch:
```bash
# 1. Ensure Python 3.12+ virtual environment is active
.\.venv\Scripts\activate

# 2. Start FastAPI Enterprise Microservice
cd playstore-service
python main.py
# Running on http://localhost:8080 (Health: http://localhost:8080/health)

# 3. Start Frontend Dashboard (separate terminal)
cd frontend
npm run dev
# Running on http://localhost:5173
```

### Docker Single-Command Launch (Alternative):
```bash
docker-compose up --build -d
# Frontend: http://localhost (or http://localhost:5173)
# Backend:  http://localhost:8080
```

---

## 3. Step-by-Step Demonstration Script (8-Minute Jury Flow)

### Step 1: Authentication & Role-Based Access Control (Minute 0:00 - 1:00)
- **Navigate to:** `http://localhost:5173/login`
- **Narrative:** "SentinelAI enforces strict role-based access control. Financial risk assessments contain market-sensitive financial data requiring distinct privileges between Auditors, Analysts, and C-Suite Executives."
- **Action:**
  - Login as **Chief Information Security Officer (CISO)**:
    - Email: `officer@sentinelai.internal`
    - Password: `Password@123` (or any valid credentials; click **Demo Quick-Login**)
  - Explain the multi-tenant scoping: All actions are cryptographically bounded to the organization `org-sentinel-demo-bfsi`.

---

### Step 2: Multi-Source Evidence Ingestion & Normalization (Minute 1:00 - 2:00)
- **Navigate to:** `Enterprise Overview -> Ingestion & Evidence` tab
- **Narrative:** "Enterprise risk quantification requires continuous telemetry. SentinelAI ingests asset inventories, vulnerability scanners, IAM configurations, and SIEM security alerts."
- **Action:**
  - Click **Load Standard BFSI Evidence Fixtures**.
  - Show the 4 loaded streams:
    1. `assets.csv`: 13 critical assets (Core Banking Cluster, UPI Payment Gateway, Cloud API Gateway, Customer Mobile App).
    2. `vulnerabilities.csv`: CVE-2023-34362 (MOVEit), CVE-2021-44228 (Log4j), Active Directory unpatched flaws.
    3. `iam_export.csv`: 23 privileged administrator accounts without mandatory MFA.
    4. `siem_alerts.csv`: Brute-force credential spikes and abnormal database queries.
  - Highlight the **Deduplication and Provenance**: Explain that every ingested record generates a deterministic content SHA-256 hash to prevent double-counting.

---

### Step 3: Actuarial Monte Carlo Financial Quantification (Minute 2:00 - 3:30)
- **Navigate to:** `Enterprise Overview -> Executive Overview` & `Risk Scenarios` tabs
- **Narrative:** "Instead of subjective 1-to-5 risk matrices, SentinelAI runs a 10,000-trial Monte Carlo simulation using Beta-PERT distributions calibrated to actual enterprise financial telemetry."
- **Action:**
  - Click **Run Assessment Snapshot**.
  - Point out the key metrics calculated in real-time:
    - **Expected Annual Loss (EAL):** **₹38,99,650 / year** (Mean statistical annual loss).
    - **95th Percentile Annual VaR:** **₹1,74,46,592** (Loss exceeded in only 5% of simulated years).
    - **99th Percentile Tail VaR:** **₹2,56,31,002** (Extreme tail risk event).
    - **Board Risk Appetite Limit:** ₹2,00,00,000.
  - **Show Hand-Calculated Provenance:**
    - Highlight the scenario `SCN-001: Core Banking Ransomware Outage`.
    - Mean frequency = 0.35 events/year.
    - Beta-PERT Downtime (Min: 4h, Most Likely: 24h, Max: 72h) $\times$ ₹2,50,000/hr revenue loss.
    - Hand calculation verifies the exact baseline EAL matches the simulation within 1.5% standard error.
  - **Show Mandate Disclaimer**: Point out the statutory disclaimer rendered directly underneath the VaR card.

---

### Step 4: What-If Counterfactual Simulation Lab (Minute 3:30 - 4:30)
- **Navigate to:** `Enterprise Overview -> What-If Simulation Lab` tab
- **Narrative:** "Executives don't just want to know how bad things are—they need to know how specific controls change the numbers before committing capital. SentinelAI uses Common Random Numbers (CRN) to ensure simulation differences reflect actual control efficacy, not statistical noise."
- **Action:**
  - Toggle **Enforce Multi-Factor Authentication (MFA)**:
    - Frequency of Credential Compromise drops by 78%.
    - Watch EAL drop immediately from ₹38.99L to ₹26.40L.
  - Toggle **Patch Critical CVEs within 14 Days**:
    - Reduces exploit probability on internet-facing assets by 65%.
  - Select **Remediation Delay: 90 Days**:
    - Show the cost of inaction: Annualized financial exposure inflates by **+₹14.2 Lakhs** due to extended dwell time and unmitigated exposure windows.

---

### Step 5: Exact Knapsack Budget Optimization & ROSI (Minute 4:30 - 5:45)
- **Navigate to:** `Enterprise Overview -> Budget Optimizer` tab
- **Narrative:** "CISOs face a classic NP-hard problem: given hundreds of security controls and a finite capital budget, which combination delivers the highest financial risk reduction?"
- **Action:**
  - Set the **Capital Budget Ceiling:** `₹15,00,000`.
  - Click **Compute Optimal Investment Portfolio**.
  - Review the exact combinatorial knapsack solution:
    - **Optimal Budget Spent:** **₹11,00,000** (under ₹15L cap).
    - **Total EAL Loss Reduction:** **₹31,33,948 / year**.
    - **Portfolio ROSI:** **+184.9%** (Net financial benefit: ₹20.33 Lakhs).
    - **Cost-Benefit Ratio (CBR):** **2.85 : 1** (Every ₹1 invested saves ₹2.85 in expected losses).
  - Inspect the **Investment Efficiency Curve**:
    - Show the diminishing returns curve. Point out why investing beyond ₹25 Lakhs yields flatlining incremental risk reduction.

---

### Step 6: Indian Regulatory Compliance & Gap Analysis (Minute 5:45 - 6:45)
- **Navigate to:** `Enterprise Overview -> Governance & Frameworks` tab
- **Narrative:** "In India, financial institutions must comply with RBI Cyber Security Guidelines and SEBI CSCRF. SentinelAI automatically bridges technical controls to statutory mandates."
- **Action:**
  - Select **RBI Cyber Security Framework (2023)**:
    - Current Compliance Score: **42.9%** (3 Implemented, 4 Gaps).
  - Click **Generate Gap Analysis**:
    - Highlight Gap `RBI-03`: Privileged Access MFA gap (mandated under Annex 1, Section 4).
    - Show that the recommended remediation (`MFA-01`) directly links back to our Optimizer catalogue item.
  - Switch to **SEBI CSCRF (2024)** and show **50.0%** baseline compliance.

---

### Step 7: Grounded AI Risk Query Assistant (Minute 6:45 - 7:30)
- **Navigate to:** `Enterprise Overview -> Grounded AI Assistant` tab
- **Narrative:** "Board members and executives do not write SQL queries or read raw JSON. They ask plain-English questions. SentinelAI features a grounded generative copilot with strict anti-hallucination guardrails and prompt sanitization."
- **Action:**
  - Click on the pre-configured canonical questions:
    1. *"What is our highest financial risk scenario?"*
       - Model cites `SCN-001 (Core Banking Ransomware)` with exact figures: ₹22,34,500 EAL, accounting for 57.3% of total loss.
    2. *"What priority actions should we take within our available budget?"*
       - Model lists the exact 3 knapsack controls, their one-time/annual costs, and total projected savings.
    3. *"What are the financial consequences if we delay remediation 90 days?"*
       - Model details the ₹14.2 Lakh exposure increase.
  - Explain that every answer contains citations and traceable data provenance back to the latest assessment snapshot.

---

### Step 8: Executive Reporting & Boardroom PDF Generation (Minute 7:30 - 8:00)
- **Navigate to:** `Enterprise Overview -> Executive Reports` tab
- **Narrative:** "To conclude the governance cycle, SentinelAI compiles an audit-grade, boardroom-ready report in standard PDF format and structured JSON for regulatory filing."
- **Action:**
  - Click **Download Audit JSON**:
    - Shows the complete structured export containing assessment parameters, random seed provenance, framework alignment, and optimizer recommendations.
  - Click **Download Executive Boardroom PDF**:
    - Opens/downloads `sentinelai_executive_report_org-sentinel-demo-bfsi.pdf`.
    - Show the styled ReportLab tables: Executive figures, Top Loss Scenarios, Regulatory Framework coverage, and the Knapsack Allocation Plan with statutory disclaimers.

---

## 4. Anticipated Jury Questions & Authoritative Answers

| Question | Technical Answer | Code Reference |
|---|---|---|
| **"How do you handle statistical uncertainty in Monte Carlo simulations?"** | We run 10,000 iterations per scenario using Beta-PERT distributions parameterized with $(\text{Min}, \text{Most Likely}, \text{Max})$ bounds. We fix strictly reproducible NumPy random seeds and utilize Common Random Numbers (CRN) across counterfactual runs to eliminate noise. | `enterprise/engine/monte_carlo.py`, `enterprise/simulation/common_random_numbers.py` |
| **"Why is your Knapsack solver better than greedy prioritization?"** | A greedy algorithm ranking by individual ROSI often gets trapped in suboptimal combinations because it fails to evaluate budget packing efficiency. Because the enterprise mitigation space is $N \le 20$, we evaluate all $2^N$ combinations in <50ms to guarantee the mathematically global optimum. | `enterprise/optimizer/optimizer.py` |
| **"How do you ensure the AI does not hallucinate financial figures?"** | The AI prompt builder injects strictly validated facts from the latest immutable assessment. If a response generates numbers not present in the assessment context, the response validator flags and replaces the output with pre-validated deterministic synthesis. | `enterprise/ai/context_builder.py`, `enterprise/ai/response_validator.py` |
| **"Can this platform be deployed in on-premise bank datacenters?"** | Yes. The entire platform runs via Docker Compose with zero external cloud dependencies. SQLite is used for durable jobs, PyMongo for storage, and offline fallback mode is natively supported. | `docker-compose.yml`, `enterprise/jobs/queue.py` |
