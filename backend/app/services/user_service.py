from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional

from app.models.user import User
from app.schemas.user import UserUpdate, PasswordChange, UserStats
from app.core.security import get_password_hash, verify_password
from app.models.data_source import DataSource
from app.models.query import Query
from sqlalchemy import func

class UserService:
    """Service for user profile management."""
    
    @staticmethod
    def update_profile(
        db: Session,
        user: User,
        update_data: UserUpdate
    ) -> User:
        """
        Update user profile information.
        
        Args:
            db: Database session
            user: Current user
            update_data: Fields to update
            
        Returns:
            Updated user object
        """
        # Check if email is being changed and is unique
        if update_data.email and update_data.email != user.email:
            existing_user = db.query(User).filter(User.email == update_data.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )
            user.email = update_data.email
        
        # Update full name if provided
        if update_data.full_name:
            user.full_name = update_data.full_name
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def change_password(
        db: Session,
        user: User,
        password_data: PasswordChange
    ) -> dict:
        """
        Change user password.
        
        Args:
            db: Database session
            user: Current user
            password_data: Current and new passwords
            
        Returns:
            Success message
        """
        # Verify current password
        if not verify_password(password_data.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Check new password is different
        if password_data.current_password == password_data.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password"
            )
        
        # Update password
        user.password_hash = get_password_hash(password_data.new_password)
        db.commit()
        
        return {"message": "Password changed successfully"}
    
    @staticmethod
    def get_user_stats(db: Session, user: User) -> UserStats:
        """
        Get user statistics.
        
        Args:
            db: Database session
            user: Current user
            
        Returns:
            User statistics
        """
        # Count queries
        total_queries = db.query(Query).filter(Query.user_id == user.id).count()
        
        # Count data sources
        total_data_sources = db.query(DataSource).filter(DataSource.user_id == user.id).count()
        
        # Calculate storage used
        storage_result = db.query(func.sum(DataSource.file_size))\
            .filter(DataSource.user_id == user.id)\
            .scalar()
        storage_used_bytes = storage_result or 0
        storage_used_mb = round(storage_used_bytes / (1024 * 1024), 2)
        
        return UserStats(
            total_queries=total_queries,
            total_data_sources=total_data_sources,
            storage_used_mb=storage_used_mb,
            member_since=user.created_at
        )
    
    @staticmethod
    def delete_account(db: Session, user: User, password: str) -> dict:
        """
        Delete user account (with password confirmation).
        
        Args:
            db: Database session
            user: Current user
            password: Password confirmation
            
        Returns:
            Success message
        """
        # Verify password
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is incorrect"
            )
        
        # Delete user (cascades to data_sources, queries, etc.)
        db.delete(user)
        db.commit()
        
        return {"message": "Account deleted successfully"}