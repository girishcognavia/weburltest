/**
 * Chat API Route - Handles chat messages with RAG functionality
 */

import { Router, Request, Response } from 'express';
import logger from '../utils/logger';
import { extractContent, chunkContent } from '../utils/contentExtractor';
import { getCache, setCache } from '../utils/redis';
import axios from 'axios';

const router = Router();

interface ChatRequest {
  client_id: string;
  message: string;
  url: string;
  history?: Array<{ role: string; content: string }>;
}

interface ChatResponse {
  response: string;
  sources?: string[];
}

/**
 * Simple RAG implementation using website content
 */
const generateRAGResponse = async (
  message: string,
  url: string,
  _clientId: string
): Promise<{ response: string; sources: string[] }> => {
  try {
    // Get cached content for this URL
    const cacheKey = `content:${url}`;
    let extractedContent = await getCache(cacheKey);

    if (!extractedContent) {
      logger.info(`No cached content for ${url}, fetching...`);

      // Fetch the website content
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ChatbotRAG/1.0)'
        }
      });

      const content = extractContent(response.data, url);
      extractedContent = JSON.stringify(content);

      // Cache for 15 minutes
      await setCache(cacheKey, extractedContent, 900);
    }

    const content = JSON.parse(extractedContent);

    // Simple keyword-based search (in production, use vector embeddings)
    const messageLower = message.toLowerCase();
    const keywords = messageLower.split(/\s+/).filter(word => word.length > 3);

    // Search in content
    const relevantChunks = chunkContent(content.mainContent, 500, 100);
    const scoredChunks = relevantChunks.map(chunk => {
      const chunkLower = chunk.toLowerCase();
      const score = keywords.reduce((acc, keyword) => {
        return acc + (chunkLower.includes(keyword) ? 1 : 0);
      }, 0);
      return { chunk, score };
    });

    // Get top relevant chunks
    const topChunks = scoredChunks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.chunk);

    // Generate context from relevant content
    const context = topChunks.length > 0
      ? `Based on the website "${content.title}":\n\n${topChunks.join('\n\n')}`
      : `This question is about the website "${content.title}". ${content.description}`;

    // Generate response (in production, use LLM API like OpenAI/Anthropic)
    const response = await generateSimpleResponse(message, context, content);

    return {
      response: response,
      sources: topChunks.length > 0 ? [content.url] : []
    };
  } catch (error) {
    logger.error('RAG error:', error);
    throw error;
  }
};

/**
 * Simple response generator (placeholder for LLM)
 * In production, replace this with OpenAI/Anthropic API
 */
const generateSimpleResponse = async (
  message: string,
  context: string,
  content: any
): Promise<string> => {
  const messageLower = message.toLowerCase();

  // Simple pattern matching for demo
  if (messageLower.includes('what') || messageLower.includes('tell me about')) {
    return `This website is titled "${content.title}". ${content.description}\n\nThe main topics covered include: ${content.headings.slice(0, 3).join(', ')}.`;
  }

  if (messageLower.includes('how') || messageLower.includes('help')) {
    return `I can help you understand this website better. ${content.description}\n\nYou can browse through sections like: ${content.headings.slice(0, 5).join(', ')}.`;
  }

  if (messageLower.includes('contact') || messageLower.includes('reach')) {
    const contactLink = content.links.find((link: any) =>
      link.text.toLowerCase().includes('contact') ||
      link.url.toLowerCase().includes('contact')
    );

    if (contactLink) {
      return `You can contact them here: ${contactLink.url}`;
    }
    return `I couldn't find specific contact information on this page. You may want to look for a "Contact" or "About" page.`;
  }

  // Default response with context
  if (context.includes('Based on the website')) {
    const preview = context.split('\n\n')[1]?.substring(0, 200) || '';
    return `Based on the website content:\n\n${preview}...\n\nWould you like to know more about "${content.title}"?`;
  }

  return `I'm here to help you with questions about "${content.title}". ${content.description}\n\nWhat specific information are you looking for?`;
};

/**
 * POST /api/chat - Handle chat messages
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { client_id, message, url, history: _history = [] }: ChatRequest = req.body;

    // Validation
    if (!client_id || !message || !url) {
      return res.status(400).json({
        error: 'Missing required fields: client_id, message, url'
      });
    }

    logger.info(`Chat request from ${client_id} for ${url}: ${message}`);

    // Generate RAG response
    const { response, sources } = await generateRAGResponse(message, url, client_id);

    const chatResponse: ChatResponse = {
      response,
      sources
    };

    return res.json(chatResponse);
  } catch (error) {
    logger.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Failed to process chat message',
      response: "I'm sorry, I encountered an error. Please try again."
    });
  }
});

export default router;
