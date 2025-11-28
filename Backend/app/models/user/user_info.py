from dataclasses import dataclass,field
from typing import Dict, Any, Optional


@dataclass
class POADetails:
    perPOAOvdType: str = ""
    corPOAOvdType: str = ""
    classifiedOvdType: str = ""
    ovdNumberExtracted: str = ""
    ovdNumberConfidence: str = ""
    ovdNumberExtractionConfidenceScore: float = 0.0
    nameExtracted: str = ""
    nameConfidence: str = ""
    nameExtractionConfidenceScore: float = 0.0
    dobExtracted: str = ""
    dobConfidence: str = ""
    dobExtractionConfidenceScore: float = 0.0
    genderExtracted: str = ""
    genderConfidence: str = ""
    genderExtractionConfidenceScore: float = 0.0
    spouseNameExtracted: str = ""
    spouseNameConfidence: str = ""
    spouseNameExtractionConfidenceScore: float = 0.0
    fatherNameExtracted: str = ""
    fatherNameConfidence: str = ""
    fatherNameExtractionConfidenceScore: float = 0.0
    addressExtracted: str = ""
    addressConfidence: str = ""
    addressExtractionConfidenceScore: float = 0.0
    countryExtracted: str = ""
    countryConfidence: str = ""
    passportCountryExtractionConfidenceScore: float = 0.0
    pinExtracted: str = ""
    pinConfidence: str = ""
    pinExtractionConfidenceScore: float = 0.0
    stateExtracted: str = ""
    stateConfidence: str = ""
    cityExtracted: str = ""
    cityConfidence: str = ""
    derivedStateExtracted: str = ""
    derivedStateConfidence: str = ""
    derivedCityExtracted: str = ""
    derivedCityConfidence: str = ""
    emailExtracted: str = ""
    emailConfidence: str = ""
    mobileNumberExtracted: str = ""
    mobileNumberConfidence: str = ""
    expiryDateExtracted: str = ""
    isExpired: bool = False
    croppedOvdImage: str = ""
    croppedPhotoImage: str = ""
    photoMatchConfidence: str = ""
    imageQuality: str = ""
    expired: bool = False
    
    
@dataclass
class UserInfo:
    name: str = ""
    gender: str = ""
    dob: str = ""
    emailId: str = ""
    mobileNo: str = ""
    fatherName: str = ""
    photoImage: str = ""

    cor_poa_image: Optional[str] = ""
    cor_poa_type: str = ""
    cor_poa_number: str = ""
    cor_address: str = ""
    cor_city: str = ""
    cor_state: str = ""
    cor_country: str = "India"
    cor_pin: str = ""

    per_poa_image: Optional[str] = ""
    per_poa_type: str = ""
    per_poa_number: str = ""
    per_address: str = ""
    per_city: str = ""
    per_state: str = ""
    per_country: str = "India"
    per_pin: str = ""

    # Newly added complex POA details
    perPOA: POADetails = field(default_factory=POADetails)
    corPOA: POADetails = field(default_factory=POADetails)
    
    
    def to_dict(self) -> Dict[str, str]:
        return {field.name: getattr(self, field.name) for field in self.__dataclass_fields__.values()}
    
@dataclass
class Address:
    streetAddress: str
    city: str
    state: str
    zipCode: str
    country: str

@dataclass
class DocumentProof:
    ovdType: str
    ovdImage: str

@dataclass
class UserData:
    name: str
    gender: str
    dob: str
    emailId: str
    mobileNo: str
    fatherName: str
    photoImage: str
    permanentAddress: Address
    corporateAddress: Address
    permanentAddressDocuments: DocumentProof
    corporateAddressDocuments: DocumentProof
    livenessStatus: str
    livenessScore: float
    livenessImage: str

def dict_to_dataclass(data: dict, cls):
    if cls == Address:
        return Address(**{k: data.get(k, "") for k in Address.__annotations__})
    if cls == DocumentProof:
        return DocumentProof(**{k: data.get(k, "") for k in DocumentProof.__annotations__})
    if cls == UserData:
        return UserData(
            name=data.get("name", ""),
            gender=data.get("gender", ""),
            dob=data.get("dob", ""),
            emailId=data.get("emailId", ""),
            mobileNo=data.get("mobileNo", ""),
            fatherName=data.get("fatherName", ""),
            photoImage=data.get("photoImage", ""),
            permanentAddress=dict_to_dataclass(data.get("permanentAddress", {}), Address),
            corporateAddress=dict_to_dataclass(data.get("corporateAddress", {}), Address),
            permanentAddressDocuments=dict_to_dataclass(data.get("permanentAddressDocuments", {}), DocumentProof),
            corporateAddressDocuments=dict_to_dataclass(data.get("corporateAddressDocuments", {}), DocumentProof),
            livenessStatus=data.get("livenessStatus", ""),
            livenessScore=float(data.get("livenessScore", 0)),
            livenessImage=data.get("livenessImage", ""),
        )
    return None
