from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID

# Base schema with common fields
class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)

# Schema for creating a user
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

# Schema for updating a user
class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None

# Schema for password update
class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)

# Schema for user in database (response)
class User(UserBase):
    id: UUID
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schema for user in responses (public info)
class UserPublic(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    is_verified: bool
    
    class Config:
        from_attributes = True
        
class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None

class PasswordChange(BaseModel):
    """Schema for changing password."""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=100)
    
    @validator('new_password')
    def validate_password_strength(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserStats(BaseModel):
    """User statistics."""
    total_queries: int
    total_data_sources: int
    storage_used_mb: float
    member_since: datetime