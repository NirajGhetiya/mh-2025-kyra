from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
import datetime
from ..base_response import BaseResponse


@dataclass
class KycMainDashboardDataDTO:
    """Nested DTO holding full KYC data JSON structure."""
    total_kyc_count: Optional[str] = None
    todays_kyc_count: Optional[str] = None
    approval_rate: Optional[str] = None
    total_rejected:  Optional[str] = None
    avg_processing: Optional[str] = None
    total_approved: Optional[str] = None
    total_pending: Optional[str] = None
    total_under_review: Optional[str] = None
    week_growth : Optional[str] = None
    top_kycs: Optional[List[Dict[str, Any]]] = field(default_factory=list)
    


@dataclass
class AdminDashboardResponseDTO(BaseResponse):
    """Response DTO for full KYC detail view (joins KYC + KYCStatusLog)."""
    data: Optional[List[Dict]] = None