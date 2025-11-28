from dataclasses import dataclass, field
import datetime
import re
from ..base_response import BaseResponse
from typing import Optional, List, Dict


@dataclass
class KycDashboardResponseDTO(BaseResponse):
    data: Optional[List[Dict]] = None