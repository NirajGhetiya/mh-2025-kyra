from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.future import select
from sqlalchemy import String, desc, func
from kyc_db import  db
from kyc_db import User, KYC, KYCStatusLog, KYCStatus
from datetime import date, datetime
from models.kyc_dashboard.kyc_dashboard_request_dto import KycDashboardRequestDTO

def add_kyc_status_entry(db_session: Session, user_id: int, admin_id: Optional[int]) -> int:
    try:
        """Initiate a KYC process for a user."""
        user = db_session.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=400,
                detail=f"User with id={user_id} does not exist"
            )
        new_kyc = KYCStatusLog(
            user_id=user_id,
            admin_id=admin_id,
            status=KYCStatus.PENDING.value,
            changed_at=datetime.utcnow()
        )
        db_session.add(new_kyc)
        db_session.commit()
        db_session.refresh(new_kyc)
        return new_kyc.kyc_id
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert KYC status: {str(e)}")
    
def add_kyc_entry(db_session: Session, kyc_id: int, user_id: int, name: str, email: str, mobile_number: str):
    """Adds a new KYC record."""
    try:
        kyc_entry = KYC(
            kyc_id=kyc_id,
            user_id=user_id,
            kyc_email=email,
            kyc_mobile=mobile_number,
            data= {
                'emailId': email,
                'name': name,
                'mobileNo' : mobile_number
            },
            submitted_at=datetime.utcnow()
        )
        db_session.add(kyc_entry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert KYC entry: {str(e)}")
    
def approve_kyc(db_session: Session, kyc_id: int, admin_id: int):
    """Approve a KYC request."""
    try:
        existing_status = (
        db_session.query(KYCStatusLog)
        .filter(KYCStatusLog.kyc_id == kyc_id)
        .first()
    )
        if not existing_status:
            raise HTTPException(status_code=404, detail="KYC status record not found")

    # Update values
        existing_status.status = KYCStatus.APPROVED.value
        existing_status.admin_id = admin_id
        existing_status.changed_at = datetime.utcnow()

        db_session.commit()
        db_session.refresh(existing_status)
        return existing_status.kyc_id
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to approve KYC: {str(e)}")
    
def reject_kyc(db_session: Session, kyc_id: int, admin_id: int):
    """Reject a KYC request."""
    try:
        existing_status = (
        db_session.query(KYCStatusLog)
        .filter(KYCStatusLog.kyc_id == kyc_id)
        .first()
    )
        if not existing_status:
            raise HTTPException(status_code=404, detail="KYC status record not found")

    # Update values
        existing_status.status = KYCStatus.REJECTED.value
        existing_status.admin_id = admin_id
        existing_status.changed_at = datetime.utcnow()

        db_session.commit()
        db_session.refresh(existing_status)
        return existing_status.kyc_id
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to approve KYC: {str(e)}")
    
def initiate_rekyc(db_session: Session, kyc_id: int, admin_id: int):
    status_row = (
        db_session.query(KYCStatusLog)
        .filter(KYCStatusLog.kyc_id == kyc_id)
        .first()
    )
    if not status_row:
        raise HTTPException(404, "KYC status record not found")

    # Fetch KYC row
    kyc_row = db_session.query(KYC).filter(KYC.kyc_id == kyc_id).first()
    if not kyc_row:
        raise HTTPException(404, "KYC record not found")

    # Update status
    status_row.status = KYCStatus.PENDING.value
    status_row.admin_id = admin_id
    status_row.changed_at = datetime.utcnow()

    user_data = {"user_name": kyc_row.data.get("name"), "email": kyc_row.kyc_email}
    # Reset KYC.data to {}
    kyc_row.data = {}

    db_session.commit()
    return {"kyc_id": kyc_id, "user_data": user_data, "status": "pending"}
    
def get_dashboard_data(
    db_session: Session,
    admin_id: int,
    search_field=None,
    search_value=None,
    status=None,
    page=0,
    size=10
):
    try:
        # --- Base WHERE conditions (reused for count & data) ---
        conditions = [KYCStatusLog.admin_id == admin_id]

        if status:
            status = status.lower()
            allowed = ["approved", "pending", "under_review", "rejected"]
            if status not in allowed:
                raise HTTPException(status_code=400, detail="Invalid status filter")
            conditions.append(KYCStatusLog.status == status)

        if search_field and search_value:
            if search_field == "kyc_id":
                conditions.append(KYC.kyc_id == int(search_value))

            elif search_field == "user_name":
                # cast to TEXT to allow index scanning
                conditions.append(
                    KYC.data["name"].astext.cast(String).ilike(f"%{search_value}%")
                )

            elif search_field == "email":
                conditions.append(KYC.kyc_email.ilike(f"%{search_value}%"))

        # --- FAST COUNT QUERY ---
        total_count = db_session.execute(
            select(func.count())
            .select_from(KYCStatusLog)
            .join(KYC, KYC.kyc_id == KYCStatusLog.kyc_id)
            .where(*conditions)
        ).scalar()

        # --- PAGED DATA QUERY (only required columns) ---
        query = (
            select(
                KYCStatusLog.kyc_id,
                KYCStatusLog.status,
                KYC.kyc_email,
                KYC.data["name"].astext.label("user_name"),
                KYC.data["photoImage"].astext.label("photoImage"),
                KYC.submitted_at
            )
            .join(KYC, KYC.kyc_id == KYCStatusLog.kyc_id)
            .where(*conditions)
            .order_by(KYC.submitted_at.desc())
            .limit(size)
            .offset(page * size)
        )

        result = db_session.execute(query).all()

        # --- Serialize results ---
        serialized_data = []
        for row in result:
            r = row._mapping
            serialized_data.append({
                "kyc_id": r["kyc_id"],
                "user_name": r["user_name"],
                "email": r["kyc_email"],
                "photoImage": r["photoImage"],
                "status": r["status"] if isinstance(r["status"], str) else r["status"].value,
                "submitted_at": r["submitted_at"].isoformat() if r["submitted_at"] else None,
            })

        return serialized_data, total_count

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")

    
def get_kyc_details(db_session: Session, kyc_id: int):
    """Fetches detailed KYC data for a given KYC ID."""
    try:
        query = (
            select(
                KYC,
                KYCStatusLog
            )
            .join(KYCStatusLog, KYC.kyc_id == KYCStatusLog.kyc_id)
            .where(KYC.kyc_id == kyc_id)
        )
        result = db_session.execute(query).first()
        if not result:
            raise HTTPException(status_code=404, detail="KYC record not found")

        kyc_record, status_log = result._mapping.values()
        return kyc_record, status_log

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch KYC details: {str(e)}")
    
def serialize_kyc_status_log(obj):
    return {
        "kyc_id": obj.kyc_id,
        "status": obj.status,
        "user_name": getattr(obj, "user_name", None),
        "email": getattr(obj, "kyc_email", None),
        "changed_at": obj.changed_at.isoformat() if getattr(obj, "changed_at", None) else None,
    }

def get_main_dashboard_data(db: Session, admin_id: int) -> dict:
    sub_latest_status = (
        db.query(
            KYCStatusLog.kyc_id,
            KYCStatusLog.status,
            KYCStatusLog.changed_at,
            func.row_number().over(
                partition_by=KYCStatusLog.kyc_id,
                order_by=KYCStatusLog.changed_at.desc()
            ).label("rn")
        ).filter(KYCStatusLog.admin_id == admin_id)
        .subquery()
    )

    latest_status_only = db.query(sub_latest_status).filter(sub_latest_status.c.rn == 1).subquery()

    status_counts = dict(db.query(
        latest_status_only.c.status,
        func.count()
    ).group_by(latest_status_only.c.status).all())

    # Ensure missing statuses return 0
    total_pending= status_counts.get(KYCStatus.PENDING.value, 0)
    total_under_review= status_counts.get(KYCStatus.UNDER_REVIEW.value, 0)
    total_approved=status_counts.get(KYCStatus.APPROVED.value, 0)
    total_rejected= status_counts.get(KYCStatus.REJECTED.value, 0)
    total_kyc_count = db.query(func.count(KYC.kyc_id)).filter(KYC.user_id == admin_id).scalar()

    today = date.today()
    todays_kyc_count = (
        db.query(KYC)
        .filter(func.date(KYC.submitted_at) == today)
        .filter(KYC.user_id == admin_id)
        .count()
    )

    top_kyc_query = (
        db.query(
            KYC.kyc_id,
            KYC.data["name"].astext.label("user_name"),
            latest_status_only.c.status,
            latest_status_only.c.changed_at
        )
        .join(User, User.user_id == KYC.user_id)
        .join(latest_status_only, latest_status_only.c.kyc_id == KYC.kyc_id)
        .order_by(desc(latest_status_only.c.changed_at))
        .limit(4)
        .all()
    )

    top_kycs = [
        {
            "kyc_id": k.kyc_id,
            "name": k.user_name,
            "changed_at": k.changed_at.isoformat() if k.changed_at else None,
            "status": k.status,
        }
        for k in top_kyc_query
    ]
    approval_rate = (
        round(((total_approved / total_kyc_count) * 100), 2)
        if total_kyc_count > 0 else 0
    )
    return {
        "total_kyc_count": total_kyc_count,
        "approval_rate": approval_rate,
        "todays_kyc_count": todays_kyc_count,
        "total_approved": total_approved,
        "total_pending": total_pending,
        "total_under_review": total_under_review,
        "total_rejected": total_rejected,
        "top_kycs": top_kycs,
        "avg_processing": 14.2,
        "week_growth": 5.4
    }