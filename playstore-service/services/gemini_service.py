import os
import json
import logging
# pyrefly: ignore [missing-import]
import google.generativeai as genai
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
# Fallback to backend/.env for backward compatibility with local workspace setups
backend_env = os.path.join(os.path.dirname(__file__), '..', '..', 'backend', '.env')
if os.path.exists(backend_env):
    load_dotenv(backend_env)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini service initialized successfully")
else:
    logger.warning("GEMINI_API_KEY is not set. AI assessment will fail gracefully.")

# Initialize the model
try:
    model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    logger.error(f"Failed to initialize Gemini model: {e}")
    model = None

def generate_ai_report(analysis_data: dict) -> str:
    """
    Generates a professional AI Security Assessment based on rule-based evidence.
    Will not break the pipeline if it fails.
    """
    try:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not configured")
        if not model:
            raise ValueError("Gemini model not initialized")

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
        # Secure: Never log the API key or raw credentials, only the clean error message.
        return "AI assessment temporarily unavailable."
