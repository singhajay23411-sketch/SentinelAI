import logging
import uuid
from datetime import datetime
from services.database_service import get_connection

logger = logging.getLogger(__name__)

def update_dashboard_stats(cursor=None):
    """Calculates and updates dashboard stats based on the scans table."""
    conn = None
    if not cursor:
        conn = get_connection()
        cursor = conn.cursor()
        
    try:
        # Total Scans
        cursor.execute("SELECT COUNT(*) FROM scans")
        total_scans = cursor.fetchone()[0]
        
        # Safe Apps
        cursor.execute("""
            SELECT COUNT(*) FROM scans 
            WHERE status IN ('Official Verified Application', 'Trusted Financial Application', 'Trusted Shopping Application', 'Safe')
        """)
        safe_apps = cursor.fetchone()[0]
        
        # Medium Risk
        cursor.execute("""
            SELECT COUNT(*) FROM scans 
            WHERE status IN ('Needs Review', 'Suspicious', 'Medium')
        """)
        medium_risk = cursor.fetchone()[0]
        
        # High Risk
        cursor.execute("""
            SELECT COUNT(*) FROM scans 
            WHERE status IN ('Potential Impersonation', 'High Risk Fraud', 'Critical Threat', 'High', 'Critical')
        """)
        high_risk = cursor.fetchone()[0]
        
        # Update dashboard_stats table
        cursor.execute("""
            UPDATE dashboard_stats
            SET total_scans = ?,
                safe_apps = ?,
                medium_risk = ?,
                high_risk = ?,
                last_updated = ?
            WHERE id = 1
        """, (total_scans, safe_apps, medium_risk, high_risk, datetime.utcnow().isoformat() + "Z"))
        
        if conn:
            conn.commit()
            
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Error updating dashboard stats: {e}")
        raise e
    finally:
        if conn:
            conn.close()

def save_scan(result_data: dict, scan_type: str = "Play Store", source_user: str = "Local"):
    """
    Saves a completed scan into the SQLite database.
    """
    scan_uuid = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    # Safely extract values
    app_name = result_data.get("app_details", {}).get("title") or result_data.get("app_name", "Unknown")
    category = result_data.get("app_details", {}).get("genre") or result_data.get("category", "")
    
    # For Play Store Analysis, scores are in result_data["analysis"].
    # For Manual Analysis, scores are in result_data itself.
    analysis = result_data.get("analysis", result_data)
    
    status = analysis.get("status", "Unknown")
    trust_score = analysis.get("trust_score", 0)
    threat_score = analysis.get("threat_score", 0)
    confidence_score = analysis.get("confidence_score", 0)
    
    matched_app = analysis.get("matched_app", "")
    developer_verified = analysis.get("developer_verified", False)
    package_verified = analysis.get("package_verified", False)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        import json
        raw_data_json = json.dumps(result_data)
        cursor.execute("""
            INSERT INTO scans (
                scan_uuid, timestamp, scan_type, app_name, category, matched_app,
                status, trust_score, threat_score, confidence_score,
                developer_verified, package_verified, source_device, source_user, raw_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            scan_uuid, timestamp, scan_type, app_name, category, matched_app,
            status, trust_score, threat_score, confidence_score,
            developer_verified, package_verified, "web-client", source_user, raw_data_json
        ))
        
        # Update dashboard stats within the same transaction (or connection)
        update_dashboard_stats(cursor)
        
        conn.commit()
        return scan_uuid
    except Exception as e:
        conn.rollback()
        logger.error(f"Error saving scan: {e}")
        raise e
    finally:
        conn.close()

def get_scan_history():
    """Retrieves all scan history from the database, newest first."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scans ORDER BY id DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def get_dashboard_stats():
    """Retrieves the current dashboard statistics."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM dashboard_stats WHERE id = 1")
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()
