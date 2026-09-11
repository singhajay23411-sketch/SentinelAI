"""
SentinelAI Enterprise - Authentication Routes
POST /auth/register - Create a new user (and org if first user)
POST /auth/login    - Authenticate and receive JWT tokens
POST /auth/refresh  - Exchange refresh token for new access token
POST /auth/logout   - Invalidate the current session (client-side)
GET  /auth/me       - Return the current user profile
"""

import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status

from enterprise.auth.models import (
    UserCreate, UserLogin, UserOut, TokenPair, RefreshRequest, Role
)
from enterprise.auth.service import (
    create_user, authenticate_user, get_user_by_id,
    issue_access_token, issue_refresh_token, decode_token
)
from enterprise.auth.dependencies import get_current_user, TokenData
import enterprise.db.collections as cols

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(body: UserCreate):
    """
    Register a new user. If org_id is not provided, a personal organization
    is created for this user and they become its admin.
    """
    # Check email uniqueness
    if cols.users().find_one({"email": body.email.lower()}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Determine org
    org_id = body.org_id
    if not org_id:
        # Create a new organization for this user
        org_id = f"org-{uuid.uuid4().hex[:12]}"
        org_doc = {
            "_id": org_id,
            "name": f"{body.name}'s Organization",
            "industry": "General",
            "currency": "INR",
            "timezone": "Asia/Kolkata",
            "risk_appetite_threshold": 10_000_000,  # ₹1 crore default
            "created_at": datetime.utcnow(),
            "is_demo": False,
        }
        cols.organizations().insert_one(org_doc)
        role = Role.admin  # First user in a new org is admin
    else:
        # Joining existing org - check it exists
        if not cols.organizations().find_one({"_id": org_id}):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found.",
            )
        role = body.role

    try:
        user = create_user(
            name=body.name,
            email=body.email,
            password=body.password,
            org_id=org_id,
            role=role,
        )
    except Exception as exc:
        logger.error(f"User creation failed: {exc}")
        raise HTTPException(status_code=500, detail="Failed to create user account.")

    access_token  = issue_access_token(user["_id"], org_id, role.value)
    refresh_token = issue_refresh_token(user["_id"], org_id, role.value)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenPair)
def login(body: UserLogin):
    """Authenticate with email and password. Returns JWT token pair."""
    user = authenticate_user(body.email, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    if not user.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated.",
        )

    org_id = user["org_id"]
    role   = user["role"]
    access_token  = issue_access_token(user["_id"], org_id, role)
    refresh_token = issue_refresh_token(user["_id"], org_id, role)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenPair)
def refresh(body: RefreshRequest):
    """Exchange a valid refresh token for a new access + refresh token pair."""
    data = decode_token(body.refresh_token)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )
    user = get_user_by_id(data.user_id)
    if not user or not user.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated.",
        )
    access_token  = issue_access_token(data.user_id, data.org_id, data.role.value)
    refresh_token = issue_refresh_token(data.user_id, data.org_id, data.role.value)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(token: TokenData = Depends(get_current_user)):
    """
    Logout the current user.
    JWT tokens are stateless; logout is handled client-side (discard tokens).
    In a future version, refresh tokens can be denylisted in the DB.
    """
    return None


@router.get("/me", response_model=UserOut)
def me(token: TokenData = Depends(get_current_user)):
    """Return the current authenticated user profile."""
    user = get_user_by_id(token.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserOut(
        id=user["_id"],
        name=user["name"],
        email=user["email"],
        role=Role(user["role"]),
        org_id=user.get("org_id"),
        created_at=user["created_at"],
    )
