import sequelize from '../config/database';
import '../models/User'; // Import to register model
import logger from '../utils/logger';

/**
 * Script to sync all models with the database
 * This will create tables if they don't exist
 */
async function syncModels() {
  try {
    logger.info('Starting database synchronization...');

    // Test connection first
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync all models
    // force: false means it won't drop existing tables
    // alter: true means it will modify existing tables to match models
    await sequelize.sync({ alter: true });

    logger.info('Database synchronization completed successfully');
    logger.info('Models synced:', {
      User: 'users table',
    });

    // Display table info
    const [results] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        CREATE_TIME,
        UPDATE_TIME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = '${sequelize.config.database}'
      AND TABLE_NAME = 'users'
    `);

    logger.info('Table information:', results);

    process.exit(0);
  } catch (error) {
    logger.error('Database synchronization failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncModels();
