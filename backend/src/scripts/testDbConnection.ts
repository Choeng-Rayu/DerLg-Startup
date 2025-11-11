/**
 * Script to test database connection
 * Run with: npx ts-node src/scripts/testDbConnection.ts
 */
import { testConnection, getPoolStatus, closeConnection } from '../config/database';
import logger from '../utils/logger';

const testDatabaseConnection = async () => {
  logger.info('Starting database connection test...');
  
  try {
    // Test connection
    const isConnected = await testConnection();
    
    if (isConnected) {
      logger.info('✓ Database connection test passed');
      
      // Get pool status
      const poolStatus = getPoolStatus();
      logger.info('Connection pool status:', poolStatus);
      
      // Close connection
      await closeConnection();
      logger.info('✓ Database connection closed successfully');
      
      process.exit(0);
    } else {
      logger.error('✗ Database connection test failed');
      process.exit(1);
    }
  } catch (error) {
    logger.error('✗ Database connection test error:', error);
    process.exit(1);
  }
};

testDatabaseConnection();
