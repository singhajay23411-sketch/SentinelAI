"""
SentinelAI Enterprise - Authentication Models
Pydantic schemas for users, tokens, and organization membership.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


class Role(str, Enum):
    admin     = "admin"
    analyst   = "analyst"
    executive = "executive"


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    org_id: Optional[str] = None  # If None, a personal org is created
    role: Role = Role.analyst


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: Role
    org_id: Optional[str]
    created_at: datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: str
    org_id: str
    role: Role


class RefreshRequest(BaseModel):
    refresh_token: str


class OrgMember(BaseModel):
    org_id: str
    user_id: str
    role: Role
    joined_at: datetime = Field(default_factory=datetime.utcnow)
