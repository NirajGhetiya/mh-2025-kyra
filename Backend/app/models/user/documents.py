from dataclasses import dataclass
from typing import Dict

@dataclass
class Documents():
    ovdType: str
    ovdImage: str  # Base64 or URL if stored elsewhere
    
    def to_dict(self) -> Dict[str, str]:
        return {field.name: getattr(self, field.name) for field in self.__dataclass_fields__.values()}
    
    

@dataclass
class DocumentsForm():
    permanentAddressDocuments: Documents
    corporateAddressDocuments: Documents
    
    def to_dict(self) -> Dict[str, str]:
        return {field.name: getattr(self, field.name) for field in self.__dataclass_fields__.values()}