"""
SentinelAI Enterprise - Database Connection
Singleton PyMongo client shared across all enterprise modules.
MongoDB is the authoritative store for all enterprise data.
SQLite remains for scanner scan history and the durable job queue only.
"""

import os
import logging

import pymongo
from pymongo import MongoClient

logger = logging.getLogger(__name__)

_client = None
_db = None


def _get_uri() -> str:
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        raise RuntimeError(
            "MONGODB_URI environment variable is not set. "
            "Set it to mongodb://localhost:27017 for local development "
            "or to your Atlas connection string for production."
        )
    return uri


def get_client() -> MongoClient:
    """Return (or initialize) the shared MongoClient singleton."""
    global _client
    if _client is None:
        uri = _get_uri()
        _client = MongoClient(
            uri,
            maxPoolSize=20,
            minPoolSize=2,
            serverSelectionTimeoutMS=1000,
            connectTimeoutMS=2000,
        )
        logger.info("Enterprise MongoDB client initialized.")
    return _client


def get_db():
    """Return the enterprise database handle."""
    global _db
    if _db is None:
        client = get_client()
        db_name = os.environ.get("DATABASE_NAME", "SentinelAI")
        _db = client[db_name]
        logger.info(f"Enterprise database handle: {db_name}")
    return _db


def ping() -> bool:
    """Return True if the MongoDB server is reachable."""
    try:
        get_client().admin.command("ping")
        return True
    except Exception as exc:
        logger.warning(f"MongoDB ping failed: {exc}")
        return False


def close():
    """Close the shared client (called on application shutdown)."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("Enterprise MongoDB client closed.")
