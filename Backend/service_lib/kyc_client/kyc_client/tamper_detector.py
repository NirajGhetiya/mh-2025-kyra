from openai import OpenAI
import re
import json


class TamperDetectionService:
    """
    Handles logic for analyzing a document image via OpenAI's Vision model
    to detect whether it’s tampered, forged, or manipulated.
    """

    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def _clean_base64(self, image_base64: str) -> str:
        """
        Cleans and normalizes base64 input to be compatible with OpenAI API.
        """
        if image_base64.startswith("data:image"):
            image_base64 = image_base64.split(",")[1]
        return re.sub(r"\s+", "", image_base64)

    def _extract_json(self, text: str) -> dict:
        """
        Attempts to safely extract JSON from GPT response text.
        """
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            json_str = match.group(0)
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        return None

    def analyze_base64(self, image_base64: str) -> dict:
        """
        Detects document tampering (whole or partial) for Aadhaar, PAN, Voter ID,
        Driving License. Identifies tampering in fields like photo, name, DOB, etc.
        Returns structured JSON with tampering type, confidence, and reasons.
        """
        try:
            image_base64 = self._clean_base64(image_base64)

            prompt = """You are a forensic vision model that detects REAL document tampering. 
You MUST NOT treat privacy-masking (blurred Aadhaar number, masked QR code, 
blurred face, blurred address, redactions, white circles, black boxes) as tampering. 
These are VALID user modifications and should be IGNORED.

You must ONLY mark tampered=true when the document shows:
- digital edits that alter meaning (fake photo, edited name/dob/address)
- replaced or AI-generated photo
- cut-paste signs around face or text fields
- inconsistent font alignment or mismatched printing

You must NOT treat the following as tampering:
- masked Aadhaar number
- blurred/whited QR code
- blurred or covered address
- privacy redactions done by the user
- scanning artifacts
- shadows or folds
- JPEG compression noise
- low quality images

You must analyze the whole document for authenticity issues:
- Compare text vs layout consistency
- Verify if the photo matches document background style
- Check if fonts match official Aadhaar formatting
- Check if photo area shows cut-out edges or blending anomalies
- Check if fields appear digitally pasted

Return ONLY valid JSON:
{
  "is_tampered": true/false,
  "confidence": 0.xx,
  "tampered_areas": ["photo", "name", "dob", "address", "id_number", "layout"],
  "reason": "short explanation"
}"""

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system",
                    "content": "You are an expert forensic document-tampering detection AI."},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    },
                ],
                temperature=0.1,
                max_tokens=300
            )

            content = response.choices[0].message.content.strip()
            result = self._extract_json(content)

            if result:
                return {
                    "is_tampered": bool(result.get("is_tampered", False)),
                    "confidence": float(result.get("confidence", 0))
                }

        except Exception as e:
            return {"status": "error", "message": str(e)}


    def _extract_tamper_flag(self, text: str):
        """
        Fallback NLP-based parser if GPT doesn't return JSON.
        """
        text_lower = text.lower()

        # If model response suggests it's fake/forged/edited/etc.
        if any(word in text_lower for word in ["fake", "tampered", "forged", "edited", "altered", "manipulated"]):
            return True, 0.85
        return False, 0.90
