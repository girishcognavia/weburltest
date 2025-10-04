from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.models import (
    PreviewRequest,
    PreviewResponse,
    PreviewStatusResponse,
    RenderMethod,
    ShareResponse,
)
from app.services.preview_service import preview_service

router = APIRouter(prefix="/api/v1/preview", tags=["Preview"])


@router.post("/create", response_model=PreviewResponse)
async def create_preview(request: PreviewRequest):
    """Create a new preview session"""
    try:
        return await preview_service.create_preview(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{preview_id}/status", response_model=PreviewStatusResponse)
async def get_preview_status(preview_id: str):
    """Get the status of a preview session"""
    status = await preview_service.get_preview_status(preview_id)

    if not status:
        raise HTTPException(status_code=404, detail="Preview not found")

    return status


@router.get("/{preview_id}/render")
async def render_preview(
    preview_id: str,
    method: Optional[RenderMethod] = Query(None)
):
    """Render the preview (returns redirect URL)"""
    preview_url = await preview_service.render_preview(preview_id, method)

    if not preview_url:
        raise HTTPException(status_code=404, detail="Preview not found")

    return {"preview_url": preview_url}


@router.delete("/{preview_id}")
async def delete_preview(preview_id: str):
    """Delete a preview session"""
    success = await preview_service.delete_preview(preview_id)

    if not success:
        raise HTTPException(status_code=404, detail="Preview not found")

    return {"message": "Preview deleted successfully"}


@router.get("/{preview_id}/share", response_model=ShareResponse)
async def share_preview(preview_id: str):
    """Generate a shareable link for the preview"""
    share_data = await preview_service.share_preview(preview_id)

    if not share_data:
        raise HTTPException(status_code=404, detail="Preview not found")

    return share_data
