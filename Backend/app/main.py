from fastapi import FastAPI, Depends, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from controllers.ai_services import router as ai_services
from controllers.authentication import router as authentication
from controllers.admin import router as admin
from controllers.user import router as user

from models.base_response import BaseResponse

from dotenv import load_dotenv
load_dotenv()
# Import routers


app = FastAPI(
    title="My Multi-Controller API",
    version="1.0.0",
    description="A FastAPI app with multiple routers"
)

origins = [
    "http://localhost:8080",
    "http://192.168.33.70:8080",
    "http://192.168.110.228:8080",
    "https://kyra-kyc.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Get the first error
    first_error = exc.errors()[0]
    field = ".".join([str(loc) for loc in first_error["loc"] if loc != "body"])
    message = f"{first_error['msg']}"

    return JSONResponse(
        status_code=422,
        content=BaseResponse(
            success=False,
            message=message,
            data=None
        ).model_dump()
    )

# Include routers (controllers)
app.include_router(user)
app.include_router(ai_services)
app.include_router(authentication)
app.include_router(admin)

# Optional: Global dependency (e.g., for auth)
def common_dependency():
    return {"authenticated": True}

app.include_router(user, dependencies=[Depends(common_dependency)])

# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the API"}