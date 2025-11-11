import sequelize from '../config/database';
import logger from '../utils/logger';

/**
 * Script to verify the users table structure
 */
async function verifyUserTable() {
    try {
        logger.info('Verifying users table structure...');

        // Test connection
        await sequelize.authenticate();
        logger.info('✓ Database connection established');

        // Get table structure
        const [columns] = await sequelize.query(`
      DESCRIBE users
    `);

        logger.info('\n=== Users Table Structure ===\n');
        console.table(columns);

        // Get indexes
        const [indexes] = await sequelize.query(`
      SHOW INDEX FROM users
    `);

        logger.info('\n=== Users Table Indexes ===\n');
        const indexInfo = (indexes as any[]).map((idx: any) => ({
            Key_name: idx.Key_name,
            Column_name: idx.Column_name,
            Non_unique: idx.Non_unique === 0 ? 'UNIQUE' : 'NON-UNIQUE',
            Index_type: idx.Index_type,
        }));
        console.table(indexInfo);

        // Get row count
        const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count FROM users
    `);
        const count = (countResult as any[])[0].count;

        logger.info(`\n✓ Total users in database: ${count}`);

        // Get sample data (without sensitive fields)
        const [users] = await sequelize.query(`
      SELECT 
        id,
        user_type,
        email,
        first_name,
        last_name,
        is_student,
        email_verified,
        is_active,
        created_at
      FROM users
      LIMIT 5
    `);

        if ((users as any[]).length > 0) {
            logger.info('\n=== Sample Users (First 5) ===\n');
            console.table(users);
        }

        logger.info('\n✓ Users table verification completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('Users table verification failed:', error);
        process.exit(1);
    }
}

// Run the verification
verifyUserTable();
