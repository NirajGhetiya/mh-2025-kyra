from dataclasses import dataclass
from typing import Dict



@dataclass
class PersonalInfo():
    name: str
    gender: str
    dob: str
    emailId: str
    mobileNo: str
    fatherName: str
    photoImage: str = None  # Base64 or URL if stored elsewhere
    
    def to_dict(self) -> Dict[str, str]:
        return {field.name: getattr(self, field.name) for field in self.__dataclass_fields__.values()}