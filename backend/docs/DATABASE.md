# Database Configuration

## Overview

The DerLg Tourism Platform uses MySQL as the primary database with Sequelize ORM for data management. The database configuration is optimized for both development and production environments with proper connection pooling, error handling, and retry mechanisms.

## Configuration

### Environment Variables

Configure the following environment variables in your `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=derlg_tourism
DB_USER=root
DB_PASSWORD=your_password
```

### Connection Pool Settings

The connection pool is automatically configured based on the environment:

**Development:**
- Max connections: 5
- Min connections: 0
- Acquire timeout: 60 seconds
- Idle timeout: 10 seconds

**Production:**
- Max connections: 20
- Min connections: 5
- Acquire timeout: 60 seconds
- Idle timeout: 10 seconds

## Features

### 1. Automatic Retry

The database connection automatically retries on transient errors:
- Connection timeouts
- Connection resets
- Connection refused
- Host unreachable
- DNS resolution failures

Maximum retry attempts: 3

### 2. Error Handling

All database operations include comprehensive error handling with detailed logging:
- Connection errors
- Query errors
- Transaction errors
- Synchronization errors

### 3. Graceful Shutdown

The application handles graceful shutdown on SIGTERM and SIGINT signals:
1. Closes HTTP server
2. Closes database connections
3. Releases connection pool resources
4. Exits cleanly

### 4. Connection Pool Monitoring

Monitor connection pool status using the `getPoolStatus()` function:

```typescript
import { getPoolStatus } from './config/database';

const status = getPoolStatus();
console.log(status);
// Output: { size: 5, available: 3, using: 2, waiting: 0 }
```

## Usage

### Testing Connection

Test the database connection manually:

```bash
npx ts-node src/scripts/testDbConnection.ts
```

### Synchronizing Models

In development, models are automatically synchronized on server start. To force sync:

```typescript
import { syncDatabase } from './config/database';

// Sync without dropping tables
await syncDatabase(false);

// Force sync (drops and recreates tables - CAUTION!)
await syncDatabase(true);
```

**Note:** Force sync is disabled in production for safety.

### Closing Connection

Close the database connection gracefully:

```typescript
import { closeConnection } from './config/database';

await closeConnection();
```

## Database Setup

### 1. Install MySQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Windows:**
Download and install from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)

### 2. Create Database

```sql
CREATE DATABASE derlg_tourism CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'derlg_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON derlg_tourism.* TO 'derlg_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Update Environment Variables

Update your `.env` file with the database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=derlg_tourism
DB_USER=derlg_user
DB_PASSWORD=your_secure_password
```

## Production Considerations

### 1. SSL/TLS Connection

For production, enable SSL connections by updating the database config:

```typescript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-cert.pem'),
  },
}
```

### 2. Connection Limits

Adjust connection pool limits based on your server capacity:
- Consider your database server's max_connections setting
- Monitor connection usage and adjust accordingly
- Use connection pooling to prevent connection exhaustion

### 3. Monitoring

Monitor database performance:
- Connection pool utilization
- Query execution times
- Slow query logs
- Connection errors

### 4. Backup Strategy

Implement regular database backups:
- Daily full backups
- Hourly incremental backups
- Test restore procedures regularly
- Store backups in secure, off-site location

## Troubleshooting

### Connection Refused

**Error:** `ECONNREFUSED`

**Solutions:**
1. Verify MySQL is running: `sudo systemctl status mysql`
2. Check host and port in `.env`
3. Verify firewall rules allow connections
4. Check MySQL bind-address in `/etc/mysql/mysql.conf.d/mysqld.cnf`

### Authentication Failed

**Error:** `Access denied for user`

**Solutions:**
1. Verify username and password in `.env`
2. Check user privileges: `SHOW GRANTS FOR 'user'@'host';`
3. Reset password if needed

### Too Many Connections

**Error:** `Too many connections`

**Solutions:**
1. Reduce connection pool max size
2. Increase MySQL max_connections: `SET GLOBAL max_connections = 200;`
3. Check for connection leaks in application code

### Timeout Errors

**Error:** `Connection timeout`

**Solutions:**
1. Increase acquire timeout in pool config
2. Check network latency
3. Verify database server performance
4. Consider using connection retry logic

## References

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Connection Pooling Best Practices](https://sequelize.org/docs/v6/other-topics/connection-pool/)
