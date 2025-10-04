import { Router, Request, Response } from 'express';
import { healthCheck } from '../utils/redis';
import logger from '../utils/logger';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const redisHealthy = await healthCheck();

    const health = {
      status: redisHealthy ? 'healthy' : 'degraded',
      service: 'proxy-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      redis: redisHealthy ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
    };

    const statusCode = redisHealthy ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'proxy-service',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

export default router;
