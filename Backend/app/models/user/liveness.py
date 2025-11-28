from dataclasses import dataclass
from typing import Dict



@dataclass
class livenessInfo():
    livenessStatus: str
    livenessScore: float
    livenessImage: str  # Base64 or URL if stored elsewhere
    
    def to_dict(self) -> Dict[str, str]:
        return {field.name: getattr(self, field.name) for field in self.__dataclass_fields__.values()}