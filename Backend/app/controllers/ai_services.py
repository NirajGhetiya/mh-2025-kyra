import os
import asyncio
import pandas as pd
from fastapi import APIRouter, HTTPException, Query, Request
from models import TamperRequestDTO, TamperResponseDTO, LivenessRequestDTO, LivenessResponseDTO, BaseResponse
from kyc_client import LivenessService, TamperDetectionService
from pydantic import BaseModel
from services.ai.manager import bg_tamper_review_generation
router = APIRouter(prefix="/api/ai", tags=["AI Services"])

# CSV_PATH = os.getenv("PIN_CSV_PATH")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "..", "Pincode.csv")
CSV_PATH = os.path.abspath(CSV_PATH)

try:
    pincode_df = pd.read_csv(CSV_PATH, dtype={"Pincode": str}, encoding='latin1')
except Exception as e:
    raise Exception(f"Failed to load CSV: {e}")

@router.post("/tamper-check", response_model=TamperResponseDTO)
async def tamper_check(request: TamperRequestDTO):
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Missing OpenAI API Key")
        base_64 = request.image_base64
        kyc_id = request.kyc_id
        if not base_64:
            raise HTTPException(status_code=400, detail="Missing 'image_base64' in request body")
        tamper_checker = TamperDetectionService(api_key=api_key)
        result = tamper_checker.analyze_base64(base_64)
        if "status" in result and result["status"] == "error":
            return TamperResponseDTO(
                success=False,
                message="Tamper analysis failed",
                data={"error": result["message"]}
            )

        asyncio.create_task(
            bg_tamper_review_generation(result, kyc_id, base_64)
        )
        return TamperResponseDTO(
            success=True,
            message="Tamper detection completed successfully",
            data=result
        )


    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/liveness-check", response_model=LivenessResponseDTO)
def liveness_check(request: LivenessRequestDTO):
    try:
        api_key = os.getenv("OPENAI_API_KEY") 
        if not api_key:
            raise HTTPException(status_code=500, detail="Missing OpenAI API Key")
        base_64 = request.image_base64
        if not base_64:
            raise HTTPException(status_code=400, detail="Missing 'image_base64' in request body")
        liveness_checker = LivenessService(api_key=api_key)
        result = liveness_checker.analyze_base64(base_64)
        if "status" in result and result["status"] == "error":
            return LivenessResponseDTO(
                success=False,
                message="Liveness check failed",
                data={"error": result["message"]}
            )
        if result["is_live"] == True:
            result["livenessStatus"] = "PASS"
        else:
            result["livenessStatus"] = "FAIL"
        return LivenessResponseDTO(
            success=True,
            message="Liveness check completed successfully",
            data=result
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.get("/pin/data", response_model=BaseResponse)
def get_pin_data(pin_code: int = Query(..., description="Pin Code to verify and fetch details")):
    try:
        # Convert pincode to string for matching CSV
        pin_str = str(pin_code)

        # Check if pincode exists in CSV
        row = pincode_df[pincode_df["Pincode"] == pin_str]

        if row.empty:
            return BaseResponse(
                success=False,
                message="Pin code not found",
                data=None
            )

        district = row.iloc[0]["District"]
        state = row.iloc[0]["StateName"]

        return BaseResponse(
            success=True,
            message="Pin details fetched successfully",
            data={
                "pincode": pin_str,
                "district": district,
                "state": state
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))