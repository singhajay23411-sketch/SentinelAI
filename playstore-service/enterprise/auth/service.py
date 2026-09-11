"""
SentinelAI Enterprise - Authentication Service
Password hashing, JWT token issue/verify, and user management.
Secrets are loaded from environment only - never hardcoded.
"""

import os
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from passlib.context import CryptContext
from jose import JWTError, jwt

from enterprise.auth.models import Role, TokenData
import enterprise.db.collections as cols

logger = logging.getLogger(__name__)

# ─── Configuration (from environment) ────────────────────────────────────────

def _get_secret() -> str:
    secret = os.environ.get("JWT_SECRET_KEY")
    if not secret or secret == "change_this_to_a_strong_random_secret_key":
        raise RuntimeError(
            "JWT_SECRET_KEY is not configured. "
            "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
        )
    return secret

ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_EXPIRE_MINUTES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_EXPIRE_DAYS = int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# ─── Password Hashing ─────────────────────────────────────────────────────────

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)

# ─── JWT ──────────────────────────────────────────────────────────────────────

def _issue_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode["exp"] = expire
    to_encode["iat"] = datetime.now(timezone.utc)
    return jwt.encode(to_encode, _get_secret(), algorithm=ALGORITHM)

def issue_access_token(user_id: str, org_id: str, role: str) -> str:
    return _issue_token(
        {"sub": user_id, "org_id": org_id, "role": role, "type": "access"},
        timedelta(minutes=ACCESS_EXPIRE_MINUTES),
    )

def issue_refresh_token(user_id: str, org_id: str, role: str) -> str:
    return _issue_token(
        {"sub": user_id, "org_id": org_id, "role": role, "type": "refresh"},
        timedelta(days=REFRESH_EXPIRE_DAYS),
    )

def decode_token(token: str) -> Optional[TokenData]:
    """Decode and validate a JWT. Returns None if invalid."""
    try:
        payload = jwt.decode(token, _get_secret(), algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        org_id = payload.get("org_id")
        role = payload.get("role")
        if not user_id or not org_id:
            return None
        return TokenData(user_id=user_id, org_id=org_id, role=Role(role))
    except JWTError as exc:
        logger.debug(f"JWT decode failed: {exc}")
        return None

# ─── User Operations ─────────────────────────────────────────────────────────

def create_user(name: str, email: str, password: str, org_id: str, role: Role) -> dict:
    """Create a new user record in MongoDB. Returns the created document."""
    user_id = str(uuid.uuid4())
    now = datetime.utcnow()
    doc = {
        "_id": user_id,
        "name": name,
        "email": email.lower().strip(),
        "password_hash": hash_password(password),
        "org_id": org_id,
        "role": role.value,
        "created_at": now,
        "updated_at": now,
        "active": True,
    }
    cols.users().insert_one(doc)
    _create_org_member(org_id=org_id, user_id=user_id, role=role)
    logger.info(f"Created user {user_id} in org {org_id} with role {role.value}")
    return doc

def get_user_by_email(email: str) -> Optional[dict]:
    return cols.users().find_one({"email": email.lower().strip()})

def get_user_by_id(user_id: str) -> Optional[dict]:
    return cols.users().find_one({"_id": user_id})

def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Return user doc if credentials are valid, else None."""
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.get("password_hash", "")):
        return None
    return user

def _create_org_member(org_id: str, user_id: str, role: Role):
    cols.org_members().update_one(
        {"org_id": org_id, "user_id": user_id},
        {"$set": {"role": role.value, "joined_at": datetime.utcnow()}},
        upsert=True,
    )

def get_org_membership(org_id: str, user_id: str) -> Optional[dict]:
    return cols.org_members().find_one({"org_id": org_id, "user_id": user_id})
