import asyncio
import os
from fastapi import APIRouter, Depends, BackgroundTasks, Response
from models.user import PersonalInfo
from fastapi.responses import JSONResponse
from models.user import AddressForm
from models.user import DocumentsForm
from models.user import livenessInfo
from models.user import UserInfo    
from services.user import add_personal_info,add_address_info ,add_documents_info, add_liveness_info, get_kyc_details, generate_kyc_pdf, submit_user, get_kyc_manager, kyra_match_agent_bg
from sqlalchemy.ext.asyncio import AsyncSession
from kyc_db import  db


router = APIRouter(
    prefix="/api/user/kyc",  # All routes start with /users
    tags=["users"],   # Groups in docs
    responses={404: {"description": "Not found"}}
)

@router.get("/{kyc_id}")
def get_user(kyc_id: int, db: AsyncSession = Depends(db.get_db)):
    user_data = get_kyc_details(kyc_id,db)
    return {"message": f"Fetch Data for KycID : {kyc_id} successfully", "data": user_data}

@router.post("/{kyc_id}/personal")
def get_users(kyc_id: int,info: PersonalInfo,db: AsyncSession = Depends(db.get_db)):
    info = add_personal_info(kyc_id,info,db)
    return {"message": "Personal info saved successfully", "data": info}

@router.post("/{kyc_id}/address")
def add_address(kyc_id: int,info:AddressForm,db: AsyncSession = Depends(db.get_db)):
    info = add_address_info(kyc_id,info,db)
    return {"message": "Personal info saved successfully", "data": info}

@router.post("/{kyc_id}/documents")
def add_documents(kyc_id: int,info:DocumentsForm,db: AsyncSession = Depends(db.get_db)):
    info = add_documents_info(kyc_id,info,db)
    return {"message": "Personal info saved successfully", "data": info}

@router.post("/{kyc_id}/liveness")
def add_liveness(kyc_id: int,info:livenessInfo,db: AsyncSession = Depends(db.get_db)):
    info = add_liveness_info(kyc_id,info,db)
    return {"message": "Personal info saved successfully", "data": info}

@router.get("/{kyc_id}/submit")
async def create_user(backgroundtasks: BackgroundTasks, kyc_id: int,db: AsyncSession = Depends(db.get_db)):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT"))
    sender_email = os.getenv("SMTP_SENDER_EMAIL")
    sender_password = os.getenv("SMTP_SENDER_PASSWORD")
    
    is_verified = get_kyc_details(kyc_id,db)
    if( not is_verified):
        return {"message": f"KYC ID : {kyc_id} not found"}
    updated_status = submit_user(kyc_id,db)
    if(updated_status):
        data = get_kyc_manager(kyc_id,db)
        # print(f"Data to be sent to Kyra Match Agent: {data.data}")
        asyncio.create_task(
            kyra_match_agent_bg(kyc_id, data, smtp_server, smtp_port, sender_email, sender_password)
        )
        
        return {"message": f"User with KYC ID : {kyc_id} submitted successfully"}
    
    return {"message": f"KYC ID {kyc_id} is not in pending status"}
    
@router.get("/{kyc_id}/pdf")
def download_kyc_pdf(kyc_id: int, db=Depends(db.get_db)):
    pdf_bytes = generate_kyc_pdf(kyc_id, db)

    if not pdf_bytes:
        return JSONResponse(
            content={"message": "KYC ID not found or invalid status", "data": None},
            status_code=404
        )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=KYC_{kyc_id}.pdf"
        }
    )
    
