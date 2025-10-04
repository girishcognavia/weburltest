import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import logger from './utils/logger';
import screenshotRouter from './routes/screenshot';
import healthRouter from './routes/health';
import { screenshotService } from './services/screenshotService';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// Routes
app.use('/api', screenshotRouter);
app.use('/', healthRouter);

// Initialize browser on startup
(async () => {
  try {
    await screenshotService.initialize();
    logger.info('Screenshot service initialized');
  } catch (error) {
    logger.error('Failed to initialize screenshot service:', error);
  }
})();

const server = app.listen(PORT, () => {
  logger.info(`🚀 Screenshot service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server...');
  server.close(async () => {
    await screenshotService.close();
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing server...');
  server.close(async () => {
    await screenshotService.close();
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
