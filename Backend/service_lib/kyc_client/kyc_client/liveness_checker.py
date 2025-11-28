# service_lib/liveness_checker/liveness_checker/services/liveness_service.py

from openai import OpenAI
import re
import json

class LivenessService:
    """
    Handles logic for analyzing an image via OpenAI's Vision model
    to detect whether it’s live or spoofed/tampered.
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
        # Extract JSON substring if text includes extra words
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            json_str = match.group(0)
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        return None

    def analyze_base64(self, image_base64: str) -> dict:
        """
        Uses OpenAI GPT-4 Vision to analyze a base64 image for liveness
        and return a structured JSON with is_live and confidence score.
        """
        try:
            image_base64 = self._clean_base64(image_base64)

            prompt = (
                "You are a liveness detection model. "
                "Given this selfie or face image, classify whether it shows a LIVE person "
                "or a SPOOFED/TAMPERED image (like a printed photo, screen image, or mask). "
                "Respond ONLY in valid JSON format like this:\n"
                "{ \"is_live\": true|false, \"livenessScore\": 0.xx }"
            )

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a vision model for liveness detection."},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                        ]
                    }
                ],
                temperature=0.1,
                max_tokens=100
            )

            content = response.choices[0].message.content.strip()

            # ✅ Try to parse JSON strictly
            result = self._extract_json(content)

            if result and "is_live" in result and "livenessScore" in result:
                return {
                    "is_live": bool(result["is_live"]),
                    "livenessScore": float(result["livenessScore"])
                }

            # Fallback (if no valid JSON)
            is_live, confidence = self._extract_liveness_flag(content)
            return {"is_live": is_live, "livenessScore": confidence}

        except Exception as e:
            return {"status": "error", "message": str(e)}

    def _extract_liveness_flag(self, text: str):
        """
        Fallback NLP-based parser if GPT doesn't return JSON.
        """
        text_lower = text.lower()
        if "live" in text_lower and not any(
            word in text_lower for word in ["spoof", "fake", "photo", "printed", "mask"]
        ):
            return True, 0.85
        return False, 0.60
