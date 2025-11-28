from dataclasses import dataclass, field
from typing import Optional, Dict, Any
import datetime
from ..base_response import BaseResponse


@dataclass
class KycDetailsDataDTO:
    """Nested DTO holding full KYC data JSON structure."""
    dob: Optional[str] = None
    name: Optional[str] = None
    gender: Optional[str] = None
    emailId: Optional[str] = None
    mobileNo: Optional[str] = None
    fatherName: Optional[str] = None
    photoImage: Optional[str] = None
    livenessImage: Optional[str] = None
    livenessScore: Optional[float] = None
    livenessStatus: Optional[str] = None
    corporateAddress: Optional[Dict[str, Any]] = field(default_factory=dict)
    permanentAddress: Optional[Dict[str, Any]] = field(default_factory=dict)
    corporateAddressDocuments: Optional[Dict[str, Any]] = field(default_factory=dict)
    permanentAddressDocuments: Optional[Dict[str, Any]] = field(default_factory=dict)
    corPOA: Optional[Dict[str, Any]] = field(default_factory=dict)
    perPOA: Optional[Dict[str, Any]] = field(default_factory=dict)


@dataclass
class KycDashboardDetailsResponseDTO(BaseResponse):
    """Response DTO for full KYC detail view (joins KYC + KYCStatusLog)."""
    data: Optional[Dict[str, Any]] = None
