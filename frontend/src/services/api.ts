import axios from 'axios';
import type {
  PreviewRequest,
  PreviewResponse,
  PreviewStatus,
  ChatRequest,
  ChatResponse,
} from '../types';

const PROXY_API_URL = import.meta.env.VITE_PROXY_API_URL || 'http://localhost:3000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const proxyClient = axios.create({
  baseURL: PROXY_API_URL,
  timeout: 15000,
});

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Proxy Service API
export const proxyApi = {
  async fetchProxiedWebsite(url: string, clientId: string): Promise<string> {
    const response = await proxyClient.get('/api/proxy', {
      params: { url, client_id: clientId },
      responseType: 'text',
    });
    return response.data;
  },

  async healthCheck() {
    const response = await proxyClient.get('/health');
    return response.data;
  },
};

// Preview Management API
export const previewApi = {
  async createPreview(request: PreviewRequest): Promise<PreviewResponse> {
    const response = await apiClient.post('/api/v1/preview/create', request);
    return response.data;
  },

  async getPreviewStatus(previewId: string): Promise<PreviewStatus> {
    const response = await apiClient.get(`/api/v1/preview/${previewId}/status`);
    return response.data;
  },

  async renderPreview(previewId: string, method?: 'proxy' | 'screenshot'): Promise<string> {
    const response = await apiClient.get(`/api/v1/preview/${previewId}/render`, {
      params: { method },
      responseType: 'text',
    });
    return response.data;
  },

  async deletePreview(previewId: string): Promise<void> {
    await apiClient.delete(`/api/v1/preview/${previewId}`);
  },

  async sharePreview(previewId: string): Promise<{ share_url: string; expires_at: string }> {
    const response = await apiClient.get(`/api/v1/preview/${previewId}/share`);
    return response.data;
  },
};

// Chat API
export const chatApi = {
  async sendMessage(previewId: string, request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post(`/api/v1/preview/${previewId}/chat`, request);
    return response.data;
  },
};

export default {
  proxy: proxyApi,
  preview: previewApi,
  chat: chatApi,
};
