import { createServer } from 'http';
import app from './app';
import config from './config/env';
import { testConnection, syncDatabase, closeConnection, getPoolStatus } from './config/database';
import logger from './utils/logger';
import { initializeScheduledJobs } from './services/escrow-payment-scheduler.service';
import jobSchedulerService from './services/job-scheduler.service';
import websocketService from './services/websocket.service';

const PORT = config.PORT;

// Database connection and server startup
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      logger.error('Failed to establish database connection');
      process.exit(1);
    }

    // Sync database (in development only)
    if (config.NODE_ENV === 'development') {
      await syncDatabase(false);
    }

    // Initialize scheduled jobs for payment reminders and escrow management
    initializeScheduledJobs();

    // Initialize job scheduler for notifications and reminders
    jobSchedulerService.initializeJobs();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket service
    websocketService.initialize(httpServer);

    // Start server
    const server = httpServer.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info(`API URL: ${config.API_URL}`);
      logger.info(`WebSocket service: ${websocketService.isInitialized() ? 'Initialized' : 'Not initialized'}`);
      
      // Log connection pool status
      const poolStatus = getPoolStatus();
      logger.debug('Database connection pool status', poolStatus);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await closeConnection();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Unable to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
  });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

startServer();
