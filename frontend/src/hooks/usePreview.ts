import { useState, useCallback } from 'react';

interface UsePreviewOptions {
  proxyUrl: string;
  screenshotUrl: string;
}

interface PreviewState {
  url: string;
  method: 'proxy' | 'screenshot';
  loading: boolean;
  error: string | null;
}

export function usePreview({ proxyUrl, screenshotUrl }: UsePreviewOptions) {
  const [state, setState] = useState<PreviewState>({
    url: '',
    method: 'proxy',
    loading: false,
    error: null,
  });

  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const loadPreview = useCallback(
    async (websiteUrl: string, clientId: string, device: string) => {
      setState({
        url: '',
        method: 'proxy',
        loading: true,
        error: null,
      });
      setFallbackAttempted(false);

      try {
        // Try proxy method first
        const proxyPreviewUrl = `${proxyUrl}/api/proxy?url=${encodeURIComponent(websiteUrl)}&client_id=${encodeURIComponent(clientId)}`;

        setState({
          url: proxyPreviewUrl,
          method: 'proxy',
          loading: false,
          error: null,
        });

        return { url: proxyPreviewUrl, method: 'proxy' };
      } catch (error) {
        console.error('Proxy method failed:', error);
        return await fallbackToScreenshot(websiteUrl, clientId, device);
      }
    },
    [proxyUrl, screenshotUrl]
  );

  const fallbackToScreenshot = useCallback(
    async (websiteUrl: string, clientId: string, device: string) => {
      if (fallbackAttempted) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Both proxy and screenshot methods failed. Please try again or open the website in a new tab.',
        }));
        return null;
      }

      console.log('Falling back to screenshot method...');
      setFallbackAttempted(true);

      try {
        const screenshotPreviewUrl = `${screenshotUrl}/api/screenshot?url=${encodeURIComponent(websiteUrl)}&client_id=${encodeURIComponent(clientId)}&device=${device}`;

        setState({
          url: screenshotPreviewUrl,
          method: 'screenshot',
          loading: false,
          error: null,
        });

        return { url: screenshotPreviewUrl, method: 'screenshot' };
      } catch (error) {
        console.error('Screenshot method failed:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Screenshot generation failed. Please try again.',
        }));
        return null;
      }
    },
    [screenshotUrl, fallbackAttempted]
  );

  const handleIframeError = useCallback(
    (websiteUrl: string, clientId: string, device: string) => {
      if (!fallbackAttempted) {
        console.log('Iframe error detected, falling back to screenshot...');
        fallbackToScreenshot(websiteUrl, clientId, device);
      }
    },
    [fallbackToScreenshot, fallbackAttempted]
  );

  const reset = useCallback(() => {
    setState({
      url: '',
      method: 'proxy',
      loading: false,
      error: null,
    });
    setFallbackAttempted(false);
  }, []);

  return {
    ...state,
    loadPreview,
    handleIframeError,
    fallbackToScreenshot,
    reset,
  };
}
