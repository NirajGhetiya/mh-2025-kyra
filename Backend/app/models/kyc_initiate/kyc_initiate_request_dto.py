from dataclasses import dataclass
import re

@dataclass
class KycInitiateRequestDTO:
    name: str
    email: str
    mobile_number: str

    def validate_request(self):
        # Validate name
        if len(self.name.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")

        # Validate email (simple format check)
        if not re.match(r"[^@]+@[^@]+\.[^@]+", self.email):
            raise ValueError("Invalid email address")

        # Validate Indian mobile number
        if not re.match(r"^[6-9]\d{9}$", self.mobile_number):
            raise ValueError("Invalid mobile number. Must be a 10-digit number starting with 6–9.")
