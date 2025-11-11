/**
 * Google OAuth Integration Test
 * 
 * This script demonstrates how to test the Google OAuth integration
 * with a running server and real Google credentials.
 * 
 * Prerequisites:
 * 1. Server must be running (npm run dev)
 * 2. Google OAuth credentials must be configured in .env
 * 3. You need a valid Google ID token or authorization code
 */

import axios from 'axios';
import logger from '../utils/logger';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Test Google OAuth with ID token
 */
async function testWithIdToken(idToken: string): Promise<void> {
  console.log('\n📝 Testing Google OAuth with ID Token...\n');

  try {
    const response = await axios.post(`${API_URL}/auth/social/google`, {
      idToken,
    });

    if (response.data.success) {
      results.push({
        test: 'Google OAuth with ID Token',
        passed: true,
        message: 'Successfully authenticated with Google',
        data: {
          userId: response.data.data.user.id,
          email: response.data.data.user.email,
          isNewUser: response.data.data.isNewUser,
        },
      });

      console.log('✅ Authentication successful!');
      console.log('   User ID:', response.data.data.user.id);
      console.log('   Email:', response.data.data.user.email);
      console.log('   Name:', `${response.data.data.user.first_name} ${response.data.data.user.last_name}`);
      console.log('   New User:', response.data.data.isNewUser);
      console.log('   Access Token:', response.data.data.accessToken.substring(0, 20) + '...');
    } else {
      results.push({
        test: 'Google OAuth with ID Token',
        passed: false,
        message: 'Authentication failed',
        data: response.data,
      });
      console.log('❌ Authentication failed');
    }
  } catch (error: any) {
    results.push({
      test: 'Google OAuth with ID Token',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
      data: error.response?.data,
    });

    console.log('❌ Error:', error.response?.data?.error?.message || error.message);
    if (error.response?.data?.error?.details) {
      console.log('   Details:', error.response.data.error.details);
    }
  }
}

/**
 * Test Google OAuth with authorization code
 */
async function testWithAuthCode(code: string): Promise<void> {
  console.log('\n📝 Testing Google OAuth with Authorization Code...\n');

  try {
    const response = await axios.post(`${API_URL}/auth/social/google`, {
      code,
    });

    if (response.data.success) {
      results.push({
        test: 'Google OAuth with Authorization Code',
        passed: true,
        message: 'Successfully authenticated with Google',
        data: {
          userId: response.data.data.user.id,
          email: response.data.data.user.email,
          isNewUser: response.data.data.isNewUser,
        },
      });

      console.log('✅ Authentication successful!');
      console.log('   User ID:', response.data.data.user.id);
      console.log('   Email:', response.data.data.user.email);
      console.log('   Name:', `${response.data.data.user.first_name} ${response.data.data.user.last_name}`);
      console.log('   New User:', response.data.data.isNewUser);
      console.log('   Access Token:', response.data.data.accessToken.substring(0, 20) + '...');
    } else {
      results.push({
        test: 'Google OAuth with Authorization Code',
        passed: false,
        message: 'Authentication failed',
        data: response.data,
      });
      console.log('❌ Authentication failed');
    }
  } catch (error: any) {
    results.push({
      test: 'Google OAuth with Authorization Code',
      passed: false,
      message: error.response?.data?.error?.message || error.message,
      data: error.response?.data,
    });

    console.log('❌ Error:', error.response?.data?.error?.message || error.message);
    if (error.response?.data?.error?.details) {
      console.log('   Details:', error.response.data.error.details);
    }
  }
}

/**
 * Test validation errors
 */
async function testValidation(): Promise<void> {
  console.log('\n📝 Testing Validation...\n');

  // Test 1: Missing credentials
  try {
    await axios.post(`${API_URL}/auth/social/google`, {});
    results.push({
      test: 'Validation - Missing Credentials',
      passed: false,
      message: 'Should have rejected missing credentials',
    });
    console.log('❌ Should have rejected missing credentials');
  } catch (error: any) {
    if (error.response?.status === 400) {
      results.push({
        test: 'Validation - Missing Credentials',
        passed: true,
        message: 'Correctly rejected missing credentials',
      });
      console.log('✅ Correctly rejected missing credentials');
    } else {
      results.push({
        test: 'Validation - Missing Credentials',
        passed: false,
        message: 'Unexpected error',
      });
      console.log('❌ Unexpected error');
    }
  }

  // Test 2: Invalid token
  try {
    await axios.post(`${API_URL}/auth/social/google`, {
      idToken: 'invalid-token',
    });
    results.push({
      test: 'Validation - Invalid Token',
      passed: false,
      message: 'Should have rejected invalid token',
    });
    console.log('❌ Should have rejected invalid token');
  } catch (error: any) {
    if (error.response?.status === 401) {
      results.push({
        test: 'Validation - Invalid Token',
        passed: true,
        message: 'Correctly rejected invalid token',
      });
      console.log('✅ Correctly rejected invalid token');
    } else {
      results.push({
        test: 'Validation - Invalid Token',
        passed: false,
        message: 'Unexpected error',
      });
      console.log('❌ Unexpected error');
    }
  }
}

/**
 * Print test summary
 */
function printSummary(): void {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.test}: ${r.message}`);
      });
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  console.log('='.repeat(60));
  console.log('GOOGLE OAUTH INTEGRATION TEST');
  console.log('='.repeat(60));

  // Check if server is running
  try {
    await axios.get(`${API_URL.replace('/api', '')}/health`);
  } catch (error) {
    console.log('\n⚠️  Warning: Server may not be running');
    console.log('   Make sure to start the server with: npm run dev\n');
  }

  // Get credentials from command line arguments
  const args = process.argv.slice(2);
  const idToken = args.find((arg) => arg.startsWith('--idToken='))?.split('=')[1];
  const code = args.find((arg) => arg.startsWith('--code='))?.split('=')[1];

  if (!idToken && !code) {
    console.log('\n📋 Usage:');
    console.log('   npm run test:google-oauth-integration -- --idToken=YOUR_ID_TOKEN');
    console.log('   npm run test:google-oauth-integration -- --code=YOUR_AUTH_CODE');
    console.log('\n⚠️  No credentials provided. Running validation tests only.\n');
  }

  // Run validation tests
  await testValidation();

  // Run authentication tests if credentials provided
  if (idToken) {
    await testWithIdToken(idToken);
  }

  if (code) {
    await testWithAuthCode(code);
  }

  // Print summary
  printSummary();

  // Instructions
  if (!idToken && !code) {
    console.log('\n📝 To test with real Google credentials:\n');
    console.log('1. Get a Google ID token:');
    console.log('   - Use Google Sign-In in your frontend');
    console.log('   - Or use Google OAuth Playground: https://developers.google.com/oauthplayground/');
    console.log('');
    console.log('2. Run the test:');
    console.log('   npm run test:google-oauth-integration -- --idToken=YOUR_TOKEN');
    console.log('');
    console.log('3. Or get an authorization code:');
    console.log('   - Visit the Google OAuth URL');
    console.log('   - Authorize the application');
    console.log('   - Copy the code from the redirect URL');
    console.log('   npm run test:google-oauth-integration -- --code=YOUR_CODE');
  }
}

// Run tests
if (require.main === module) {
  runTests()
    .then(() => {
      const failed = results.filter((r) => !r.passed).length;
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      logger.error('Test execution error:', error);
      console.error('\n❌ Test execution failed:', error);
      process.exit(1);
    });
}

export default runTests;
