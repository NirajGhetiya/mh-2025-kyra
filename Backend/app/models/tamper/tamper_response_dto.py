from dataclasses import dataclass
from typing import Optional
from ..base_response import BaseResponse

@dataclass
class TamperResponseDTO(BaseResponse):
    data: Optional[dict] = None
