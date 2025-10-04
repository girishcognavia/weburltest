import time
import uuid
import logging
from typing import List

from app.models import ChatRequest, ChatResponse, Source
from app.utils.redis_client import redis_client

logger = logging.getLogger(__name__)


class ChatService:
    """
    Demo chat service - In production, this would integrate with your RAG backend
    """

    async def send_message(
        self,
        preview_id: str,
        request: ChatRequest
    ) -> ChatResponse:
        """Process chat message and return response"""
        start_time = time.time()

        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or str(uuid.uuid4())

        # Store conversation in Redis
        conv_key = f"conversation:{preview_id}:{conversation_id}"
        conversation = redis_client.get(conv_key) or {"messages": []}

        # Add user message
        conversation["messages"].append({
            "role": "user",
            "content": request.message,
            "timestamp": time.time(),
        })

        # Generate demo response
        # In production, this would call your RAG service
        response_text = await self._generate_demo_response(request.message)
        sources = await self._get_demo_sources()

        # Add assistant message
        conversation["messages"].append({
            "role": "assistant",
            "content": response_text,
            "timestamp": time.time(),
            "sources": [s.dict() for s in sources],
        })

        # Store updated conversation
        redis_client.set(conv_key, conversation, ttl=3600)  # 1 hour

        response_time = int((time.time() - start_time) * 1000)

        return ChatResponse(
            response=response_text,
            sources=sources,
            response_time_ms=response_time,
            conversation_id=conversation_id,
        )

    async def _generate_demo_response(self, message: str) -> str:
        """Generate a demo response based on the message"""
        message_lower = message.lower()

        if "hello" in message_lower or "hi" in message_lower:
            return "Hello! I'm your website chatbot assistant. How can I help you today?"

        if "about" in message_lower:
            return "This website provides information and services. You can browse through different sections to learn more about our offerings."

        if "contact" in message_lower or "support" in message_lower:
            return "You can contact our support team through the contact form on the Contact page, or email us at support@example.com."

        if "features" in message_lower:
            return "Our main features include: comprehensive documentation, user-friendly interface, fast performance, and excellent customer support."

        if "help" in message_lower:
            return "I'm here to help! You can ask me about our services, features, pricing, or how to get started."

        # Default response
        return f"I understand you're asking about: '{message}'. In a production environment, I would search through the website content to provide a detailed answer based on the actual page content."

    async def _get_demo_sources(self) -> List[Source]:
        """Get demo sources for the response"""
        return [
            Source(
                page_url="https://example.com/about",
                page_title="About Us",
                relevance_score=0.92,
            ),
            Source(
                page_url="https://example.com/faq",
                page_title="FAQ",
                relevance_score=0.85,
            ),
        ]


chat_service = ChatService()
