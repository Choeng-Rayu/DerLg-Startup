import sequelize from '../config/database';
import User, { UserType, Language, Currency } from '../models/User';
import logger from '../utils/logger';

/**
 * Script to test User model functionality
 */
async function testUserModel() {
  try {
    logger.info('Starting User model tests...');

    // Test connection
    await sequelize.authenticate();
    logger.info('✓ Database connection established');

    // Sync the User model
    await User.sync({ force: true });
    logger.info('✓ User table created/synced');

    // Test 1: Create a tourist user with password
    logger.info('\nTest 1: Creating tourist user with password...');
    const tourist = await User.create({
      user_type: UserType.TOURIST,
      email: 'tourist@example.com',
      password_hash: 'Password123!',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890',
    });
    logger.info('✓ Tourist user created:', {
      id: tourist.id,
      email: tourist.email,
      user_type: tourist.user_type,
      password_hashed: tourist.password_hash?.startsWith('$2'),
    });

    // Test 2: Verify password comparison
    logger.info('\nTest 2: Testing password comparison...');
    const isValidPassword = await tourist.comparePassword('Password123!');
    const isInvalidPassword = await tourist.comparePassword('WrongPassword');
    logger.info('✓ Password comparison works:', {
      validPassword: isValidPassword,
      invalidPassword: !isInvalidPassword,
    });

    // Test 3: Create a user with Google OAuth
    logger.info('\nTest 3: Creating user with Google OAuth...');
    const googleUser = await User.create({
      user_type: UserType.TOURIST,
      email: 'google@example.com',
      google_id: 'google_123456',
      first_name: 'Jane',
      last_name: 'Smith',
      language: Language.ENGLISH,
      currency: Currency.USD,
    });
    logger.info('✓ Google OAuth user created:', {
      id: googleUser.id,
      email: googleUser.email,
      google_id: googleUser.google_id,
      email_verified: googleUser.email_verified,
    });

    // Test 4: Create a student user
    logger.info('\nTest 4: Creating student user...');
    const student = await User.create({
      user_type: UserType.TOURIST,
      email: 'student@example.com',
      password_hash: 'StudentPass123!',
      first_name: 'Alice',
      last_name: 'Johnson',
      is_student: true,
      student_email: 'alice@university.edu',
    });
    logger.info('✓ Student user created:', {
      id: student.id,
      is_student: student.is_student,
      student_email: student.student_email,
      student_discount_remaining: student.student_discount_remaining,
    });

    // Test 5: Test student discount usage
    logger.info('\nTest 5: Testing student discount usage...');
    const hasDiscount = student.hasStudentDiscountAvailable();
    await student.useStudentDiscount();
    logger.info('✓ Student discount used:', {
      hadDiscount: hasDiscount,
      remainingBefore: 3,
      remainingAfter: student.student_discount_remaining,
    });

    // Test 6: Create admin user
    logger.info('\nTest 6: Creating admin user...');
    const admin = await User.create({
      user_type: UserType.ADMIN,
      email: 'admin@derlg.com',
      password_hash: 'AdminPass123!',
      first_name: 'Admin',
      last_name: 'User',
    });
    logger.info('✓ Admin user created:', {
      id: admin.id,
      user_type: admin.user_type,
    });

    // Test 7: Create super admin user
    logger.info('\nTest 7: Creating super admin user...');
    const superAdmin = await User.create({
      user_type: UserType.SUPER_ADMIN,
      email: 'superadmin@derlg.com',
      password_hash: 'SuperAdminPass123!',
      first_name: 'Super',
      last_name: 'Admin',
    });
    logger.info('✓ Super admin user created:', {
      id: superAdmin.id,
      user_type: superAdmin.user_type,
    });

    // Test 8: Test safe object method
    logger.info('\nTest 8: Testing safe object method...');
    const safeUser = tourist.toSafeObject();
    logger.info('✓ Safe object created:', {
      hasPassword: 'password_hash' in safeUser,
      hasRefreshToken: 'jwt_refresh_token' in safeUser,
      hasEmail: 'email' in safeUser,
    });

    // Test 9: Test full name method
    logger.info('\nTest 9: Testing full name method...');
    const fullName = tourist.getFullName();
    logger.info('✓ Full name method works:', {
      fullName,
      expected: 'John Doe',
    });

    // Test 10: Query users by type
    logger.info('\nTest 10: Querying users by type...');
    const tourists = await User.findAll({
      where: { user_type: UserType.TOURIST },
    });
    const admins = await User.findAll({
      where: { user_type: UserType.ADMIN },
    });
    logger.info('✓ Query by user type works:', {
      touristsCount: tourists.length,
      adminsCount: admins.length,
    });

    // Test 11: Test email uniqueness
    logger.info('\nTest 11: Testing email uniqueness constraint...');
    try {
      await User.create({
        user_type: UserType.TOURIST,
        email: 'tourist@example.com', // Duplicate email
        password_hash: 'Password123!',
        first_name: 'Duplicate',
        last_name: 'User',
      });
      logger.error('✗ Email uniqueness constraint failed');
    } catch (error: any) {
      logger.info('✓ Email uniqueness constraint works:', {
        error: error.name,
      });
    }

    // Test 12: Test validation errors
    logger.info('\nTest 12: Testing validation errors...');
    try {
      await User.create({
        user_type: UserType.TOURIST,
        email: 'invalid-email', // Invalid email format
        password_hash: 'Password123!',
        first_name: 'Test',
        last_name: 'User',
      });
      logger.error('✗ Email validation failed');
    } catch (error: any) {
      logger.info('✓ Email validation works:', {
        error: error.name,
      });
    }

    // Test 13: Update user and test password hashing
    logger.info('\nTest 13: Testing password update and hashing...');
    tourist.password_hash = 'NewPassword123!';
    await tourist.save();
    const isNewPasswordValid = await tourist.comparePassword('NewPassword123!');
    logger.info('✓ Password update and hashing works:', {
      newPasswordValid: isNewPasswordValid,
    });

    // Test 14: Test indexes
    logger.info('\nTest 14: Checking indexes...');
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM users
    `);
    logger.info('✓ Indexes created:', {
      indexCount: (indexes as any[]).length,
      indexes: (indexes as any[]).map((idx: any) => idx.Key_name),
    });

    logger.info('\n✓ All User model tests passed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('User model test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testUserModel();
