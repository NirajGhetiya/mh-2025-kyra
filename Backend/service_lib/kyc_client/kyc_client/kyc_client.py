import os
import json
import base64
import logging
import requests
from typing import Dict, Any, Optional
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)

class KYCClient:
    def __init__(self):
        self.base_url = os.getenv("API_URL", "https://kyc-dev.trackwizz.app")
        self.endpoint = "/api/match/doc/"
        self.request_id = os.getenv("REQUEST_ID", "kyra")
        self.timeout = int(os.getenv("API_TIMEOUT", "60"))
        self.Tocken = os.getenv("API_TOKEN", "")

        # Setup session with retry
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["POST"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def _encode_image(self, image_path: str) -> str:
        """Encode image file to base64 string."""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode('utf-8')

    def match_document(
        self,
        name: str,
        dob: str = "",
        gender: str = "",
        father_name: str = "",
        spouse_name: str = "",
        email: str = "",
        mobile: str = "",
        cor_poa_image: Optional[str] = "",
        cor_poa_type: str = "",
        cor_poa_number: str = "",
        cor_address: str = "",
        cor_city: str = "",
        cor_state: str = "",
        cor_country: str = "India",
        cor_pin: str = "",
        per_poa_image: Optional[str] = "",
        per_poa_type: str = "",
        per_poa_number: str = "",
        per_address: str = "",
        per_city: str = "",
        per_state: str = "",
        per_country: str = "India",
        per_pin: str = "",
        photo_image: Optional[str] = "",
    ) -> Dict[str, Any]:

        

        payload = {
            "fatherName": father_name,
            "spouseName": spouse_name,
            "name": name,
            "gender": gender,
            "dob": dob,  # Format: DD-MM-YYYY
            "emailId": email,
            "mobileNo": mobile,
            "corPOAImage": cor_poa_image,
            "corPOAOvdType": cor_poa_type,
            "corPOAOvdNumber": cor_poa_number,
            "corAddress": cor_address,
            "corCity": cor_city,
            "corState": cor_state,
            "corCountry": cor_country,
            "corPin": cor_pin,
            "perPOAImage": per_poa_image,
            "perPOAOvdType": per_poa_type,
            "perPOAOvdNumber": per_poa_number,
            "perAddress": per_address,
            "perCity": per_city,
            "perState": per_state,
            "perCountry": per_country,
            "perPin": per_pin,
            "photoImage": photo_image
        }
        # logger.info(f"Paylod : {payload}")
        logger.info(f"per_poa_type : {per_poa_type}")
        logger.info(f"per_poa_number : {per_poa_number}")
        headers = {
            "accept": "*/*",
            "Request-Id": self.request_id,
            "Content-Type": "application/json",
            'Authorization': f'Bearer {self.Tocken}'
        }
        logger.info(f"Headders: {headers}")
        url = self.base_url + self.endpoint
        logger.info(f"Calling TrackWizz KYC API: {url}")

        try:
            response = self.session.post(
                url,
                headers=headers,
                json=payload,
                timeout=self.timeout
            )
            response.raise_for_status()
            result = response.json()
            logger.info("KYC match successful")
            return result

        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP error occurred: {http_err} | Response: {response.text}")
            return {
                "success": False,
                "error": {
                    "code": response.status_code,
                    "message": response.text
                },
                "requestId": self.request_id
            }
        except requests.exceptions.RequestException as req_err:
            logger.error(f"Request failed: {req_err}")
            return {
                "success": False,
                "error": {
                    "message": str(req_err)
                },
                "requestId": self.request_id
            }
        except json.JSONDecodeError:
            logger.error("Invalid JSON response")
            return {
                "success": False,
                "error": {"message": "Invalid JSON response from server"}
            }


# === USAGE EXAMPLE ===
if __name__ == "__main__":
    client = KYCClient()

    result = client.match_document(
        name="John Doe",
        dob="01-01-1990",
        gender="M",
        father_name="Robert Doe",
        mobile="9876543210",
        email="john.doe@example.com",
        cor_poa_image_path="images/aadhaar_back.jpg",
        cor_poa_type="Aadhaar",
        cor_poa_number="123456789012",
        cor_address="123 MG Road",
        cor_city="Mumbai",
        cor_state="Maharashtra",
        cor_pin="400001",
        per_poa_image_path="images/aadhaar_front.jpg",
        per_poa_type="Aadhaar",
        per_poa_number="123456789012",
        per_address="123 MG Road",
        per_city="Mumbai",
        per_state="Maharashtra",
        per_pin="400001",
        photo_image_path="images/selfie.jpg"
    )

    print(json.dumps(result, indent=2))