from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Literal, List
from datetime import datetime
from enum import Enum


class DeviceType(str, Enum):
    desktop = "desktop"
    tablet = "tablet"
    mobile = "mobile"


class RenderMethod(str, Enum):
    proxy = "proxy"
    screenshot = "screenshot"
    auto = "auto"


class PreviewStatus(str, Enum):
    processing = "processing"
    ready = "ready"
    failed = "failed"


class PreviewSettings(BaseModel):
    device: DeviceType = DeviceType.desktop
    render_method: RenderMethod = RenderMethod.auto


class PreviewRequest(BaseModel):
    website_url: HttpUrl
    max_pages: Optional[int] = Field(default=30, ge=1, le=100)
    client_id: str = Field(..., min_length=1, max_length=100)
    preview_settings: PreviewSettings = Field(default_factory=PreviewSettings)


class PreviewResponse(BaseModel):
    preview_id: str
    status: PreviewStatus
    preview_url: str
    estimated_time_seconds: int


class PreviewStatusResponse(BaseModel):
    status: PreviewStatus
    progress_percentage: int = Field(ge=0, le=100)
    pages_crawled: int = 0
    current_page: Optional[str] = None
    error_message: Optional[str] = None


class Source(BaseModel):
    page_url: str
    page_title: str
    relevance_score: float = Field(ge=0.0, le=1.0)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    sources: List[Source] = []
    response_time_ms: int
    conversation_id: str


class ShareResponse(BaseModel):
    share_url: str
    expires_at: datetime


class HealthResponse(BaseModel):
    status: str
    service: str = "api-service"
    timestamp: datetime
    redis: str
    proxy_service: Optional[str] = None
    screenshot_service: Optional[str] = None
