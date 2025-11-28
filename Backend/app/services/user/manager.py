import asyncio
import logging
from typing import Optional
from .user_db import *
from models.user import PersonalInfo
from sqlalchemy import cast, update
from sqlalchemy.dialects.postgresql import JSONB
from kyc_db import KYCStatus
from kyc_client import KYCClient
from models.user.user_info import dict_to_dataclass, UserData
from kyc_pdf.pdf_service import DynamicPDF
from dataclasses import asdict
from datetime import datetime
from zoneinfo import ZoneInfo
from kyc_db import async_session_maker
from openai import AsyncOpenAI
from services.ai import generate_kyc_match_review, generate_liveness_review, generate_risk_score, is_all_confidence_high
from kyc_email_sender import EmailManager
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)

def _clean_base64(data: Optional[str]) -> str:
    if not data:
        return ""
    if "," in data:
        return data.split(",", 1)[1]  # remove prefix like data:image/jpeg;base64,
    return data

def add_personal_info(kyc_id: int, personal_info: PersonalInfo,db):
    user_status = get_kyc_status_log(kyc_id,db)
    print("User Status:", user_status)
    if user_status and user_status.status == KYCStatus.PENDING.value:
        user_data = get_user_manager(kyc_id,db)
        user_data.data['name'] = personal_info.name
        user_data.data['gender'] = personal_info.gender
        dob_obj = datetime.strptime(personal_info.dob, "%Y-%m-%d")
        user_data.data['dob'] = dob_obj.strftime("%d/%m/%Y")
        user_data.data['emailId'] = personal_info.emailId
        user_data.data['mobileNo'] = personal_info.mobileNo
        user_data.data['fatherName'] = personal_info.fatherName
        user_data.data['photoImage'] = personal_info.photoImage
        user = update_user_manager(kyc_id, user_data,db)
        return user
    else:
        print(F"User Status Invalid:", user_status)
        print("Cannot add personal info. KYC is not in PENDING status.")
        return None
    
def add_address_info(kyc_id: int, address_info,db):
    user_status = get_kyc_status_log(kyc_id,db)
    print("User Status:", user_status)
    if user_status and user_status.status == KYCStatus.PENDING.value:
        user_data = get_user_manager(kyc_id,db)
        user_data.data['permanentAddress'] = address_info.permanentAddress.to_dict()
        user_data.data['corporateAddress'] = address_info.corporateAddress.to_dict()
        user = update_user_manager(kyc_id, user_data,db)
        return user
    else:
        print(F"User Status Invalid:", user_status)
        print("Cannot add address info. KYC is not in PENDING status.")
        return None
    
def add_documents_info(kyc_id: int, documents_info,db):
    user_status = get_kyc_status_log(kyc_id,db)
    print("User Status:", user_status)
    if user_status and user_status.status == KYCStatus.PENDING.value:
        user_data = get_user_manager(kyc_id,db)
        # user_data.data['permanentAddressDocuments'] = documents_info.permanentAddressDocuments.to_dict()
        # user_data.data['corporateAddressDocuments'] = documents_info.corporateAddressDocuments.to_dict()
        per_doc = documents_info.permanentAddressDocuments.to_dict()
        corp_doc = documents_info.corporateAddressDocuments.to_dict()
        per_doc = per_doc
        corp_doc = corp_doc
        
        user_data.data['permanentAddressDocuments'] = per_doc
        user_data.data['corporateAddressDocuments'] = corp_doc
        
        user = update_user_manager(kyc_id, user_data,db)
        return user
    else:
        print(F"User Status Invalid:", user_status)
        print("Cannot add documents info. KYC is not in PENDING status.")
        return None
        
def map_ovd_type(ovd: str) -> str:
    if not ovd:
        return ""
    return OVD_TYPE_MAP.get(ovd, ovd)

OVD_TYPE_MAP = {
    "AadhaarCard": "AadhaarRegular",
    "Passport": "PassportRegular",
    "VoterCard": "VoterCardRegular"
}
def add_liveness_info(kyc_id: int, liveness_info,db):
    user_status = get_kyc_status_log(kyc_id,db)
    print("User Status:", user_status)
    if user_status and user_status.status == KYCStatus.PENDING.value:
        user_data = get_user_manager(kyc_id,db)
        user_data.data['livenessStatus'] = liveness_info.livenessStatus
        user_data.data['livenessScore'] = liveness_info.livenessScore
        user_data.data['livenessImage'] = liveness_info.livenessImage
        user = update_user_manager(kyc_id, user_data,db)
        return user
    else:
        print(F"User Status Invalid:", user_status)
        print("Cannot add liveness info. KYC is not in PENDING status.")
        return None


def get_kyc_details(kyc_id: int,db):
    user_data = get_user_manager(kyc_id,db)
    return user_data

def generate_kyc_pdf(kyc_id: int, db_session):
    user_status = get_kyc_status_log(kyc_id,db_session)
    print("User Status:", user_status)
    if user_status and user_status.status == KYCStatus.PENDING.value:
        print("KYC is in PENDING status. Cannot generate PDF.")
        return None
    
    kyc_obj = db_session.query(KYC).filter(KYC.kyc_id == kyc_id).first()
    
    if not kyc_obj:
        raise HTTPException(status_code=404, detail="KYC ID not found")
    
    data = kyc_obj.data

    try:
        user_data = dict_to_dataclass(data, UserData)
        generated_date = datetime.now(ZoneInfo("Asia/Kolkata")).strftime("%d-%m-%Y %I:%M %p")

        pdf_data = asdict(user_data)
        pdf_data["generated_date"] = generated_date

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid data structure: {str(e)}"
        )

    pdf = DynamicPDF()
    pdf_bytes = pdf.generate(pdf_data)

    return pdf_bytes

def submit_user(kyc_id: int, db):
    user_status = get_kyc_status_log(kyc_id,db)
    print("User Status:", user_status)
    if user_status and user_status.status == KYCStatus.PENDING.value:
        # Here you can add additional verification logic if needed
        # For now, we will just change the status to SUBMITTED
        updated_status = update_kyc_status_log(kyc_id, KYCStatus.UNDER_REVIEW.value, db)
        return True
    else:
        print(F"User Status Invalid:", user_status)
        print("Cannot submit KYC. It is not in PENDING status.")
        return False

def kyra_match_agent(kyc_id: int, data):
    json_data = data.data
    # logging.info(f"KYRA MATCH AGENT DATA: {json_data}")
    logger.info(f"PERPOA : {json_data.get('permanentAddressDocuments', {}).get('ovdType', '')}")
    kyc_client = KYCClient()
    match_result = kyc_client.match_document(
            name=json_data.get("name", ""),
            dob=json_data.get("dob", ""),
            gender=json_data.get("gender", ""),
            father_name=json_data.get("fatherName", ""),
            spouse_name=json_data.get("spouseName", ""),
            email=json_data.get("emailId", ""),
            mobile=json_data.get("mobileNo", ""),

            cor_poa_image=_clean_base64(json_data.get("corporateAddressDocuments", {}).get("ovdImage", "")),
            cor_poa_type=map_ovd_type(json_data.get("corporateAddressDocuments", {}).get("ovdType", "")),
            cor_poa_number=json_data.get("corporateAddressDocuments", {}).get("ovdNumber", ""),
            cor_address=json_data.get("permanentAddress", {}).get("streetAddress", "") + ", " + json_data.get("permanentAddress", {}).get("city", "") + ", " + json_data.get("permanentAddress", {}).get("state", "") + ", " + json_data.get("permanentAddress", {}).get("country", "India") + " - " + json_data.get("permanentAddress", {}).get("zipCode", ""),
            cor_city=json_data.get("corporateAddress", {}).get("city", ""),
            cor_state=json_data.get("corporateAddress", {}).get("state", ""),
            cor_country=json_data.get("corporateAddress", {}).get("country", "India"),
            cor_pin=json_data.get("corporateAddress", {}).get("zipCode", ""),

            per_poa_image = _clean_base64(json_data.get("permanentAddressDocuments", {}).get("ovdImage", "")),
            per_poa_type=map_ovd_type(json_data.get("permanentAddressDocuments", {}).get("ovdType", "")),
            per_poa_number=json_data.get("permanentAddressDocuments", {}).get("ovdNumber", ""),
            per_address=json_data.get("permanentAddress", {}).get("streetAddress", "") + ", " + json_data.get("permanentAddress", {}).get("city", "") + ", " + json_data.get("permanentAddress", {}).get("state", "") + ", " + json_data.get("permanentAddress", {}).get("country", "India") + " - " + json_data.get("permanentAddress", {}).get("zipCode", ""),
            per_city=json_data.get("permanentAddress", {}).get("city", ""),
            per_state=json_data.get("permanentAddress", {}).get("state", ""),
            per_country=json_data.get("permanentAddress", {}).get("country", "India"),
            per_pin=json_data.get("permanentAddress", {}).get("zipCode", ""),

            photo_image=_clean_base64(json_data.get("photoImage", ""))
        )
    return match_result

async def kyra_match_agent_bg(kyc_id: int, data: dict, smtp_server, smtp_port,sender_email,sender_password):
    async with async_session_maker() as session:
        result = await asyncio.to_thread(kyra_match_agent, kyc_id, data)
        per_poa = result.get("data", {}).get("perPOA", {})
        cor_poa = result.get("data", {}).get("corPOA", {})
        per_poa_ok = await is_all_confidence_high(per_poa)
        cor_poa_ok = await is_all_confidence_high(cor_poa)
        approve = False
        input_data = {
            "perPOA": per_poa,
            "corPOA": cor_poa
        }
        await session.execute(
            update(KYC)
            .where(KYC.kyc_id == kyc_id)
            .values(data=cast(KYC.data, JSONB).op("||")(input_data))
        )
        await session.commit()
        logger.info(f"KYC updated for ID {kyc_id}")
        ai_notes = {
            "livenessReview": "",
            "kycMatchReview": "",
            "tamperReview": "",
            "riskScore": ""
        }
        kyc_record = await session.get(KYC, kyc_id)
        existing_data = kyc_record.data or {}
        existing_ai_notes = kyc_record.ai_notes or {}
        liveness_data = {
            "livenessImage": _clean_base64(existing_data.get("livenessImage")),
            "livenessScore": existing_data.get("livenessScore"),
            "livenessStatus": existing_data.get("livenessStatus"),
        }
        ai_notes['kycMatchReview'] = await generate_kyc_match_review(input_data, kyc_id)
        if liveness_data.get("livenessStatus"):
            ai_notes["livenessReview"] = await generate_liveness_review(liveness_data)

        ai_notes["tamperReview"] = existing_ai_notes.get("tamperReview")
        
        if per_poa and cor_poa:
            if per_poa_ok and cor_poa_ok:
                approve = True
        elif per_poa:
            if per_poa_ok:
                approve = True
        elif cor_poa:
            if cor_poa_ok:
                approve = True
                
                
        if approve:
            await session.execute(
                update(KYCStatusLog)
                .where(KYCStatusLog.kyc_id == kyc_id)
                .values(status=KYCStatus.APPROVED)
            )
            ai_notes["riskScore"] = 0
            user_name = existing_data.get("name", "")
            email = existing_data.get("emailId", "")
            email_manager = EmailManager(smtp_server, smtp_port, sender_email, sender_password)
            email_manager.send_congrats_email(recipient_email=email,
                user_name = user_name,
                kyc_id=kyc_id)
                
            
        else:
            logger.info("Not going for auto-approval")        
            ai_notes["riskScore"] = await generate_risk_score(ai_notes)
        
        logger.info(f"Generated AI notes for KYC ID {kyc_id}: {ai_notes}")
        await session.execute(
            update(KYC)
            .where(KYC.kyc_id == kyc_id)
            .values(ai_notes=ai_notes)
        )
        await session.commit()
        logger.info(f"AI notes saved for KYC ID {kyc_id}")
        


        
