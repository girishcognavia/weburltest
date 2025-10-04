from fastapi import APIRouter, HTTPException

from app.models import ChatRequest, ChatResponse
from app.services.chat_service import chat_service
from app.utils.redis_client import redis_client

router = APIRouter(prefix="/api/v1/preview", tags=["Chat"])


@router.post("/{preview_id}/chat", response_model=ChatResponse)
async def send_chat_message(preview_id: str, request: ChatRequest):
    """Send a chat message in the context of a preview"""
    # Verify preview exists
    if not redis_client.exists(f"preview:{preview_id}"):
        raise HTTPException(status_code=404, detail="Preview not found")

    try:
        return await chat_service.send_message(preview_id, request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
