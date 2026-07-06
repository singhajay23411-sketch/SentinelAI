import logging
import json
from datetime import datetime
from services.database_service import get_connection
from services.history_service import update_dashboard_stats

logger = logging.getLogger(__name__)

def export_scans():
    """Exports all scans from the database into a JSON format."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scans")
        rows = cursor.fetchall()
        
        records = [dict(row) for row in rows]
        
        return {
            "exported_at": datetime.utcnow().isoformat() + "Z",
            "scan_count": len(records),
            "records": records
        }
    finally:
        conn.close()

def import_scans(records):
    """Imports scans into the database, ignoring duplicates based on scan_uuid."""
    if not records or not isinstance(records, list):
        return {"success": False, "error": "Invalid records format"}
        
    conn = get_connection()
    cursor = conn.cursor()
    
    imported_count = 0
    skipped_count = 0
    
    try:
        for record in records:
            scan_uuid = record.get("scan_uuid")
            if not scan_uuid:
                skipped_count += 1
                continue
                
            # Check for existing
            cursor.execute("SELECT 1 FROM scans WHERE scan_uuid = ?", (scan_uuid,))
            if cursor.fetchone():
                skipped_count += 1
                continue
                
            # Insert record
            cursor.execute("""
                INSERT INTO scans (
                    scan_uuid, timestamp, scan_type, app_name, category, matched_app,
                    status, trust_score, threat_score, confidence_score,
                    developer_verified, package_verified, source_device, source_user, raw_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                scan_uuid,
                record.get("timestamp"),
                record.get("scan_type"),
                record.get("app_name"),
                record.get("category"),
                record.get("matched_app"),
                record.get("status"),
                record.get("trust_score"),
                record.get("threat_score"),
                record.get("confidence_score"),
                record.get("developer_verified"),
                record.get("package_verified"),
                record.get("source_device"),
                record.get("source_user"),
                record.get("raw_data")
            ))
            imported_count += 1
            
        if imported_count > 0:
            update_dashboard_stats(cursor)
            
        conn.commit()
        return {
            "success": True,
            "imported": imported_count,
            "skipped": skipped_count,
            "message": f"Successfully imported {imported_count} scans. Skipped {skipped_count} duplicates."
        }
    except Exception as e:
        conn.rollback()
        logger.error(f"Error importing scans: {e}")
        return {"success": False, "error": str(e)}
    finally:
        conn.close()
