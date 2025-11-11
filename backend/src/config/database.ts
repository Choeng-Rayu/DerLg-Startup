import { Sequelize, Options } from 'sequelize';
import config from './env';
import logger from '../utils/logger';

/**
 * Database configuration for different environments
 */
const getDatabaseConfig = (): Options => {
  const isProduction = config.NODE_ENV === 'production';
  const isDevelopment = config.NODE_ENV === 'development';

  const baseConfig: Options = {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: 'mysql',
    logging: isDevelopment ? (sql: string) => logger.debug(sql) : false,
    
    // Connection pool configuration
    pool: {
      max: isProduction ? 20 : 5,        // Maximum connections in pool
      min: isProduction ? 5 : 0,         // Minimum connections in pool
      acquire: 60000,                     // Maximum time (ms) to get connection before throwing error
      idle: 10000,                        // Maximum time (ms) connection can be idle before being released
      evict: 1000,                        // Time interval (ms) to run eviction to remove idle connections
    },

    // Retry configuration
    retry: {
      max: 3,                             // Maximum retry attempts
      match: [                            // Retry on these errors
        /ETIMEDOUT/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /EHOSTUNREACH/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
    },

    // Query configuration
    define: {
      timestamps: true,                   // Add createdAt and updatedAt timestamps
      underscored: true,                  // Use snake_case for column names
      freezeTableName: true,              // Prevent Sequelize from pluralizing table names
    },

    // Timezone configuration
    timezone: '+07:00',                   // Cambodia timezone (ICT)

    // Benchmark queries in development
    benchmark: isDevelopment,

    // Additional production optimizations
    ...(isProduction && {
      dialectOptions: {
        connectTimeout: 60000,            // Connection timeout
        ssl: {
          require: false,                 // Enable if using SSL
          rejectUnauthorized: false,
        },
      },
    }),
  };

  return baseConfig;
};

/**
 * Initialize Sequelize instance with configuration
 */
const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  getDatabaseConfig()
);

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully', {
      host: config.DB_HOST,
      database: config.DB_NAME,
      environment: config.NODE_ENV,
    });
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database', {
      error: error instanceof Error ? error.message : 'Unknown error',
      host: config.DB_HOST,
      database: config.DB_NAME,
    });
    return false;
  }
};

/**
 * Sync database models (use with caution in production)
 */
export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    if (force && config.NODE_ENV === 'production') {
      logger.warn('Force sync is disabled in production environment');
      return;
    }

    await sequelize.sync({ force });
    logger.info('Database synchronized successfully', { force });
  } catch (error) {
    logger.error('Database synchronization failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Close database connection gracefully
 */
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('Database connection closed successfully');
  } catch (error) {
    logger.error('Error closing database connection', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Get connection pool status
 */
export const getPoolStatus = () => {
  try {
    const connectionManager = sequelize.connectionManager as any;
    const pool = connectionManager.pool;
    
    if (pool) {
      return {
        size: pool.size || 0,
        available: pool.available || 0,
        using: pool.using || 0,
        waiting: pool.waiting || 0,
      };
    }
    
    return {
      size: 0,
      available: 0,
      using: 0,
      waiting: 0,
    };
  } catch (error) {
    logger.warn('Unable to retrieve pool status');
    return {
      size: 0,
      available: 0,
      using: 0,
      waiting: 0,
    };
  }
};

export default sequelize;
