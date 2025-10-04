from fastapi import APIRouter
from datetime import datetime
import httpx

from app.models import HealthResponse
from app.utils.redis_client import redis_client
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    # Check Redis
    redis_status = "connected" if await redis_client.ping() else "disconnected"

    # Check proxy service
    proxy_status = None
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{settings.PROXY_SERVICE_URL}/health")
            proxy_status = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception:
        proxy_status = "unreachable"

    # Check screenshot service
    screenshot_status = None
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{settings.SCREENSHOT_SERVICE_URL}/health")
            screenshot_status = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception:
        screenshot_status = "unreachable"

    overall_status = "healthy" if redis_status == "connected" else "degraded"

    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        redis=redis_status,
        proxy_service=proxy_status,
        screenshot_service=screenshot_status,
    )
