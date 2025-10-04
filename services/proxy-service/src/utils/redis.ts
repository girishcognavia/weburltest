import Redis from 'ioredis';
import logger from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisPassword = process.env.REDIS_PASSWORD;

export const redis = new Redis(redisUrl, {
  password: redisPassword,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error: Error) => {
  logger.error('Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

export const setCache = async (
  key: string,
  value: string,
  ttl: number = parseInt(process.env.CACHE_TTL || '300')
): Promise<void> => {
  try {
    await redis.setex(key, ttl, value);
    logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    logger.error('Error setting cache:', error);
    throw error;
  }
};

export const getCache = async (key: string): Promise<string | null> => {
  try {
    const value = await redis.get(key);
    logger.debug(`Cache ${value ? 'hit' : 'miss'}: ${key}`);
    return value;
  } catch (error) {
    logger.error('Error getting cache:', error);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
    logger.debug(`Cache deleted: ${key}`);
  } catch (error) {
    logger.error('Error deleting cache:', error);
  }
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

export default redis;
