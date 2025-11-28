from typing import Optional
from dataclasses import dataclass

@dataclass
class BaseResponse():
    success: bool
    message: str
    data: Optional[dict] = None
    
    def to_dict(self):
        return {field.name: getattr(self, field.name) for field in self.__dataclass_fields__.values()}
