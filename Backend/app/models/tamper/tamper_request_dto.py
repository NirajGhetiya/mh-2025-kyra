from dataclasses import dataclass

@dataclass
class TamperRequestDTO():
    image_base64: str
    kyc_id: int
