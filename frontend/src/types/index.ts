export interface PreviewSettings {
  device: 'desktop' | 'tablet' | 'mobile';
  renderMethod: 'proxy' | 'screenshot' | 'auto';
}

export interface PreviewRequest {
  website_url: string;
  max_pages?: number;
  client_id: string;
  preview_settings: PreviewSettings;
}

export interface PreviewResponse {
  preview_id: string;
  status: 'processing' | 'ready' | 'failed';
  preview_url: string;
  estimated_time_seconds: number;
}

export interface PreviewStatus {
  status: 'processing' | 'ready' | 'failed';
  progress_percentage: number;
  pages_crawled: number;
  current_page: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  confidence?: number;
}

export interface Source {
  page_url: string;
  page_title: string;
  relevance_score: number;
}

export interface ChatRequest {
  message: string;
  conversation_id: string;
}

export interface ChatResponse {
  response: string;
  sources: Source[];
  response_time_ms: number;
}
