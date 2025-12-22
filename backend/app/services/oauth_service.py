from sqlalchemy.orm import Session
from typing import Optional
from app.models.user import User

class OAuthService:
    """Service for handling OAuth authentication."""
    
    @staticmethod
    def get_or_create_oauth_user(
        db: Session,
        email: str,
        full_name: str,
        oauth_provider: str,
        oauth_id: str,
        avatar_url: Optional[str] = None
    ) -> User:
        """
        Get existing OAuth user or create new one.
        
        Args:
            db: Database session
            email: User email from OAuth provider
            full_name: User name from OAuth provider
            oauth_provider: 'google' or 'github'
            oauth_id: Unique ID from OAuth provider
            avatar_url: Profile picture URL (optional)
        
        Returns:
            User object
        """
        # Check if user exists with this OAuth provider and ID
        user = db.query(User).filter(
            User.oauth_provider == oauth_provider,
            User.oauth_id == oauth_id
        ).first()
        
        if user:
            # Update user info in case it changed
            user.full_name = full_name
            user.avatar_url = avatar_url
            user.is_verified = True  # OAuth users are automatically verified
            db.commit()
            db.refresh(user)
            return user
        
        # Check if user exists with this email (might be converting from password auth)
        existing_user = db.query(User).filter(User.email == email).first()
        
        if existing_user:
            # Link OAuth account to existing user
            existing_user.oauth_provider = oauth_provider
            existing_user.oauth_id = oauth_id
            existing_user.avatar_url = avatar_url
            existing_user.is_verified = True
            db.commit()
            db.refresh(existing_user)
            return existing_user
        
        # Create new OAuth user
        new_user = User(
            email=email,
            full_name=full_name,
            oauth_provider=oauth_provider,
            oauth_id=oauth_id,
            avatar_url=avatar_url,
            password_hash=None,  # OAuth users don't have passwords
            is_active=True,
            is_verified=True  # OAuth users are auto-verified
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
