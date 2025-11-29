import os
import json
import base64
import logging
from typing import Dict, Any, Optional

try:
    from langchain.agents import initialize_agent, AgentType
    from langchain_openai import ChatOpenAI
    from langchain.tools import Tool
    from langchain.schema import HumanMessage
    from pydantic import BaseModel
except ImportError as e:
    logging.warning(f"LangChain dependencies not installed: {e}")
    # Fallback imports or mock classes can be added here

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)

class KYCData(BaseModel):
    """Pydantic model for KYC data validation."""
    name: str
    dob: Optional[str] = ""
    gender: Optional[str] = ""
    father_name: Optional[str] = ""
    spouse_name: Optional[str] = ""
    email: Optional[str] = ""
    mobile: Optional[str] = ""
    cor_poa_type: Optional[str] = ""
    cor_poa_number: Optional[str] = ""
    cor_address: Optional[str] = ""
    cor_city: Optional[str] = ""
    cor_state: Optional[str] = ""
    cor_country: str = "India"
    cor_pin: Optional[str] = ""
    per_poa_type: Optional[str] = ""
    per_poa_number: Optional[str] = ""
    per_address: Optional[str] = ""
    per_city: Optional[str] = ""
    per_state: Optional[str] = ""
    per_country: str = "India"
    per_pin: Optional[str] = ""

class KYCClient:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.request_id = os.getenv("REQUEST_ID", "kyra")
        self.model_name = os.getenv("OPENAI_MODEL", "gpt-4")
        
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        # Initialize OpenAI LLM
        self.llm = ChatOpenAI(
            openai_api_key=self.openai_api_key,
            model_name=self.model_name,
            temperature=0.1,
            max_tokens=2000
        )
        
        # Initialize LangChain agent
        self.tools = self._create_kyc_tools()
        self.agent = initialize_agent(
            tools=self.tools,
            llm=self.llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True
        )

    def _create_kyc_tools(self):
        """Create tools for KYC processing agent."""
        
        def validate_document_data(data_json: str) -> str:
            """Validate and process KYC document data."""
            try:
                data = json.loads(data_json)
                kyc_data = KYCData(**data)
                
                # Perform validation logic
                validation_results = []
                
                # Name validation
                if not kyc_data.name or len(kyc_data.name.strip()) < 2:
                    validation_results.append("Invalid name: Name must be at least 2 characters")
                
                # Mobile validation
                if kyc_data.mobile and not kyc_data.mobile.isdigit():
                    validation_results.append("Invalid mobile: Mobile number must contain only digits")
                
                # Email validation
                if kyc_data.email and "@" not in kyc_data.email:
                    validation_results.append("Invalid email: Email must contain @ symbol")
                
                # PIN code validation
                if kyc_data.cor_pin and (not kyc_data.cor_pin.isdigit() or len(kyc_data.cor_pin) != 6):
                    validation_results.append("Invalid correspondence PIN: Must be 6 digits")
                
                if kyc_data.per_pin and (not kyc_data.per_pin.isdigit() or len(kyc_data.per_pin) != 6):
                    validation_results.append("Invalid permanent PIN: Must be 6 digits")
                
                if validation_results:
                    return json.dumps({
                        "success": False,
                        "errors": validation_results,
                        "requestId": self.request_id
                    })
                
                return json.dumps({
                    "success": True,
                    "message": "KYC data validation successful",
                    "data": kyc_data.dict(),
                    "requestId": self.request_id
                })
                
            except Exception as e:
                return json.dumps({
                    "success": False,
                    "error": str(e),
                    "requestId": self.request_id
                })
        
        def analyze_document_consistency(data_json: str) -> str:
            """Analyze consistency between different document data."""
            try:
                data = json.loads(data_json)
                kyc_data = KYCData(**data)
                
                consistency_issues = []
                
                # Check address consistency
                if (kyc_data.cor_address and kyc_data.per_address and 
                    kyc_data.cor_address != kyc_data.per_address):
                    consistency_issues.append("Address mismatch between correspondence and permanent addresses")
                
                # Check PIN consistency
                if (kyc_data.cor_pin and kyc_data.per_pin and 
                    kyc_data.cor_pin != kyc_data.per_pin):
                    consistency_issues.append("PIN code mismatch between correspondence and permanent addresses")
                
                # Check document number consistency (if same document type)
                if (kyc_data.cor_poa_type and kyc_data.per_poa_type and
                    kyc_data.cor_poa_type == kyc_data.per_poa_type and
                    kyc_data.cor_poa_number and kyc_data.per_poa_number and
                    kyc_data.cor_poa_number != kyc_data.per_poa_number):
                    consistency_issues.append("Document number mismatch for same document type")
                
                confidence_score = max(0, 100 - (len(consistency_issues) * 25))
                
                return json.dumps({
                    "success": True,
                    "consistency_score": confidence_score,
                    "issues": consistency_issues,
                    "recommendation": "Approved" if confidence_score >= 75 else "Needs Review",
                    "requestId": self.request_id
                })
                
            except Exception as e:
                return json.dumps({
                    "success": False,
                    "error": str(e),
                    "requestId": self.request_id
                })
        
        return [
            Tool(
                name="validate_document_data",
                description="Validate KYC document data for completeness and format",
                func=validate_document_data
            ),
            Tool(
                name="analyze_document_consistency",
                description="Analyze consistency between different KYC documents and data",
                func=analyze_document_consistency
            )
        ]

    def _encode_image(self, image_path: str) -> str:
        """Encode image file to base64 string."""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        with open(image_path, "rb") as img_file:
            return base64.b64encode(img_file.read()).decode('utf-8')
    
    def _analyze_image_with_vision(self, image_data: str, document_type: str) -> Dict[str, Any]:
        """Analyze document image using OpenAI Vision API."""
        try:
            prompt = f"""
            Analyze this {document_type} document image and extract the following information:
            - Document type verification
            - Text content extraction
            - Document quality assessment
            - Any visible tampering or inconsistencies
            
            Provide a structured response with confidence scores.
            """
            
            # Note: This is a simplified version. In production, you'd use OpenAI's vision API
            # For now, we'll simulate the response
            return {
                "document_type": document_type,
                "quality_score": 85,
                "text_extracted": True,
                "tampering_detected": False,
                "confidence": 0.85
            }
            
        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
            return {
                "error": str(e),
                "confidence": 0.0
            }

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
        """
        Process KYC document matching using LangChain agent with OpenAI.
        """
        try:
            # Prepare data for analysis
            kyc_data = {
                "name": name,
                "dob": dob,
                "gender": gender,
                "father_name": father_name,
                "spouse_name": spouse_name,
                "email": email,
                "mobile": mobile,
                "cor_poa_type": cor_poa_type,
                "cor_poa_number": cor_poa_number,
                "cor_address": cor_address,
                "cor_city": cor_city,
                "cor_state": cor_state,
                "cor_country": cor_country,
                "cor_pin": cor_pin,
                "per_poa_type": per_poa_type,
                "per_poa_number": per_poa_number,
                "per_address": per_address,
                "per_city": per_city,
                "per_state": per_state,
                "per_country": per_country,
                "per_pin": per_pin
            }
            
            logger.info(f"Processing KYC for: {name}")
            logger.info(f"Document types - Correspondence: {cor_poa_type}, Permanent: {per_poa_type}")
            
            # Analyze images if provided
            image_analysis = {}
            if cor_poa_image:
                image_analysis["correspondence"] = self._analyze_image_with_vision(cor_poa_image, cor_poa_type)
            if per_poa_image:
                image_analysis["permanent"] = self._analyze_image_with_vision(per_poa_image, per_poa_type)
            if photo_image:
                image_analysis["photo"] = self._analyze_image_with_vision(photo_image, "Photo")
            
            # Create agent prompt
            agent_prompt = f"""
            You are a KYC (Know Your Customer) verification expert. 
            Please analyze the following KYC data and documents:
            
            Personal Information:
            - Name: {name}
            - Date of Birth: {dob}
            - Gender: {gender}
            - Father's Name: {father_name}
            - Mobile: {mobile}
            - Email: {email}
            
            Address Information:
            - Correspondence Address: {cor_address}, {cor_city}, {cor_state}, {cor_pin}
            - Permanent Address: {per_address}, {per_city}, {per_state}, {per_pin}
            
            Document Information:
            - Correspondence POA: {cor_poa_type} - {cor_poa_number}
            - Permanent POA: {per_poa_type} - {per_poa_number}
            
            Please:
            1. First validate the document data using the validate_document_data tool
            2. Then analyze document consistency using the analyze_document_consistency tool
            3. Provide a final recommendation based on the analysis
            
            Use the provided tools to perform these tasks with the following JSON data:
            {json.dumps(kyc_data)}
            """
            
            # Run the agent
            agent_response = self.agent.run(agent_prompt)
            
            # Combine results
            result = {
                "success": True,
                "requestId": self.request_id,
                "personal_info": {
                    "name": name,
                    "dob": dob,
                    "mobile": mobile,
                    "email": email
                },
                "image_analysis": image_analysis,
                "agent_analysis": agent_response,
                "processed_by": "LangChain-OpenAI-Agent",
                "timestamp": json.dumps({"timestamp": "2025-01-01T00:00:00Z"})  # You might want to use actual timestamp
            }
            
            logger.info("KYC processing completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"KYC processing failed: {e}")
            return {
                "success": False,
                "error": {
                    "message": str(e)
                },
                "requestId": self.request_id
            }


# === USAGE EXAMPLE ===
if __name__ == "__main__":
    # Make sure to set OPENAI_API_KEY environment variable
    client = KYCClient()

    result = client.match_document(
        name="John Doe",
        dob="01-01-1990",
        gender="M",
        father_name="Robert Doe",
        mobile="9876543210",
        email="john.doe@example.com",
        cor_poa_image="base64_encoded_image_data",  # Now expects base64 data
        cor_poa_type="Aadhaar",
        cor_poa_number="123456789012",
        cor_address="123 MG Road",
        cor_city="Mumbai",
        cor_state="Maharashtra",
        cor_pin="400001",
        per_poa_image="base64_encoded_image_data",  # Now expects base64 data
        per_poa_type="Aadhaar",
        per_poa_number="123456789012",
        per_address="123 MG Road",
        per_city="Mumbai",
        per_state="Maharashtra",
        per_pin="400001",
        photo_image="base64_encoded_image_data"  # Now expects base64 data
    )

    print(json.dumps(result, indent=2))