from dataclasses import dataclass
from typing import Optional
from ..base_response import BaseResponse

@dataclass
class KycInitiateResponseDTO(BaseResponse):
    data: Optional[dict] = None