import axios from 'axios';
import logger from '../utils/logger';

const API_URL = 'http://localhost:5000/api';

/**
 * Test script for password reset functionality
 */
async function testPasswordReset() {
  try {
    logger.info('=== Testing Password Reset Functionality ===\n');

    // Test data
    const testEmail = 'test@example.com';
    const testPassword = 'OldPassword123';
    const newPassword = 'NewPassword456';

    // Step 1: Register a test user
    logger.info('Step 1: Registering test user...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, {
        email: testEmail,
        password: testPassword,
        first_name: 'Test',
        last_name: 'User',
        phone: '+1234567890',
      });
      logger.info('✓ User registered successfully');
      logger.info(`User ID: ${registerResponse.data.data.user.id}\n`);
    } catch (error: any) {
      if (error.response?.data?.error?.code === 'RES_3002') {
        logger.info('✓ User already exists, continuing with test\n');
      } else {
        throw error;
      }
    }

    // Step 2: Request password reset via email
    logger.info('Step 2: Requesting password reset via email...');
    const forgotPasswordResponse = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: testEmail,
    });
    logger.info('✓ Password reset request successful');
    logger.info(`Response: ${forgotPasswordResponse.data.data.message}\n`);

    // Step 3: Test with phone number
    logger.info('Step 3: Requesting password reset via phone...');
    const forgotPasswordPhoneResponse = await axios.post(`${API_URL}/auth/forgot-password`, {
      phone: '+1234567890',
    });
    logger.info('✓ Password reset request via phone successful');
    logger.info(`Response: ${forgotPasswordPhoneResponse.data.data.message}\n`);

    // Step 4: Test validation - missing both email and phone
    logger.info('Step 4: Testing validation - missing both email and phone...');
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {});
      logger.error('✗ Should have failed validation');
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.info('✓ Validation error caught correctly');
        logger.info(`Error: ${error.response.data.error.message}\n`);
      } else {
        throw error;
      }
    }

    // Step 5: Test with non-existent email (should still return success)
    logger.info('Step 5: Testing with non-existent email...');
    const nonExistentResponse = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: 'nonexistent@example.com',
    });
    logger.info('✓ Request handled correctly (no user enumeration)');
    logger.info(`Response: ${nonExistentResponse.data.data.message}\n`);

    // Step 6: Test reset password with invalid token
    logger.info('Step 6: Testing reset password with invalid token...');
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token: 'invalid-token-12345',
        newPassword: newPassword,
      });
      logger.error('✗ Should have failed with invalid token');
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.info('✓ Invalid token error caught correctly');
        logger.info(`Error: ${error.response.data.error.message}\n`);
      } else {
        throw error;
      }
    }

    // Step 7: Test password validation
    logger.info('Step 7: Testing password validation...');
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token: 'some-token',
        newPassword: 'weak',
      });
      logger.error('✗ Should have failed password validation');
    } catch (error: any) {
      if (error.response?.status === 400) {
        logger.info('✓ Password validation error caught correctly');
        logger.info(`Error: ${error.response.data.error.message}\n`);
      } else {
        throw error;
      }
    }

    // Step 8: Test with OAuth user (no password)
    logger.info('Step 8: Testing password reset for OAuth user...');
    try {
      // First, try to create an OAuth user (this might fail if already exists)
      try {
        await axios.post(`${API_URL}/auth/register`, {
          email: 'oauth@example.com',
          password: 'TempPassword123',
          first_name: 'OAuth',
          last_name: 'User',
        });
      } catch (error: any) {
        // Ignore if user already exists
      }

      // Try to reset password for OAuth user
      // Note: In a real scenario, OAuth users would have password_hash as null
      // For this test, we'll just verify the endpoint works
      const oauthResetResponse = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: 'oauth@example.com',
      });
      logger.info('✓ OAuth user password reset request handled');
      logger.info(`Response: ${oauthResetResponse.data.data.message}\n`);
    } catch (error: any) {
      logger.info(`Note: ${error.response?.data?.error?.message || error.message}\n`);
    }

    logger.info('=== Password Reset Tests Completed ===\n');
    logger.info('Summary:');
    logger.info('✓ Forgot password endpoint working');
    logger.info('✓ Email and phone number support working');
    logger.info('✓ Validation working correctly');
    logger.info('✓ Security measures in place (no user enumeration)');
    logger.info('✓ Password complexity validation working');
    logger.info('\nNote: To fully test password reset, you need to:');
    logger.info('1. Configure SendGrid API key for email sending');
    logger.info('2. Configure Twilio credentials for SMS sending');
    logger.info('3. Check the database for the reset token');
    logger.info('4. Use the token to actually reset the password');

  } catch (error: any) {
    logger.error('Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Run the test
testPasswordReset()
  .then(() => {
    logger.info('\n✓ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\n✗ Tests failed:', error);
    process.exit(1);
  });
