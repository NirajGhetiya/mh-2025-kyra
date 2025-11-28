from dataclasses import dataclass
from typing import Dict

@dataclass
class Address():
    streetAddress: str
    city: str
    state: str
    zipCode: str
    country: str
    
    def to_dict(self) -> Dict[str, str]:
        return {field.name: getattr(self, field.name) for field in self.__dataclass_fields__.values()}
    
    

@dataclass
class AddressForm():
    permanentAddress: Address
    corporateAddress: Address
    
    def to_dict(self) -> Dict[str, str]:
        return {field.name: getattr(self, field.name) for field in self.__dataclass_fields__.values()}