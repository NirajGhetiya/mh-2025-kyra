# models/user.py
from __future__ import annotations
from typing import Any, List, Optional
from datetime import datetime
from sqlalchemy import (
    Column, Index, Integer, String, DateTime, JSON, ForeignKey, Enum as SQLEnum, text
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship, validates
from sqlalchemy.ext.hybrid import hybrid_property
from passlib.context import CryptContext
from enum import Enum as PyEnum
import hashlib

from .database import Base, db


# ----------------------------------------------------------------------
# Passlib context – use Argon2 if it is installed, otherwise fall back to
# a bcrypt version that is known to be compatible with Passlib.
# ----------------------------------------------------------------------



# --------------------------------------------------------------------------- #
# Ensure PostgreSQL ENUM type exists safely (only once)
# --------------------------------------------------------------------------- #
with db.engine.connect() as conn:
    conn.execute(
        text("""
        DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'kycstatus'
            ) THEN
                CREATE TYPE kycstatus AS ENUM (
                    'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'
                );
            END IF;
        END $$;
        """)
    )
    conn.commit()  # Required for DDL


# --------------------------------------------------------------------------- #
# ENUM Class for KYC Status
# --------------------------------------------------------------------------- #
class KYCStatus(str, PyEnum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


# --------------------------------------------------------------------------- #
# User Model
# --------------------------------------------------------------------------- #
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), unique=True, nullable=False, index=True)
    user_email = Column(String(255), unique=True, nullable=False, index=True)
    _password_hash = Column("password_hash", String(128), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()"))

    
    # ----------------------- #
    # Password handling
    # ----------------------- #
    
    def hash_password_sha256(self,password: str):
        # Create a SHA-256 hash object
        sha256 = hashlib.sha256()
        
        # Encode the password and update the hash object
        sha256.update(password.encode('utf-8'))
        
        # Return the hexadecimal representation of the hash
        return sha256.hexdigest()

    @hybrid_property
    def password(self) -> str:
        return self._password_hash

    @password.setter
    def password(self, plain_password: str) -> None:
       self._password_hash = self.hash_password_sha256(plain_password)

    def verify_password(self, plain_password: str) -> bool:
        return self._password_hash == self.hash_password_sha256(plain_password)

    # ----------------------- #
    # Validation
    # ----------------------- #
    @validates('user_email')
    def validate_email(self, key: str, email: str) -> str:
        email = email.strip().lower()
        if "@" not in email:
            raise ValueError("Invalid email address")
        return email

    def __repr__(self) -> str:
        return f"<User {self.user_name} ({self.user_email})>"


# --------------------------------------------------------------------------- #
# KYC Status Log Model (tracks status changes)
# --------------------------------------------------------------------------- #
class KYCStatusLog(Base):
    __tablename__ = "kyc_status"
    __table_args__ = (
        # For filtering by admin + status (MOST IMPORTANT)
        Index("idx_kycstatus_admin_status", "admin_id", "status"),

        # For fast joining on kyc_id
        Index("idx_kycstatus_kyc_id", "kyc_id"),

        # For ordering/filtering by changed_at (optional)
        Index("idx_kycstatus_changed_at", "changed_at"),
    )
    kyc_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    admin_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    status = Column(
        SQLEnum(KYCStatus, name="kycstatus"),
        nullable=False,
        default=KYCStatus.PENDING,
        server_default=text("'PENDING'")
    )
    changed_at = Column(DateTime(timezone=True), server_default=text("NOW()"))

   


    def __repr__(self) -> str:
       
        return f"<KYCStatusLog {self.kyc_id} → {self.status.value}>"


# --------------------------------------------------------------------------- #
# KYC Model (user's KYC submission)
# --------------------------------------------------------------------------- #
class KYC(Base):
    __tablename__ = "kyc"
    __table_args__ = (
        # JSONB GIN index for fast name search
        Index("idx_kyc_data_gin", "data", postgresql_using="gin"),

        # email search
        Index("idx_kyc_email", "kyc_email"),

        # submitted_at sorting
        Index("idx_kyc_submitted_at", "submitted_at"),

        # For joining with status table
        Index("idx_kyc_user_id", "user_id"),
    )

    # Shared primary key with kyc_status (1-to-1)
    kyc_id = Column(
        Integer,
        primary_key=True,
        unique=True,
        autoincrement=True
    )
    user_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    kyc_email = Column(String(255), nullable=False)
    kyc_mobile = Column(String(20), nullable=False)
    data = Column(JSONB, nullable=False, default=dict, server_default=text("'{}'"))
    ai_notes = Column(JSONB, nullable=True, default=dict, server_default=text("'{}'"))

    submitted_at = Column(DateTime(timezone=True), server_default=text("NOW()"))

    

    # ----------------------- #
    # Helper Methods
    # ----------------------- #
    def get_latest_status(self) -> KYCStatus:
        return self.status_log.status if self.status_log else KYCStatus.PENDING

    def add_ai_note(self, key: str, value: Any) -> None:
        if self.ai_notes is None:
            self.ai_notes = {}
        self.ai_notes[key] = value