from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from kyc_db import User, KYC, KYCStatusLog, KYCStatus
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

def get_user_manager(kyc_id,db):
    try:
       
        user = db.scalar(select(KYC).where(KYC.kyc_id == kyc_id))
        kyc_status = db.scalar(select(KYCStatusLog).where(KYCStatusLog.kyc_id == kyc_id))
        user.kyc_status = kyc_status.status if kyc_status else None
        return user
    except Exception as e:
        raise e
    
        
def create_user_manager(user_data: dict,db):
    try:
       
        new_user = KYC(**user_data)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        raise e
    
        
def update_user_manager(kyc_id, update_data: KYC, db: Session):
        # Fetch the KYC record
        user = db.scalar(select(KYC).where(KYC.kyc_id == kyc_id))

        if not user:
            raise ValueError(f"KYC with id {kyc_id} not found")
        # Update scalar fields directly
        if update_data.kyc_mobile is not None:
            user.kyc_mobile = update_data.kyc_mobile
        if update_data.kyc_email is not None:
            user.kyc_email = update_data.kyc_email
        if update_data.user_id is not None:
            user.user_id = update_data.user_id
        if update_data.submitted_at is not None:
            user.submitted_at = update_data.submitted_at
        if update_data.ai_notes is not None:
            user.ai_notes = update_data.ai_notes
        
        # Merge the data field (JSON content)
        if update_data.data is not None and isinstance(update_data.data, dict):
            existing_data = user.data or {}
            user.data = {**existing_data, **update_data.data}
            flag_modified(user, "data")
        db.commit()
        db.refresh(user)
        return user
        
def delete_user_manager(kyc_id,db):
    try:
        user = db.scalar(select(KYC).where(User.kyc_id == kyc_id))
        db.delete(user)
        db.commit()
        return True
    except Exception as e:
        raise e
    
        
def get_kyc_manager(kyc_id,db):
    try:
        kyc = db.scalar(select(KYC).where(KYC.kyc_id == kyc_id))
        return kyc
    except Exception as e:
        raise e
    

def get_user_id_from_kyc(kyc_id: int,db) -> int:
    try:
        kyc = db.scalar(select(KYC).where(KYC.kyc_id == kyc_id))
        return kyc.user_id if kyc else None
    except Exception as e:
        raise e
    
        
def get_kyc_status_log(kyc_id,db):
    try:
        status_log = db.scalar(select(KYCStatusLog).where(KYCStatusLog.kyc_id == kyc_id))
        return status_log
    except Exception as e:
        raise e
    
        
def update_kyc_status_log(kyc_id: int, new_status: KYCStatus, db: Session):
    try:
        # Fetch existing KYC status log
        status_log = db.scalar(
            select(KYCStatusLog).where(KYCStatusLog.kyc_id == kyc_id)
        )

        if not status_log:
            raise HTTPException(status_code=404, detail=f"KYCStatusLog for KYC {kyc_id} not found")

        # Update status & metadata
        status_log.status = new_status
        status_log.changed_at = datetime.utcnow()

        db.commit()
        db.refresh(status_log)

        return status_log

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update status log: {str(e)}")
        
