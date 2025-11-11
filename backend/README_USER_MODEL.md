# User Model Implementation - Setup and Testing Guide

## Overview

This document provides instructions for setting up and testing the User model implementation for the DerLg Tourism Platform.

## What Was Implemented

✅ **User Model** (`src/models/User.ts`)
- Complete User model with all required fields
- Three user types: super_admin, admin, tourist
- Support for email/password, Google OAuth, and Facebook OAuth authentication
- Student user support with discount tracking
- Comprehensive validations and constraints
- Password hashing with bcrypt (10 rounds)
- Instance methods for common operations

✅ **Database Indexes**
- idx_users_email (unique)
- idx_users_user_type
- idx_users_student_email
- idx_users_google_id (unique)
- idx_users_facebook_id (unique)
- idx_users_is_active

✅ **Model Hooks**
- beforeCreate: Hash passwords, normalize emails, auto-verify social auth
- beforeUpdate: Hash changed passwords, normalize emails
- beforeSave: Validate authentication methods and student requirements

✅ **Instance Methods**
- `comparePassword()` - Verify password against hash
- `getFullName()` - Get user's full name
- `hasStudentDiscountAvailable()` - Check student discount availability
- `useStudentDiscount()` - Use one student discount
- `toSafeObject()` - Get user object without sensitive data

✅ **Documentation**
- Comprehensive model documentation (`docs/USER_MODEL.md`)
- Migration file for table creation
- Test script with 14 test cases

## Prerequisites

Before testing the User model, ensure you have:

1. **MySQL Database** installed and running
2. **Node.js** (v18 or higher)
3. **npm** packages installed

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Database

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file and configure your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=derlg_tourism
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password

# JWT Configuration (required for authentication)
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
```

### 3. Create Database

Create the database in MySQL:

```sql
CREATE DATABASE derlg_tourism CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Test Database Connection

```bash
npm run db:test
```

Expected output:
```
✓ Database connection established successfully
```

## Testing the User Model

### Option 1: Run Comprehensive Tests

This will create the users table and run 14 test cases:

```bash
npm run test:user
```

The test script will:
1. ✓ Create/sync the users table
2. ✓ Create a tourist user with password
3. ✓ Test password comparison
4. ✓ Create a user with Google OAuth
5. ✓ Create a student user
6. ✓ Test student discount usage
7. ✓ Create an admin user
8. ✓ Create a super admin user
9. ✓ Test safe object method
10. ✓ Test full name method
11. ✓ Query users by type
12. ✓ Test email uniqueness constraint
13. ✓ Test validation errors
14. ✓ Test password update and hashing
15. ✓ Verify indexes are created

### Option 2: Sync Models Only

To just create/update the users table without running tests:

```bash
npm run db:sync
```

### Option 3: Manual Testing

You can also test the model manually using Node.js REPL:

```bash
npx ts-node
```

Then in the REPL:

```typescript
import User, { UserType } from './src/models/User';

// Create a tourist
const tourist = await User.create({
  user_type: UserType.TOURIST,
  email: 'test@example.com',
  password_hash: 'Password123!',
  first_name: 'Test',
  last_name: 'User'
});

console.log('User created:', tourist.toSafeObject());

// Test password
const isValid = await tourist.comparePassword('Password123!');
console.log('Password valid:', isValid);
```

## Verification Without Database

If you don't have a MySQL database set up yet, you can still verify the implementation:

### 1. Check TypeScript Compilation

```bash
npm run build
```

This will compile the TypeScript code and report any type errors.

### 2. Review the Implementation

Check the following files:
- `src/models/User.ts` - Main User model
- `src/models/index.ts` - Model exports
- `docs/USER_MODEL.md` - Comprehensive documentation
- `src/migrations/001-create-users-table.ts` - Migration file
- `src/scripts/testUserModel.ts` - Test script

### 3. Code Review Checklist

✅ All required fields from task specification:
- id, user_type, email, phone, password_hash
- google_id, facebook_id
- first_name, last_name, profile_image
- language, currency
- is_student, student_email, student_discount_remaining
- jwt_refresh_token
- email_verified, phone_verified, is_active
- last_login, created_at, updated_at

✅ All required indexes:
- idx_users_email
- idx_users_user_type
- idx_users_student_email

✅ Model validations:
- Email format validation
- Phone number format validation (E.164)
- Password hashing with bcrypt
- Unique constraints on email, phone, google_id, facebook_id
- Student email requirement when is_student is true
- At least one authentication method required

✅ Model hooks:
- beforeCreate: Password hashing, email normalization
- beforeUpdate: Password hashing on change
- beforeSave: Authentication and student validation

## Expected Database Schema

After running the sync or migration, your users table should have this structure:

```sql
CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `user_type` ENUM('super_admin', 'admin', 'tourist') NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NULL UNIQUE,
  `password_hash` VARCHAR(255) NULL,
  `google_id` VARCHAR(255) NULL UNIQUE,
  `facebook_id` VARCHAR(255) NULL UNIQUE,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `profile_image` VARCHAR(500) NULL,
  `language` ENUM('en', 'km', 'zh') NOT NULL DEFAULT 'en',
  `currency` ENUM('USD', 'KHR') NOT NULL DEFAULT 'USD',
  `is_student` BOOLEAN NOT NULL DEFAULT FALSE,
  `student_email` VARCHAR(255) NULL,
  `student_discount_remaining` INT NOT NULL DEFAULT 3,
  `jwt_refresh_token` TEXT NULL,
  `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `phone_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_login` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_user_type` (`user_type`),
  INDEX `idx_users_student_email` (`student_email`),
  INDEX `idx_users_google_id` (`google_id`),
  INDEX `idx_users_facebook_id` (`facebook_id`),
  INDEX `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Troubleshooting

### Database Connection Issues

If you get "Access denied" errors:
1. Check your MySQL credentials in `.env`
2. Ensure MySQL is running: `sudo systemctl status mysql`
3. Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### TypeScript Compilation Errors

If you get TypeScript errors:
1. Ensure all dependencies are installed: `npm install`
2. Check TypeScript version: `npx tsc --version`
3. Rebuild: `npm run build`

### Model Validation Errors

If validations fail during testing:
1. Check that email format is valid
2. Ensure phone numbers are in E.164 format (+1234567890)
3. Verify at least one authentication method is provided

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- ✅ **Requirement 1.1**: User registration with email and password
- ✅ **Requirement 32.1**: Multi-role authentication (super_admin, admin, tourist)
- ✅ **Requirement 58.1**: User database schema with all required fields
- ✅ **Requirement 58.2**: Authentication data storage

## Next Steps

After verifying the User model works correctly:

1. **Task 4**: Implement Hotels, Rooms, and related models
2. **Task 9**: Implement JWT authentication service
3. **Task 10**: Implement user registration and login endpoints

## Additional Resources

- [User Model Documentation](./docs/USER_MODEL.md)
- [Database Configuration](./docs/DATABASE.md)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)

## Support

If you encounter any issues:
1. Check the logs in the console output
2. Review the error messages carefully
3. Verify all prerequisites are met
4. Consult the documentation files
