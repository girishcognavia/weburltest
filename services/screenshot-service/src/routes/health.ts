import { Router, Request, Response } from 'express';
import { redis } from '../utils/cache';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const redisPing = await redis.ping();
    const redisHealthy = redisPing === 'PONG';

    const health = {
      status: redisHealthy ? 'healthy' : 'degraded',
      service: 'screenshot-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      redis: redisHealthy ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
    };

    const statusCode = redisHealthy ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'screenshot-service',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

export default router;
