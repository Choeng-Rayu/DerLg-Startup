import axios from 'axios';
import logger from '../utils/logger';

const API_BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Test user registration
 */
async function testRegistration() {
  try {
    logger.info('Testing user registration...');

    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'Test1234',
      first_name: 'Test',
      last_name: 'User',
      phone: '+85512345678',
      language: 'en',
      currency: 'USD',
    };

    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);

    if (response.status === 201 && response.data.success) {
      results.push({
        test: 'User Registration',
        passed: true,
        message: 'User registered successfully',
        data: {
          userId: response.data.data.user.id,
          email: response.data.data.user.email,
          hasAccessToken: !!response.data.data.accessToken,
          hasRefreshToken: !!response.data.data.refreshToken,
        },
      });
      return {
        user: response.data.data.user,
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
    } else {
      results.push({
        test: 'User Registration',
        passed: false,
        message: 'Registration failed with unexpected response',
        data: response.data,
      });
      return null;
    }
  } catch (error: any) {
    results.push({
      test: 'User Registration',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
      data: error.response?.data,
    });
    return null;
  }
}

/**
 * Test user login
 */
async function testLogin(email: string, password: string) {
  try {
    logger.info('Testing user login...');

    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });

    if (response.status === 200 && response.data.success) {
      results.push({
        test: 'User Login',
        passed: true,
        message: 'User logged in successfully',
        data: {
          userId: response.data.data.user.id,
          email: response.data.data.user.email,
          hasAccessToken: !!response.data.data.accessToken,
          hasRefreshToken: !!response.data.data.refreshToken,
        },
      });
      return {
        user: response.data.data.user,
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
    } else {
      results.push({
        test: 'User Login',
        passed: false,
        message: 'Login failed with unexpected response',
        data: response.data,
      });
      return null;
    }
  } catch (error: any) {
    results.push({
      test: 'User Login',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
      data: error.response?.data,
    });
    return null;
  }
}

/**
 * Test password validation
 */
async function testPasswordValidation() {
  try {
    logger.info('Testing password validation...');

    const weakPasswords = [
      { password: 'short', reason: 'too short' },
      { password: 'nouppercase1', reason: 'no uppercase' },
      { password: 'NOLOWERCASE1', reason: 'no lowercase' },
      { password: 'NoNumbers', reason: 'no numbers' },
    ];

    let allValidationsPassed = true;

    for (const { password, reason } of weakPasswords) {
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, {
          email: `test${Date.now()}@example.com`,
          password,
          first_name: 'Test',
          last_name: 'User',
        });
        allValidationsPassed = false;
        results.push({
          test: `Password Validation (${reason})`,
          passed: false,
          message: `Weak password was accepted: ${reason}`,
        });
      } catch (error: any) {
        if (error.response?.status === 400) {
          results.push({
            test: `Password Validation (${reason})`,
            passed: true,
            message: `Correctly rejected weak password: ${reason}`,
          });
        } else {
          allValidationsPassed = false;
          results.push({
            test: `Password Validation (${reason})`,
            passed: false,
            message: `Unexpected error: ${error.message}`,
          });
        }
      }
    }

    return allValidationsPassed;
  } catch (error: any) {
    results.push({
      test: 'Password Validation',
      passed: false,
      message: error.message,
    });
    return false;
  }
}

/**
 * Test duplicate email registration
 */
async function testDuplicateEmail(email: string) {
  try {
    logger.info('Testing duplicate email registration...');

    await axios.post(`${API_BASE_URL}/auth/register`, {
      email,
      password: 'Test1234',
      first_name: 'Duplicate',
      last_name: 'User',
    });

    results.push({
      test: 'Duplicate Email Prevention',
      passed: false,
      message: 'Duplicate email was accepted',
    });
    return false;
  } catch (error: any) {
    if (error.response?.status === 409) {
      results.push({
        test: 'Duplicate Email Prevention',
        passed: true,
        message: 'Correctly rejected duplicate email',
      });
      return true;
    } else {
      results.push({
        test: 'Duplicate Email Prevention',
        passed: false,
        message: `Unexpected error: ${error.response?.data?.error?.message || error.message}`,
      });
      return false;
    }
  }
}

/**
 * Test invalid login credentials
 */
async function testInvalidLogin(email: string) {
  try {
    logger.info('Testing invalid login credentials...');

    await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password: 'WrongPassword123',
    });

    results.push({
      test: 'Invalid Login Prevention',
      passed: false,
      message: 'Invalid credentials were accepted',
    });
    return false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      results.push({
        test: 'Invalid Login Prevention',
        passed: true,
        message: 'Correctly rejected invalid credentials',
      });
      return true;
    } else {
      results.push({
        test: 'Invalid Login Prevention',
        passed: false,
        message: `Unexpected error: ${error.response?.data?.error?.message || error.message}`,
      });
      return false;
    }
  }
}

/**
 * Test token refresh
 */
async function testTokenRefresh(refreshToken: string) {
  try {
    logger.info('Testing token refresh...');

    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken,
    });

    if (response.status === 200 && response.data.success) {
      results.push({
        test: 'Token Refresh',
        passed: true,
        message: 'Token refreshed successfully',
        data: {
          hasNewAccessToken: !!response.data.data.accessToken,
          hasNewRefreshToken: !!response.data.data.refreshToken,
        },
      });
      return true;
    } else {
      results.push({
        test: 'Token Refresh',
        passed: false,
        message: 'Token refresh failed with unexpected response',
      });
      return false;
    }
  } catch (error: any) {
    results.push({
      test: 'Token Refresh',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
    });
    return false;
  }
}

/**
 * Test authenticated endpoint access
 */
async function testAuthenticatedAccess(accessToken: string) {
  try {
    logger.info('Testing authenticated endpoint access...');

    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200 && response.data.success) {
      results.push({
        test: 'Authenticated Access',
        passed: true,
        message: 'Successfully accessed protected endpoint',
        data: {
          userId: response.data.data.user.id,
          email: response.data.data.user.email,
        },
      });
      return true;
    } else {
      results.push({
        test: 'Authenticated Access',
        passed: false,
        message: 'Unexpected response from protected endpoint',
      });
      return false;
    }
  } catch (error: any) {
    results.push({
      test: 'Authenticated Access',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
    });
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  logger.info('='.repeat(60));
  logger.info('Starting Registration and Login Tests');
  logger.info('='.repeat(60));

  // Test 1: User Registration
  const registrationResult = await testRegistration();
  if (!registrationResult) {
    logger.error('Registration test failed. Stopping tests.');
    printResults();
    return;
  }

  const { user, accessToken, refreshToken } = registrationResult;

  // Test 2: User Login
  await testLogin(user.email, 'Test1234');

  // Test 3: Password Validation
  await testPasswordValidation();

  // Test 4: Duplicate Email Prevention
  await testDuplicateEmail(user.email);

  // Test 5: Invalid Login Prevention
  await testInvalidLogin(user.email);

  // Test 6: Token Refresh
  await testTokenRefresh(refreshToken);

  // Test 7: Authenticated Access
  await testAuthenticatedAccess(accessToken);

  // Print results
  printResults();
}

/**
 * Print test results
 */
function printResults() {
  logger.info('\n' + '='.repeat(60));
  logger.info('Test Results');
  logger.info('='.repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((result) => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    logger.info(`\n${status}: ${result.test}`);
    logger.info(`  Message: ${result.message}`);
    if (result.data) {
      logger.info(`  Data: ${JSON.stringify(result.data, null, 2)}`);
    }
  });

  logger.info('\n' + '='.repeat(60));
  logger.info(`Total Tests: ${results.length}`);
  logger.info(`Passed: ${passed}`);
  logger.info(`Failed: ${failed}`);
  logger.info('='.repeat(60));

  if (failed === 0) {
    logger.info('✓ All tests passed!');
  } else {
    logger.error(`✗ ${failed} test(s) failed`);
  }
}

// Run tests
runTests().catch((error) => {
  logger.error('Test execution failed:', error);
  process.exit(1);
});
