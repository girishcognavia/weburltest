/**
 * Widget Deployment Route - Serves the chatbot widget script
 */

import { Router, Request, Response } from 'express';
import logger from '../utils/logger';

const router = Router();

const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * GET /widget.js - Serve the chatbot widget script
 */
router.get('/widget.js', (_req: Request, res: Response) => {
  const widgetScript = `
/**
 * CognaBot Widget - Embeddable AI Chatbot
 * Auto-generated widget script
 */
(function() {
  // Prevent multiple widget loads
  if (window.__COGNABOT_LOADED__) return;
  window.__COGNABOT_LOADED__ = true;

  // Get configuration from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-chatbot-id]');
  const chatbotId = scriptTag?.getAttribute('data-chatbot-id') || 'default';
  const websiteUrl = scriptTag?.getAttribute('data-website-url') || window.location.href;
  const API_URL = '${API_URL}';

  // Widget state
  let isOpen = false;
  let messages = [];
  let isLoading = false;

  // Create widget HTML
  const widgetHTML = \`
    <div id="cognabot-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- Chat Button -->
      <button id="cognabot-toggle" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-center: center; transition: transform 0.2s;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <!-- Chat Window -->
      <div id="cognabot-window" style="display: none; position: absolute; bottom: 80px; right: 0; width: 380px; height: 600px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); flex-direction: column; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Chat Assistant</h3>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Ask me anything about this website</p>
          </div>
          <button id="cognabot-close" style="background: transparent; border: none; color: white; cursor: pointer; padding: 4px; opacity: 0.8; transition: opacity 0.2s;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div id="cognabot-messages" style="flex: 1; overflow-y: auto; padding: 20px; background: #f7f9fc;">
          <div style="text-align: center; color: #64748b; font-size: 14px; padding: 20px;">
            👋 Hi! I'm here to help you with any questions about this website.
          </div>
        </div>

        <!-- Input -->
        <div style="padding: 16px; background: white; border-top: 1px solid #e2e8f0;">
          <form id="cognabot-form" style="display: flex; gap: 8px;">
            <input
              id="cognabot-input"
              type="text"
              placeholder="Type your message..."
              style="flex: 1; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
            />
            <button type="submit" style="padding: 12px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: opacity 0.2s;">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  \`;

  // Inject widget
  const container = document.createElement('div');
  container.innerHTML = widgetHTML;
  document.body.appendChild(container);

  // Get elements
  const toggleBtn = document.getElementById('cognabot-toggle');
  const closeBtn = document.getElementById('cognabot-close');
  const chatWindow = document.getElementById('cognabot-window');
  const chatMessages = document.getElementById('cognabot-messages');
  const chatForm = document.getElementById('cognabot-form');
  const chatInput = document.getElementById('cognabot-input');

  // Toggle chat
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    toggleBtn.style.transform = isOpen ? 'scale(0)' : 'scale(1)';
    if (isOpen) chatInput.focus();
  }

  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  // Add message
  function addMessage(content, role = 'assistant') {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = \`
      display: flex;
      justify-content: \${role === 'user' ? 'flex-end' : 'flex-start'};
      margin-bottom: 12px;
    \`;

    messageDiv.innerHTML = \`
      <div style="
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 12px;
        background: \${role === 'user' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ffffff'};
        color: \${role === 'user' ? 'white' : '#1e293b'};
        font-size: 14px;
        line-height: 1.5;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      ">
        \${content}
      </div>
    \`;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    messages.push({ role, content });
  }

  // Show loading
  function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'cognabot-loading';
    loadingDiv.style.cssText = 'display: flex; justify-content: flex-start; margin-bottom: 12px;';
    loadingDiv.innerHTML = \`
      <div style="background: #ffffff; padding: 12px 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="display: flex; gap: 4px;">
          <div style="width: 8px; height: 8px; background: #667eea; border-radius: 50%; animation: cognabot-bounce 1.4s infinite ease-in-out both;"></div>
          <div style="width: 8px; height: 8px; background: #667eea; border-radius: 50%; animation: cognabot-bounce 1.4s 0.2s infinite ease-in-out both;"></div>
          <div style="width: 8px; height: 8px; background: #667eea; border-radius: 50%; animation: cognabot-bounce 1.4s 0.4s infinite ease-in-out both;"></div>
        </div>
      </div>
    \`;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideLoading() {
    const loadingDiv = document.getElementById('cognabot-loading');
    if (loadingDiv) loadingDiv.remove();
  }

  // Send message
  async function sendMessage(message) {
    if (isLoading) return;

    addMessage(message, 'user');
    chatInput.value = '';

    isLoading = true;
    showLoading();

    try {
      const response = await fetch(\`\${API_URL}/api/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: chatbotId,
          message: message,
          url: websiteUrl,
          history: messages
        })
      });

      const data = await response.json();
      hideLoading();

      if (data.response) {
        addMessage(data.response, 'assistant');
      } else {
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
      }
    } catch (error) {
      hideLoading();
      addMessage('Sorry, I could not connect to the server. Please try again.', 'assistant');
      console.error('Chat error:', error);
    } finally {
      isLoading = false;
    }
  }

  // Handle form
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message) sendMessage(message);
  });

  // Add CSS
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes cognabot-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    #cognabot-input:focus {
      border-color: #667eea !important;
    }
    #cognabot-toggle:hover {
      transform: scale(1.05) !important;
    }
    #cognabot-close:hover {
      opacity: 1 !important;
    }
  \`;
  document.head.appendChild(style);

  console.log('CognaBot widget loaded successfully!', { chatbotId, websiteUrl });
})();
  `;

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.send(widgetScript);

  logger.info('Widget script served');
});

export default router;
