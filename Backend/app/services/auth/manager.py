from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.base_response import BaseResponse
from models.user_schema import UserRegister, UserLogin
from kyc_db.database import db
from kyc_db.db_models import User
from kyc_auth.utils import create_access_token, verify_access_token
from jwt import ExpiredSignatureError, InvalidTokenError

def register_user(payload: UserRegister, db_session: Session = Depends(db.get_db)) -> BaseResponse:
    existing_user = db_session.query(User).filter(
        (User.user_email == payload.user_email) | (User.user_name == payload.user_name)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email or username already exists."
        )

    new_user = User(
        user_name=payload.user_name.strip(),
        user_email=payload.user_email.strip().lower(),
    )
    new_user.password = payload.password  # hashed by model setter

    try:
        db_session.add(new_user)
        db_session.commit()
        db_session.refresh(new_user)
    except Exception as e:
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred while registering the user."
        )

    token = create_access_token({"user_id": new_user.user_id})
    return BaseResponse(success=True, message="User registered successfully", data={"access_token": token})


def login_user(payload: UserLogin, db_session: Session = Depends(db.get_db)) -> BaseResponse:
    user = db_session.query(User).filter(User.user_email == payload.user_email.lower()).first()
    
    if not user or not user.verify_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"user_id": user.user_id})
    return BaseResponse(success=True, message="Login successful", data={"access_token": token})


def verify_user_token(token: str, db_session: Session = Depends(db.get_db)) -> BaseResponse:
    try:
        payload = verify_access_token(token)
        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id"
            )

        user = db_session.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return BaseResponse(
            success=True,
            message="Token verified successfully",
            data={"user_id": user.user_id, "user_email": user.user_email}
        )

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error occurred while verifying the token"
        )
