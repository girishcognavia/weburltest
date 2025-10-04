import uuid
import httpx
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from app.models import (
    PreviewRequest,
    PreviewResponse,
    PreviewStatus,
    PreviewStatusResponse,
    RenderMethod,
)
from app.config import settings
from app.utils.redis_client import redis_client

logger = logging.getLogger(__name__)


class PreviewService:
    def __init__(self):
        self.proxy_url = settings.PROXY_SERVICE_URL
        self.screenshot_url = settings.SCREENSHOT_SERVICE_URL

    async def create_preview(self, request: PreviewRequest) -> PreviewResponse:
        """Create a new preview session"""
        preview_id = str(uuid.uuid4())

        # Store preview session in Redis
        session_data = {
            "preview_id": preview_id,
            "website_url": str(request.website_url),
            "client_id": request.client_id,
            "device": request.preview_settings.device.value,
            "render_method": request.preview_settings.render_method.value,
            "status": PreviewStatus.ready.value,
            "created_at": datetime.utcnow().isoformat(),
            "max_pages": request.max_pages,
        }

        redis_client.set(
            f"preview:{preview_id}",
            session_data,
            ttl=settings.SESSION_TTL
        )

        # Determine preview URL based on render method
        if request.preview_settings.render_method == RenderMethod.auto:
            # Try proxy first
            preview_url = self._get_proxy_url(str(request.website_url), request.client_id)
        elif request.preview_settings.render_method == RenderMethod.proxy:
            preview_url = self._get_proxy_url(str(request.website_url), request.client_id)
        else:
            # Screenshot method
            preview_url = self._get_screenshot_url(str(request.website_url), request.client_id)

        return PreviewResponse(
            preview_id=preview_id,
            status=PreviewStatus.ready,
            preview_url=preview_url,
            estimated_time_seconds=2,
        )

    async def get_preview_status(self, preview_id: str) -> Optional[PreviewStatusResponse]:
        """Get status of a preview session"""
        session_data = redis_client.get(f"preview:{preview_id}")

        if not session_data:
            return None

        return PreviewStatusResponse(
            status=PreviewStatus(session_data.get("status", "ready")),
            progress_percentage=100,
            pages_crawled=1,
            current_page=session_data.get("website_url"),
        )

    async def render_preview(
        self,
        preview_id: str,
        method: Optional[RenderMethod] = None
    ) -> Optional[str]:
        """Render the preview (returns HTML or redirects to screenshot)"""
        session_data = redis_client.get(f"preview:{preview_id}")

        if not session_data:
            return None

        website_url = session_data.get("website_url")
        client_id = session_data.get("client_id")

        if method == RenderMethod.proxy or method is None:
            return self._get_proxy_url(website_url, client_id)
        else:
            return self._get_screenshot_url(website_url, client_id)

    async def delete_preview(self, preview_id: str) -> bool:
        """Delete a preview session"""
        return redis_client.delete(f"preview:{preview_id}")

    async def share_preview(self, preview_id: str) -> Optional[Dict[str, Any]]:
        """Generate a shareable link for preview"""
        session_data = redis_client.get(f"preview:{preview_id}")

        if not session_data:
            return None

        # Generate share token
        share_token = str(uuid.uuid4())
        share_key = f"share:{share_token}"

        # Store share mapping
        redis_client.set(
            share_key,
            {"preview_id": preview_id},
            ttl=86400  # 24 hours
        )

        expires_at = datetime.utcnow() + timedelta(days=1)

        return {
            "share_url": f"{settings.PROXY_SERVICE_URL}/share/{share_token}",
            "expires_at": expires_at.isoformat(),
        }

    def _get_proxy_url(self, website_url: str, client_id: str) -> str:
        """Generate proxy URL"""
        return f"{self.proxy_url}/api/proxy?url={website_url}&client_id={client_id}"

    def _get_screenshot_url(self, website_url: str, client_id: str) -> str:
        """Generate screenshot URL"""
        return f"{self.screenshot_url}/api/screenshot?url={website_url}&client_id={client_id}"


preview_service = PreviewService()
