from .base_response import BaseResponse
from .user_schema import UserRegister, UserLogin
from .liveness import LivenessRequestDTO, LivenessResponseDTO
from .tamper import TamperRequestDTO, TamperResponseDTO 
from .kyc_initiate import KycInitiateRequestDTO, KycInitiateResponseDTO
from .kyc_dashboard import KycDashboardRequestDTO, KycDashboardResponseDTO
from .kyc_data import KycDashboardDetailsResponseDTO, KycDetailsDataDTO
from .admin_dashboard import AdminDashboardResponseDTO, KycMainDashboardDataDTO
from .user import UserInfo
