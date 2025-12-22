from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import Optional
import httpx
import secrets
from urllib.parse import urlencode

from app.db.session import get_db
from app.schemas.user import UserPublic
from app.schemas.token import Token
from app.services.auth_service import AuthService
from app.services.oauth_service import OAuthService
from app.config import settings

router = APIRouter()

# ---------------------------
# GOOGLE OAUTH
# ---------------------------

@router.get("/google")
async def google_login():
    """
    Initiate Google OAuth flow.
    Returns authorization URL to redirect user to.
    """
    state = secrets.token_urlsafe(32)
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=openid email profile&"
        f"state={state}&"
        f"access_type=offline"
    )
    
    return {
        "auth_url": auth_url,
        "state": state
    }

@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """
    Handle Google OAuth callback.
    This endpoint receives the GET request from Google after user authorizes.
    """
    try:
        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                }
            )
            
            if token_response.status_code != 200:
                # Redirect to frontend with error
                error_params = urlencode({"error": "failed_to_exchange_code"})
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/login?{error_params}",
                    status_code=status.HTTP_302_FOUND
                )
            
            tokens = token_response.json()
            access_token = tokens.get("access_token")
            
            # Get user info from Google
            user_info_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if user_info_response.status_code != 200:
                error_params = urlencode({"error": "failed_to_get_user_info"})
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/login?{error_params}",
                    status_code=status.HTTP_302_FOUND
                )
            
            user_info = user_info_response.json()
        
        # Create or get user
        user = OAuthService.get_or_create_oauth_user(
            db=db,
            email=user_info["email"],
            full_name=user_info.get("name", "Google User"),
            oauth_provider="google",
            oauth_id=user_info["id"],
            avatar_url=user_info.get("picture")
        )
        
        # Update last login
        AuthService.update_last_login(db, user)
        
        # Create JWT tokens
        auth_tokens = AuthService.create_tokens(user)
        
        # Redirect to frontend with tokens
        token_params = urlencode({
            "access_token": auth_tokens.access_token,
            "refresh_token": auth_tokens.refresh_token,
            "token_type": auth_tokens.token_type,
        })
        
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?provider=google&{token_params}",
            status_code=status.HTTP_302_FOUND
        )
        
    except Exception as e:
        print(f"Google OAuth error: {str(e)}")  # Debug log
        error_params = urlencode({"error": str(e)})
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?{error_params}",
            status_code=status.HTTP_302_FOUND
        )

# ---------------------------
# GITHUB OAUTH
# ---------------------------

@router.get("/github")
async def github_login():
    """
    Initiate GitHub OAuth flow.
    Returns authorization URL to redirect user to.
    """
    state = secrets.token_urlsafe(32)
    
    auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={settings.GITHUB_CLIENT_ID}&"
        f"redirect_uri={settings.GITHUB_REDIRECT_URI}&"
        f"scope=user:email&"
        f"state={state}"
    )
    
    return {
        "auth_url": auth_url,
        "state": state
    }

@router.get("/github/callback")
async def github_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """
    Handle GitHub OAuth callback.
    This endpoint receives the GET request from GitHub after user authorizes.
    """
    try:
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.GITHUB_REDIRECT_URI,
                },
                headers={"Accept": "application/json"}
            )
            
            if token_response.status_code != 200:
                error_params = urlencode({"error": "failed_to_exchange_code"})
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/login?{error_params}",
                    status_code=status.HTTP_302_FOUND
                )
            
            tokens = token_response.json()
            access_token = tokens.get("access_token")
            
            # Get user info from GitHub
            user_info_response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
            )
            
            if user_info_response.status_code != 200:
                error_params = urlencode({"error": "failed_to_get_user_info"})
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/login?{error_params}",
                    status_code=status.HTTP_302_FOUND
                )
            
            user_info = user_info_response.json()
            
            # Get user email if not public
            email = user_info.get("email")
            if not email:
                emails_response = await client.get(
                    "https://api.github.com/user/emails",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json"
                    }
                )
                if emails_response.status_code == 200:
                    emails = emails_response.json()
                    primary_email = next((e for e in emails if e.get("primary")), None)
                    if primary_email:
                        email = primary_email["email"]
            
            if not email:
                error_params = urlencode({"error": "no_email_from_github"})
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/login?{error_params}",
                    status_code=status.HTTP_302_FOUND
                )
        
        # Create or get user
        user = OAuthService.get_or_create_oauth_user(
            db=db,
            email=email,
            full_name=user_info.get("name") or user_info.get("login", "GitHub User"),
            oauth_provider="github",
            oauth_id=str(user_info["id"]),
            avatar_url=user_info.get("avatar_url")
        )
        
        # Update last login
        AuthService.update_last_login(db, user)
        
        # Create JWT tokens
        auth_tokens = AuthService.create_tokens(user)
        
        # Redirect to frontend with tokens
        token_params = urlencode({
            "access_token": auth_tokens.access_token,
            "refresh_token": auth_tokens.refresh_token,
            "token_type": auth_tokens.token_type,
        })
        
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?provider=github&{token_params}",
            status_code=status.HTTP_302_FOUND
        )
        
    except Exception as e:
        print(f"GitHub OAuth error: {str(e)}")  # Debug log
        error_params = urlencode({"error": str(e)})
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?{error_params}",
            status_code=status.HTTP_302_FOUND
        )