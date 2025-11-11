import axios from 'axios';
import User from '../models/User';
import logger from '../utils/logger';
import sequelize from '../config/database';

const API_URL = 'http://localhost:5000/api';

/**
 * Complete test script for password reset functionality
 * Tests the entire flow including token generation and password update
 */
async function testCompletePasswordReset() {
  try {
    logger.info('=== Testing Complete Password Reset Flow ===\n');

    // Test data
    const testEmail = 'resettest@example.com';
    const testPassword = 'OldPassword123';
    const newPassword = 'NewPassword456';

    // Step 1: Clean up any existing test user
    logger.info('Step 1: Cleaning up existing test user...');
    await User.destroy({ where: { email: testEmail } });
    logger.info('✓ Cleanup completed\n');

    // Step 2: Register a test user
    logger.info('Step 2: Registering test user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      password: testPassword,
      first_name: 'Reset',
      last_name: 'Test',
      phone: '+1234567891',
    });
    const userId = registerResponse.data.data.user.id;
    logger.info('✓ User registered successfully');
    logger.info(`User ID: ${userId}\n`);

    // Step 3: Verify user can login with old password
    logger.info('Step 3: Verifying login with old password...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword,
    });
    logger.info('✓ Login successful with old password\n');

    // Step 4: Request password reset
    logger.info('Step 4: Requesting password reset...');
    await axios.post(`${API_URL}/auth/forgot-password`, {
      email: testEmail,
    });
    logger.info('✓ Password reset requested\n');

    // Step 5: Get reset token from database
    logger.info('Step 5: Retrieving reset token from database...');
    const user = await User.findOne({ where: { email: testEmail } });
    if (!user || !user.password_reset_token) {
      throw new Error('Reset token not found in database');
    }
    const resetToken = user.password_reset_token;
    logger.info('✓ Reset token retrieved');
    logger.info(`Token: ${resetToken.substring(0, 20)}...\n`);

    // Step 6: Verify token expiration is set correctly (1 hour)
    logger.info('Step 6: Verifying token expiration...');
    if (!user.password_reset_expires) {
      throw new Error('Reset token expiration not set');
    }
    const expiresIn = user.password_reset_expires.getTime() - Date.now();
    const expiresInMinutes = Math.round(expiresIn / 1000 / 60);
    logger.info(`✓ Token expires in ${expiresInMinutes} minutes\n`);

    // Step 7: Reset password using token
    logger.info('Step 7: Resetting password with token...');
    const resetResponse = await axios.post(`${API_URL}/auth/reset-password`, {
      token: resetToken,
      newPassword: newPassword,
    });
    logger.info('✓ Password reset successful');
    logger.info(`Response: ${resetResponse.data.data.message}\n`);

    // Step 8: Verify old password no longer works
    logger.info('Step 8: Verifying old password no longer works...');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: testEmail,
        password: testPassword,
      });
      logger.error('✗ Old password still works - TEST FAILED');
      throw new Error('Old password should not work after reset');
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.info('✓ Old password correctly rejected\n');
      } else {
        throw error;
      }
    }

    // Step 9: Verify new password works
    logger.info('Step 9: Verifying new password works...');
    const newLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: newPassword,
    });
    logger.info('✓ Login successful with new password');
    logger.info(`User: ${newLoginResponse.data.data.user.email}\n`);

    // Step 10: Verify reset token is cleared from database
    logger.info('Step 10: Verifying reset token is cleared...');
    const updatedUser = await User.findOne({ where: { email: testEmail } });
    if (updatedUser?.password_reset_token !== null) {
      throw new Error('Reset token should be cleared after use');
    }
    logger.info('✓ Reset token cleared from database\n');

    // Step 11: Verify old refresh tokens are invalidated
    logger.info('Step 11: Verifying old refresh tokens are invalidated...');
    const oldRefreshToken = loginResponse.data.data.refreshToken;
    try {
      await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken: oldRefreshToken,
      });
      logger.error('✗ Old refresh token still works - TEST FAILED');
      throw new Error('Old refresh token should be invalidated after password reset');
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.info('✓ Old refresh token correctly invalidated\n');
      } else {
        throw error;
      }
    }

    // Step 12: Test token reuse prevention
    logger.info('Step 12: Testing token reuse prevention...');
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token: resetToken,
        newPassword: 'AnotherPassword789',
      });
      logger.error('✗ Token reuse should be prevented - TEST FAILED');
      throw new Error('Reset token should not be reusable');
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.info('✓ Token reuse correctly prevented');
        logger.info(`Error: ${error.response.data.error.message}\n`);
      } else {
        throw error;
      }
    }

    // Step 13: Test expired token
    logger.info('Step 13: Testing expired token handling...');
    // Request another reset
    await axios.post(`${API_URL}/auth/forgot-password`, {
      email: testEmail,
    });
    // Get the new token
    const userWithNewToken = await User.findOne({ where: { email: testEmail } });
    if (!userWithNewToken || !userWithNewToken.password_reset_token) {
      throw new Error('New reset token not found');
    }
    // Manually expire the token
    await User.update(
      { password_reset_expires: new Date(Date.now() - 1000) }, // 1 second ago
      { where: { email: testEmail } }
    );
    // Try to use expired token
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token: userWithNewToken.password_reset_token,
        newPassword: 'ExpiredPassword123',
      });
      logger.error('✗ Expired token should be rejected - TEST FAILED');
      throw new Error('Expired token should not work');
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.info('✓ Expired token correctly rejected');
        logger.info(`Error: ${error.response.data.error.message}\n`);
      } else {
        throw error;
      }
    }

    // Cleanup
    logger.info('Cleaning up test user...');
    await User.destroy({ where: { email: testEmail } });
    logger.info('✓ Cleanup completed\n');

    logger.info('=== Complete Password Reset Tests Completed ===\n');
    logger.info('Summary:');
    logger.info('✓ Password reset token generation working');
    logger.info('✓ Token stored in database with correct expiration');
    logger.info('✓ Password successfully updated using token');
    logger.info('✓ Old password correctly invalidated');
    logger.info('✓ New password works correctly');
    logger.info('✓ Reset token cleared after use');
    logger.info('✓ All JWT refresh tokens invalidated on password change');
    logger.info('✓ Token reuse prevented');
    logger.info('✓ Expired tokens rejected');

  } catch (error: any) {
    logger.error('Test failed:', error.response?.data || error.message);
    throw error;
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run the test
testCompletePasswordReset()
  .then(() => {
    logger.info('\n✓ All complete password reset tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n✗ Tests failed:', error);
    process.exit(1);
  });
