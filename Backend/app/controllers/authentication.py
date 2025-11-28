from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from kyc_db.database import db
from services.auth.manager import register_user, login_user, verify_user_token
from models.user_schema import UserRegister, UserLogin
from models.base_response import BaseResponse
import os

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

COOKIE_NAME = "access_token"
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "False") == "True"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")

def set_access_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,      
        secure=COOKIE_SECURE,     
        samesite=COOKIE_SAMESITE,  
        max_age=86400,      
        path="/"
    )

def error_response(response: Response, message: str, status_code: int):
    response.status_code = status_code
    return BaseResponse(success=False, message=message, data=None).to_dict()

@router.post("/register", response_model=BaseResponse)
def register(payload: UserRegister, response: Response, db_session: Session = Depends(db.get_db)):
    try:
        register_response = register_user(payload, db_session)
        return register_response.to_dict()

    except HTTPException as e:
        return error_response(response, str(e.detail), e.status_code)
    except Exception as e:
        print(f"Registration Error: {str(e)}")
        return error_response(response, f"Unexpected error occurred while registering the user", 500)

@router.post("/login", response_model=BaseResponse)
def login(payload: UserLogin, response: Response, db_session: Session = Depends(db.get_db)):
    try:
        login_response = login_user(payload, db_session)
        token = login_response.data.get("access_token", "")
        set_access_cookie(response, token)
        return login_response.to_dict()

    except HTTPException as e:
        return error_response(response, str(e.detail), e.status_code)
    except Exception as e:
        print(f"Login Error: {str(e)}")
        return error_response(response, f"Unexpected error occurred while login the user", 500)

    
@router.get("/verify")
def verify(response: Response, token: str = None, request: Request = None, db_session: Session = Depends(db.get_db)):
    """Verify token from query param or cookie."""
    try:
        if token is None and request is not None:
            token = request.cookies.get(COOKIE_NAME)
        if not token:
            return error_response(response, "Token missing", 401)

        res = verify_user_token(token, db_session)
        return res.to_dict()
    
    except HTTPException as e:
        return error_response(response, str(e.detail), e.status_code)
    except Exception as e:
        print(f"Token Verification Error: {str(e)}")
        return error_response(response, f"Unexpected error occurred while registering the user", 500)

    
@router.post("/logout")
def logout(response: Response):
    """Logout user by clearing the access token cookie."""
    try:
        response.delete_cookie(
            key=COOKIE_NAME,
            path="/",
            samesite=COOKIE_SAMESITE
        )

        res = BaseResponse(
                success=True,
                message="Logged out successfully",
                data=None
            )
        return res.to_dict()
        
    except Exception as e:
        print(f"Logout Error: {str(e)}")
        return error_response(
            response,
            "Unexpected error occurred during logout",
            500
        )