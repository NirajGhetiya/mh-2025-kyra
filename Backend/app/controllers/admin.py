import csv
import io
import os
import time
from fastapi import APIRouter, HTTPException, Cookie, Depends, Query, Path, BackgroundTasks, Response
from sqlalchemy.orm import Session
from dataclasses import asdict
from kyc_db.database import db
from models import KycInitiateRequestDTO, KycInitiateResponseDTO, KycDashboardRequestDTO, KycDashboardResponseDTO, KycDashboardDetailsResponseDTO, KycDetailsDataDTO, AdminDashboardResponseDTO, KycMainDashboardDataDTO, BaseResponse
from kyc_email_sender import EmailManager
from typing import Optional
from kyc_db import KYC
from services.admin.manager import add_kyc_status_entry, add_kyc_entry, get_dashboard_data, get_kyc_details, get_main_dashboard_data, approve_kyc, reject_kyc, initiate_rekyc
from kyc_auth import verify_access_token
router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/kyc/dashboard-data", response_model=KycDashboardResponseDTO)
def dashboard( 
    search: Optional[str] = Query(None, description="Filter by KYC ID, User Name, or Email"),
    status: Optional[str] = Query(None, description="Filter by status: approved, pending, under_review, rejected"),
    page: int = Query(0, description="Page number for pagination"),
    size: int = Query(10, description="Number of records per page"),
    db_session: Session = Depends(db.get_db), access_token: Optional[str] = Cookie(None)):
    try:
        # Validate token in cookies
        if not access_token:
            raise HTTPException(status_code=401, detail="Missing JWT token in cookies")

        user_data = verify_access_token(access_token)
        admin_id = user_data.get("user_id")

        if not admin_id:
            raise HTTPException(status_code=400, detail="Invalid token payload")
        
        
        search_field = None
        search_value = None

        if search:
            # You can decide logic here for detecting what type of search
            if search.isdigit():  # assume KYC IDs start with 'KYC'
                search_field = "kyc_id"
                search_value = int(search)
            elif "@" in search:  # likely an email
                search_field = "email"
                search_value = search
            else:  # otherwise treat as username
                search_field = "user_name"
                search_value = search
        st = time.time()
        # Simulate fetching dashboard data (you can connect to DB or other services here)
        dashboard_data, total_count = get_dashboard_data(db_session, admin_id=admin_id, search_field=search_field,search_value=search_value,status=status, page=page, size=size)
        print(f"Time taken for dashboard data extraction {time.time()-st}")
        return KycDashboardResponseDTO(
            success=True,
            message="KYC dashboard data fetched successfully",
            data={
                "total_records": total_count,
                "page": page,
                "page_size": size,
                "records": dashboard_data
            } 
        )
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

@router.get("/kyc/dashboard/download")
def download_dashboard_csv(
    status: str = None,
    search_field: str = None,
    search_value: str = None,
    db_session: Session = Depends(db.get_db),
    access_token: Optional[str] = Cookie(None)
):
        if not access_token:
            raise HTTPException(status_code=401, detail="Missing JWT token in cookies")

        user_data = verify_access_token(access_token)
        admin_id = user_data.get("user_id")

        if not admin_id:
            raise HTTPException(status_code=400, detail="Invalid token payload")
    # ---- Step 1: get total count first ----
        _, total_count = get_dashboard_data(
            db_session=db_session,
            admin_id=admin_id,
            search_field=search_field,
            search_value=search_value,
            status=status,
            page=0,
            size=1_000_000_000  
        )

        # ---- Step 2: fetch ALL rows at once ----
        records, _ = get_dashboard_data(
            db_session=db_session,
            admin_id=admin_id,
            search_field=search_field,
            search_value=search_value,
            status=status,
            page=0,
            size=total_count,
        )

        # ---- Step 3: create CSV in memory ----
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            "kyc_id", "user_name", "email", "status", "submitted_at"
        ])
        writer.writeheader()
        cleaned_records = []
        for row in records:
            cleaned_records.append({
                "kyc_id": row["kyc_id"],
                "user_name": row["user_name"],
                "email": row["email"],
                "status": row["status"],
                "submitted_at": row["submitted_at"]
            })

        writer.writerows(cleaned_records)

        csv_data = output.getvalue()
        output.close()

        # ---- Step 4: return CSV as download ----
        return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=admin_{admin_id}_dashboard.csv"
        },
    )

@router.get("/kyc/dashboard", response_model=AdminDashboardResponseDTO)
def kyc_dashboard_data(
    db_session: Session = Depends(db.get_db),
    access_token: Optional[str] = Cookie(None)
):
    try:
        # Validate token
        if not access_token:
            raise HTTPException(status_code=401, detail="Missing JWT token in cookies")

        user_data = verify_access_token(access_token)
        admin_id = user_data.get("user_id")

        if not admin_id:
            raise HTTPException(status_code=400, detail="Invalid token payload")

        # Fetch dashboard data
        main_dashboard_data = get_main_dashboard_data(db_session, admin_id=admin_id)
        # Build response DTO
        return AdminDashboardResponseDTO(
            success=True,
            message="KYC dashboard data fetched successfully",
            data=KycMainDashboardDataDTO(**main_dashboard_data)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
    


@router.post("/kyc/initiate", response_model=KycInitiateResponseDTO)
async def initiate_kyc(request_data: KycInitiateRequestDTO,background_tasks: BackgroundTasks, db_session: Session = Depends(db.get_db), access_token: Optional[str] = Cookie(None)):
    try:
        start = time.time()
        smtp_server = os.getenv("SMTP_SERVER")
        smtp_port = int(os.getenv("SMTP_PORT"))
        sender_email = os.getenv("SMTP_SENDER_EMAIL")
        sender_password = os.getenv("SMTP_SENDER_PASSWORD")
        base_url = os.getenv("INITIATE_URL")
        # Validate token in cookies
        if not access_token:
            raise HTTPException(status_code=401, detail="Missing JWT token in cookies")

        user_data = verify_access_token(access_token)
        user_id = user_data.get("user_id")
        admin_id = user_data.get("user_id")

        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token payload")

        request_data.validate_request()
        # Simulate KYC initiation (you can connect to DB or other services here)
        kyc_id = add_kyc_status_entry(db_session, user_id=user_id, admin_id=admin_id)
        result = {"kyc_id": kyc_id, "status": "Initiated"}
        add_kyc_entry(
            db_session,
            kyc_id=kyc_id,
            user_id=user_id,
            name=request_data.name,
            email=request_data.email,
            mobile_number=request_data.mobile_number
        )
        
        db_session.commit()
        
        email_manager = EmailManager(smtp_server, smtp_port, sender_email, sender_password)
        end = time.time()
        print(f"KYC Initiation took {end - start} seconds")
        background_tasks.add_task(
            email_manager.send_welcome_email,
            recipient_email=request_data.email,
            user_name=request_data.name,
            kyc_id=kyc_id,
            base_url=base_url
        )
        return KycInitiateResponseDTO(
            success=True,
            message="KYC process initiated successfully",
            data=result
        )

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")


@router.get("/kyc/{kyc_id}", response_model=KycDashboardDetailsResponseDTO)
def kyc_detail(
     kyc_id: int = Path(..., description="KYC ID to fetch details for"),
    db_session: Session = Depends(db.get_db),
    access_token: Optional[str] = Cookie(None)):
    try:
        # Validate token in cookies
        if not access_token:
            raise HTTPException(status_code=401, detail="Missing JWT token in cookies")

        user_data = verify_access_token(access_token)
        admin_id = user_data.get("user_id")

        if not admin_id:
            raise HTTPException(status_code=400, detail="Invalid token payload")

        # Simulate fetching KYC details (you can connect to DB or other services here)
        kyc_details, status_log = get_kyc_details(db_session, kyc_id=kyc_id)
        data= {
                    "kyc_id":kyc_details.kyc_id,
                    "kyc_email":kyc_details.kyc_email,
                    "kyc_mobile":kyc_details.kyc_mobile,
                    "status":status_log.status.value if hasattr(status_log.status, "value") else status_log.status,
                    "changed_at":status_log.changed_at.isoformat() if status_log.changed_at else None,
                    "submitted_at":kyc_details.submitted_at.isoformat() if kyc_details.submitted_at else None,
                    "ai_notes":kyc_details.ai_notes or {},
                    "details":KycDetailsDataDTO(**(kyc_details.data or {}))
                }
        response_dto = KycDashboardDetailsResponseDTO(
            success=True,
            message=f"KYC details for ID {kyc_id} fetched successfully",
            data=data
        )
        return asdict(response_dto)
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
    
@router.post("/kyc/{kyc_id}/approve")
def kyc_detail(
    background_tasks: BackgroundTasks,
    kyc_id: int = Path(..., description="KYC ID to fetch details for"),
    db_session: Session = Depends(db.get_db),
    access_token: Optional[str] = Cookie(None)):
    try:
        smtp_server = os.getenv("SMTP_SERVER")
        smtp_port = int(os.getenv("SMTP_PORT"))
        sender_email = os.getenv("SMTP_SENDER_EMAIL")
        sender_password = os.getenv("SMTP_SENDER_PASSWORD")
        # Validate token in cookies
        if not access_token:
            raise HTTPException(status_code=401, detail="Missing JWT token in cookies")

        user_data = verify_access_token(access_token)
        admin_id = user_data.get("user_id")

        if not admin_id:
            raise HTTPException(status_code=400, detail="Invalid token payload")

        # Simulate fetching KYC details (you can connect to DB or other services here)
        approved_kycid = approve_kyc(db_session, kyc_id=kyc_id, admin_id=admin_id)
        if approved_kycid is None:
            return {"KYC ID Invalid"}
        
        kyc_record = db_session.get(KYC, kyc_id)
        existing_data = kyc_record.data or {} 
        user_name = existing_data.get("name", "")
        email = existing_data.get("emailId","")
        email_manager = EmailManager(smtp_server, smtp_port, sender_email, sender_password)
        background_tasks.add_task(
            email_manager.send_congrats_email,
            recipient_email=email,
            user_name=user_name,
            kyc_id=kyc_id
        )
        
        response_dto = BaseResponse(
            success=True,
            message=f"KYC approved for ID {approved_kycid} successfully",
            data={"kyc_id": approved_kycid, "status": "approved"}
        )
        return asdict(response_dto)
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
    
@router.post("/kyc/{kyc_id}/re-kyc")
def kyc_detail(
    background_tasks: BackgroundTasks,
    kyc_id: int = Path(..., description="KYC ID to fetch details for"),
    db_session: Session = Depends(db.get_db),
    access_token: Optional[str] = Cookie(None)):
    try:
        smtp_server = os.getenv("SMTP_SERVER")
        smtp_port = int(os.getenv("SMTP_PORT"))
        sender_email = os.getenv("SMTP_SENDER_EMAIL")
        sender_password = os.getenv("SMTP_SENDER_PASSWORD")
        base_url = os.getenv("INITIATE_URL")
        # Validate token in cookies
        if not access_token:
            raise HTTPException(status_code=401, detail="Missing JWT token in cookies")

        user_data = verify_access_token(access_token)
        admin_id = user_data.get("user_id")

        if not admin_id:
            raise HTTPException(status_code=400, detail="Invalid token payload")

        # Simulate fetching KYC details (you can connect to DB or other services here)
        re_kyc_data = initiate_rekyc(db_session, kyc_id=kyc_id, admin_id=admin_id)
        print(re_kyc_data)
        re_kycid = re_kyc_data.get("kyc_id")
        response_dto = BaseResponse(
            success=True,
            message=f"KYC for ID {re_kycid} has been sent to Re-KYC successfully",
            data={"kyc_id": re_kycid, "status": "pending"}
        )
      
        email_manager = EmailManager(smtp_server, smtp_port, sender_email, sender_password)
        background_tasks.add_task (email_manager.send_rekyc_email,
            recipient_email=re_kyc_data.get("user_data").get("email"),
            user_name = re_kyc_data.get("user_data", {}).get("user_name", ""),
            kyc_id=kyc_id,
            base_url=base_url
        )
        return asdict(response_dto)
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
    
@router.post("/kyc/{kyc_id}/reject")
def kyc_detail(
    kyc_id: int = Path(..., description="KYC ID to fetch details for"),
    db_session: Session = Depends(db.get_db),
    access_token: Optional[str] = Cookie(None)):
    try:
        # Validate token in cookies
        if not access_token:
            raise HTTPException(status_code=401, detail="Missing JWT token in cookies")

        user_data = verify_access_token(access_token)
        admin_id = user_data.get("user_id")

        if not admin_id:
            raise HTTPException(status_code=400, detail="Invalid token payload")

        # Simulate fetching KYC details (you can connect to DB or other services here)
        rejected_kycid = reject_kyc(db_session, kyc_id=kyc_id, admin_id=admin_id)
        
        response_dto = BaseResponse(
            success=True,
            message=f"KYC rejected for ID {rejected_kycid} successfully",
            data={"kyc_id": rejected_kycid, "status": "rejected"}
        )
        return asdict(response_dto)
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
    
    