from dataclasses import dataclass
import re
from typing import Optional

@dataclass
class KycDashboardRequestDTO:
    kyc_id : Optional[str] = None
    user_name : Optional[str] = None
    email : Optional[str] = None
     
    