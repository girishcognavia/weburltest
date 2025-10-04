import { Router, Request, Response } from 'express';
import axios from 'axios';
import logger from '../utils/logger';
import { validateProxyUrl } from '../utils/urlValidator';
import { rewriteUrls } from '../utils/urlRewriter';
import { processHtml } from '../utils/htmlProcessor';
import { getCache, setCache } from '../utils/redis';
import crypto from 'crypto';

const router = Router();

const MAX_TIMEOUT = parseInt(process.env.MAX_PROXY_TIMEOUT || '10000');

// Generate cache key from URL and client ID
const generateCacheKey = (url: string, clientId: string): string => {
  const hash = crypto.createHash('md5').update(`${url}-${clientId}`).digest('hex');
  return `proxy:${hash}`;
};

router.get('/proxy', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const targetUrl = req.query.url as string;
  const clientId = req.query.client_id as string;
  const bypassCache = req.query.bypass_cache === 'true';

  // Validate required parameters
  if (!targetUrl) {
    return res.status(400).json({
      error: 'Missing required parameter',
      message: 'URL parameter is required',
    });
  }

  if (!clientId) {
    return res.status(400).json({
      error: 'Missing required parameter',
      message: 'client_id parameter is required',
    });
  }

  // Validate URL
  const validation = validateProxyUrl(targetUrl);
  if (!validation.valid) {
    logger.warn(`Invalid URL rejected: ${targetUrl} - ${validation.error}`);
    return res.status(400).json({
      error: 'Invalid URL',
      message: validation.error,
    });
  }

  try {
    // Check cache first
    const cacheKey = generateCacheKey(targetUrl, clientId);
    if (!bypassCache) {
      const cachedHtml = await getCache(cacheKey);
      if (cachedHtml) {
        logger.info(`Cache hit for ${targetUrl} (${Date.now() - startTime}ms)`);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Security-Policy', 'frame-ancestors *');
        return res.send(cachedHtml);
      }
    }

    logger.info(`Fetching URL: ${targetUrl}`);

    // Fetch the website
    const response = await axios.get(targetUrl, {
      timeout: MAX_TIMEOUT,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    let html = response.data;

    // Rewrite URLs to absolute
    html = rewriteUrls(html, targetUrl);

    // Process HTML (strip frame-blocking, inject widget, etc.)
    html = processHtml(html, clientId, true);

    // Cache the processed HTML
    await setCache(cacheKey, html);

    const duration = Date.now() - startTime;
    logger.info(`Proxy request completed for ${targetUrl} in ${duration}ms`);

    // Set headers to allow embedding
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *');
    res.setHeader('X-Response-Time', `${duration}ms`);

    return res.send(html);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`Proxy request failed for ${targetUrl}:`, {
      error: error.message,
      duration: `${duration}ms`,
      code: error.code,
    });

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: 'Gateway timeout',
        message: 'The website took too long to respond. Please try again or use screenshot mode.',
        suggestion: 'try_screenshot_method',
      });
    }

    if (error.response) {
      // The request was made and the server responded with an error status
      return res.status(error.response.status).json({
        error: 'Upstream error',
        message: `The website returned an error: ${error.response.statusText}`,
        statusCode: error.response.status,
      });
    }

    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({
        error: 'Website not found',
        message: 'The website could not be found. Please check the URL.',
      });
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(502).json({
        error: 'Connection refused',
        message: 'The website refused the connection.',
      });
    }

    // Generic error
    return res.status(500).json({
      error: 'Proxy error',
      message: 'Failed to fetch the website. Please try again.',
      suggestion: 'try_screenshot_method',
    });
  }
});

export default router;
