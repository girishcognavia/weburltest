from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.routes import preview, chat, health

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Website Preview API",
    description="API service for managing website previews with chatbot overlay",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(preview.router)
app.include_router(chat.router)


@app.on_event("startup")
async def startup_event():
    logger.info("🚀 API Service starting up...")
    logger.info(f"Environment: {'DEBUG' if settings.DEBUG else 'PRODUCTION'}")
    logger.info(f"Redis: {settings.REDIS_URL}")
    logger.info(f"Proxy Service: {settings.PROXY_SERVICE_URL}")
    logger.info(f"Screenshot Service: {settings.SCREENSHOT_SERVICE_URL}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("API Service shutting down...")


@app.get("/")
async def root():
    return {
        "service": "Website Preview API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
