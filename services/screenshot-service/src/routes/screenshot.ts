import { Router, Request, Response } from 'express';
import { screenshotService } from '../services/screenshotService';
import { generateCacheKey, getCachedScreenshot, cacheScreenshot } from '../utils/cache';
import logger from '../utils/logger';

const router = Router();

router.get('/screenshot', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const url = req.query.url as string;
  const clientId = req.query.client_id as string;
  const device = (req.query.device as string) || 'desktop';

  if (!url) {
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

  try {
    // Check cache
    const cacheKey = generateCacheKey(url, clientId, device);
    const cached = await getCachedScreenshot(cacheKey);

    if (cached) {
      const duration = Date.now() - startTime;
      logger.info(`Returning cached screenshot for ${url} (${duration}ms)`);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${duration}ms`);
      return res.send(cached);
    }

    // Generate screenshot
    logger.info(`Generating screenshot for ${url}`);
    const screenshot = await screenshotService.takeScreenshot(url, clientId, device);

    // Cache the screenshot
    await cacheScreenshot(cacheKey, screenshot);

    const duration = Date.now() - startTime;
    logger.info(`Screenshot generated for ${url} in ${duration}ms`);

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.send(screenshot);

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`Screenshot failed for ${url}:`, {
      error: error.message,
      duration: `${duration}ms`,
    });

    if (error.message?.includes('Timeout')) {
      return res.status(504).json({
        error: 'Timeout',
        message: 'Screenshot generation timed out. The website may be too slow or unresponsive.',
      });
    }

    if (error.message?.includes('net::ERR')) {
      return res.status(502).json({
        error: 'Network error',
        message: 'Failed to reach the website. Please check the URL.',
      });
    }

    return res.status(500).json({
      error: 'Screenshot failed',
      message: 'Failed to generate screenshot. Please try again.',
    });
  }
});

export default router;
