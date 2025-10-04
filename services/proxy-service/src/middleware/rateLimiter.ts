import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';

const RATE_LIMIT_PER_MINUTE = parseInt(
  process.env.RATE_LIMIT_PER_MINUTE || '100'
);

export const proxyRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: RATE_LIMIT_PER_MINUTE,
  message: {
    error: 'Too many requests',
    message: `Rate limit exceeded. Maximum ${RATE_LIMIT_PER_MINUTE} requests per minute allowed.`,
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded. Maximum ${RATE_LIMIT_PER_MINUTE} requests per minute allowed.`,
      retryAfter: 60,
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

export default proxyRateLimiter;
