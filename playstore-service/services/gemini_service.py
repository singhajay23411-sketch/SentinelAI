import os
import json
import logging
# pyrefly: ignore [missing-import]
import google.generativeai as genai
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', '.env'))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set. AI assessment will fail gracefully.")

# Initialize the model
model = genai.GenerativeModel('gemini-2.5-flash')

def generate_ai_report(analysis_data: dict) -> str:
    """
    Generates a professional AI Security Assessment based on rule-based evidence.
    Will not break the pipeline if it fails.
    """
    if not GEMINI_API_KEY:
        return "AI assessment temporarily unavailable."

    prompt = f"""
You are SentinelAI, an expert cybersecurity fraud analyst.
Analyze the following app verification results and generate a professional security assessment.

App Name:
{analysis_data.get('app_name', 'Unknown')}

Risk Score:
{analysis_data.get('risk_score', 'N/A')}

Threat Level:
{analysis_data.get('threat_level', 'N/A')}

Matched Legitimate App:
{analysis_data.get('matched_app', 'None')}

Developer Verified:
{analysis_data.get('developer_verified', False)}

Suspicious Keywords:
{', '.join(analysis_data.get('matched_keywords', []))}

Fraud Indicators:
{chr(10).join(analysis_data.get('reasons', []))}

Generate a JSON object with the following structure:
{{
  "findings": [
    {{"heading": "Executive Summary", "detail": "Extremely concise 1-sentence overall assessment. Keep under 15 words."}},
    {{"heading": "Threat Assessment", "detail": "Extremely concise 1-sentence threat level justification. Keep under 15 words."}},
    {{"heading": "Fraud Indicators Detected", "detail": "Extremely concise summary of key indicators found (e.g. 'Brand resemblance and unverified dev'). Keep under 15 words."}}
  ],
  "summary": "A detailed, descriptive cybersecurity assessment explaining the analysis findings, potential risks (such as brand impersonation, credential harvesting, or phishing), and a clear, actionable user recommendation. Keep it around 60-80 words."
}}

Keep response concise and professional.
Do not invent findings. Only use provided evidence.
Output ONLY valid JSON.
"""

    try:
        response = model.generate_content(prompt, request_options={"timeout": 15})
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        return json.loads(text.strip())
    except Exception as e:
        logger.error(f"Failed to generate Gemini AI report: {e}")
        return {
            "findings": [
                {"heading": "Status", "detail": "AI assessment temporarily unavailable."}
            ],
            "summary": "Please review the manual indicators."
        }
