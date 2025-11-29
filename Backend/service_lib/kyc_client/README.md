# KYC Client with LangChain and OpenAI

This KYC client uses LangChain agents with OpenAI's GPT models to process and validate KYC (Know Your Customer) documents and data.

## Installation

1. Install the package dependencies:
```bash
pip install -r requirements.txt
```

Or install the package directly:
```bash
pip install -e .
```

## Environment Variables

Set the following environment variables:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
OPENAI_MODEL=gpt-4  # Default: gpt-4
REQUEST_ID=kyra     # Default: kyra
```

## Usage

```python
from kyc_client import KYCClient
import os

# Set your OpenAI API key
os.environ['OPENAI_API_KEY'] = 'your_api_key_here'

# Initialize the client
client = KYCClient()

# Process KYC documents
result = client.match_document(
    name="John Doe",
    dob="01-01-1990",
    gender="M",
    father_name="Robert Doe",
    mobile="9876543210",
    email="john.doe@example.com",
    cor_poa_image="base64_encoded_image_data",
    cor_poa_type="Aadhaar",
    cor_poa_number="123456789012",
    cor_address="123 MG Road",
    cor_city="Mumbai",
    cor_state="Maharashtra",
    cor_pin="400001",
    per_poa_image="base64_encoded_image_data",
    per_poa_type="Aadhaar", 
    per_poa_number="123456789012",
    per_address="123 MG Road",
    per_city="Mumbai",
    per_state="Maharashtra",
    per_pin="400001",
    photo_image="base64_encoded_image_data"
)

print(result)
```

## Features

- **LangChain Agents**: Uses intelligent agents for document processing
- **OpenAI Integration**: Leverages GPT models for analysis
- **Data Validation**: Validates KYC data for completeness and format
- **Consistency Analysis**: Checks consistency between different documents
- **Image Analysis**: Processes document images (placeholder for vision API)
- **Comprehensive Logging**: Detailed logging for debugging

## Key Changes from Previous Version

1. **Replaced TrackWizz API** with LangChain + OpenAI
2. **Added AI-powered validation** using custom tools
3. **Enhanced document analysis** with consistency checking
4. **Improved error handling** and logging
5. **Flexible configuration** via environment variables

## Response Format

The client returns a structured response:

```json
{
  "success": true,
  "requestId": "kyra",
  "personal_info": {
    "name": "John Doe",
    "dob": "01-01-1990",
    "mobile": "9876543210",
    "email": "john.doe@example.com"
  },
  "image_analysis": {
    "correspondence": {...},
    "permanent": {...},
    "photo": {...}
  },
  "agent_analysis": "Detailed analysis from LangChain agent",
  "processed_by": "LangChain-OpenAI-Agent",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## Error Handling

The client includes comprehensive error handling:
- OpenAI API errors
- LangChain agent errors  
- Data validation errors
- Image processing errors

All errors are logged and returned in a structured format.
