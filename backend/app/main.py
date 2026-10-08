import logging
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database import engine, Base
from .routers import opportunities

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("research_portal")

# Auto-create tables on startup (if database exists)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning("Could not auto-create database tables on import: %s", e)

app = FastAPI(
    title="Research Opportunity Portal API",
    description="REST API for managing university research opportunities.",
    version="1.0.0"
)

from starlette.exceptions import HTTPException as StarletteHTTPException

# CORS configuration for frontend communication (no wildcard credentials conflict)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler: convert validation errors into clean 400 Bad Request responses
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Invalid value")
        errors.append(f"{field}: {msg}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": "Validation error: " + "; ".join(errors),
            "errors": jsonable_encoder(exc.errors())
        }
    )


# Exception handler: preserve HTTP exceptions (404 Not Found, etc.)
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


# Exception handler: catch unhandled errors and return 500 Internal Server Error
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, StarletteHTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred. Please contact the administrator."}
    )


# Register API Routers
app.include_router(opportunities.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "Research Opportunity Portal"}
