# SentinelAI - Project Overview & Context
> **Tagline:** *"Unmasking Fake Apps. Securing Real Trust."*

SentinelAI is an AI-powered cyber defense platform designed for a law-enforcement and cybercrime prevention challenge. It helps general investors, new investors, and law enforcement agencies identify fake and look-alike investment applications before users trust them.

---

## 🚨 Problem Statement
Cybercriminals target vulnerable financial consumers by producing clone or look-alike applications matching legitimate Indian investment platforms:
- **Groww**
- **Zerodha**
- **Upstox**
- **Angel One**
- **Paytm Money**
- **ICICI Direct**
- **HDFC Securities**
- **Kotak Securities**

These malicious apps typically employ:
1. Brand impersonation using identical or highly similar names.
2. Forged app logos and graphics.
3. Unrealistic high-yield promises (e.g., "100% profit", "double your money").
4. Credentials harvesting and direct financial scams.

---

## 🎯 Project Objective
Build a fast and explainable threat intelligence microservice that evaluates an application's **Name** and **Description text** (with placeholders for **Logo analysis**), calculating a final fraud risk score with natural-language reasoning.

---

## 🏗️ System Architecture
SentinelAI is organized as a decoupled, multi-tier application:

```
  React Frontend (UI/UX)
         |
         v
   Node.js Backend (Sessions, Telemetry, Database Sync)
         |
         v
  FastAPI AI Engine (Threat & Risk Scoring)
         |
         v
    MongoDB (Audit Logging & Telemetry History)
```

---

## 👥 Team Structure & Roles
The project is built by a team of two developers:

* **Developer 1 (Backend & AI Engine)**:
  * Manages the FastAPI AI engine implementation.
  * Handles the Node.js backend.
  * Orchestrates MongoDB schemas and deployments.

* **Developer 2 (Frontend & UI/UX)**:
  * Implements the React dashboard, upload screens, and scan result cards.
  * Optimizes the visual experience and presentation.

---

## 🛠️ MVP Detection Capabilities

1. **Name Similarity Checks**: Uses `RapidFuzz` to measure distance between input names and the legitimate catalog.
2. **Text Claim Checks**: Analyzes description texts for suspicious keyword match counts.
3. **Combined Threat Formula**:
   $$\text{Final Risk} = \text{round}(0.6 \times \text{Name Risk} + 0.4 \times \text{Description Risk})$$
4. **Safety Status Categories**:
   - $0 - 30$: **Safe**
   - $31 - 60$: **Suspicious**
   - $61 - 100$: **High Risk**

---

## 🔮 Future Roadmap (Post-MVP)
* **Logo Analysis**: Compare graphics using OpenCV template matching, PIL processing, and perceptual ImageHash distances.
* **APK Static Analysis**: Analyze permissions, package certificates, and embedded URLs directly from binary files.
* **App Store Crawling**: Auto-fetch listing information from Google Play Store.
* **ML Classifiers**: Train dedicated NLP classifiers instead of keyword matching.
