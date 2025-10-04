import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import logger from './utils/logger';
import proxyRouter from './routes/proxy';
import chatRouter from './routes/chat';
import widgetRouter from './routes/widget';
import healthRouter from './routes/health';
import { proxyRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for proxy responses
  frameguard: false, // We want to allow framing
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  credentials: true,
}));

app.use(express.json({ limit: process.env.REQUEST_SIZE_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.REQUEST_SIZE_LIMIT || '10mb' }));

// Logging
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// Rate limiting
app.use('/api', proxyRateLimiter);

// Routes
app.use('/api', proxyRouter);
app.use('/api', chatRouter);
app.use('/', widgetRouter);
app.use('/', healthRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`🚀 Proxy service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
  logger.info(`Network: http://192.168.86.87:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
