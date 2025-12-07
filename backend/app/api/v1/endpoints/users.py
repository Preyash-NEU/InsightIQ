from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate, PasswordChange, UserStats
from app.services.user_service import UserService
from app.api.deps import get_current_active_user

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user profile.
    
    Returns complete user information including email, name, and account details.
    """
    return current_user


@router.put("/me", response_model=UserSchema)
async def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update user profile.
    
    - **full_name**: Update full name (optional)
    - **email**: Update email address (optional, must be unique)
    
    You can update one or both fields.
    """
    return UserService.update_profile(db, current_user, update_data)


@router.post("/me/change-password")
async def change_password(
    password_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Change user password.
    
    - **current_password**: Current password for verification
    - **new_password**: New password (min 8 chars, must contain uppercase, lowercase, and digit)
    
    Requires current password for security.
    """
    return UserService.change_password(db, current_user, password_data)


@router.get("/me/stats", response_model=UserStats)
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get user statistics.
    
    Returns:
    - Total queries executed
    - Total data sources connected
    - Storage used
    - Account creation date
    """
    return UserService.get_user_stats(db, current_user)


@router.delete("/me")
async def delete_account(
    password: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete user account.
    
    **WARNING**: This action is irreversible!
    
    - **password**: Password confirmation required
    
    Deletes:
    - User account
    - All data sources
    - All queries
    - All uploaded files
    """
    return UserService.delete_account(db, current_user, password)