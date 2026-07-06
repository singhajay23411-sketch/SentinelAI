import sqlite3
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database")
DB_PATH = os.path.join(DB_DIR, "sentinelai.db")

def get_connection():
    """Returns an SQLite connection with row factory configured."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite database with required schemas."""
    os.makedirs(DB_DIR, exist_ok=True)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Create scans table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_uuid TEXT UNIQUE,
                timestamp TEXT,
                scan_type TEXT,
                app_name TEXT,
                category TEXT,
                matched_app TEXT,
                status TEXT,
                trust_score INTEGER,
                threat_score INTEGER,
                confidence_score INTEGER,
                developer_verified BOOLEAN,
                package_verified BOOLEAN,
                source_device TEXT,
                source_user TEXT,
                raw_data TEXT
            )
        """)
        
        # Create dashboard_stats table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS dashboard_stats (
                id INTEGER PRIMARY KEY,
                total_scans INTEGER,
                safe_apps INTEGER,
                medium_risk INTEGER,
                high_risk INTEGER,
                last_updated TEXT
            )
        """)
        
        # Initialize dashboard_stats if empty
        cursor.execute("SELECT COUNT(*) FROM dashboard_stats")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO dashboard_stats (id, total_scans, safe_apps, medium_risk, high_risk, last_updated)
                VALUES (1, 0, 0, 0, 0, ?)
            """, (datetime.utcnow().isoformat() + "Z",))
        
        conn.commit()
        logger.info(f"Database initialized successfully at {DB_PATH}")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to initialize database: {e}")
        raise e
    finally:
        conn.close()
