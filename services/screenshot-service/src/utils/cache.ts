import Redis from 'ioredis';
import crypto from 'crypto';
import logger from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '900'); // 15 minutes

export const redis = new Redis(redisUrl, {
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (error: Error) => {
  logger.error('Redis error:', error);
});

export function generateCacheKey(url: string, clientId: string, device: string): string {
  const hash = crypto.createHash('md5').update(`${url}-${clientId}-${device}`).digest('hex');
  return `screenshot:${hash}`;
}

export async function getCachedScreenshot(key: string): Promise<Buffer | null> {
  try {
    const cached = await redis.getBuffer(key);
    if (cached) {
      logger.info(`Cache hit: ${key}`);
      return cached;
    }
    logger.info(`Cache miss: ${key}`);
    return null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

export async function cacheScreenshot(key: string, screenshot: Buffer): Promise<void> {
  try {
    await redis.setex(key, CACHE_TTL, screenshot);
    logger.info(`Cached screenshot: ${key}`);
  } catch (error) {
    logger.error('Cache set error:', error);
  }
}

export default redis;
