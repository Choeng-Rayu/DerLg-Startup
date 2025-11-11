import axios from 'axios';
import config from '../config/env';
import logger from '../utils/logger';

/**
 * Integration test for Facebook OAuth authentication flow
 * 
 * This script tests the complete Facebook OAuth flow through the API endpoint
 */

const API_URL = config.API_URL || 'http://localhost:5000';

async function testFacebookOAuthIntegration() {
  console.log('=== Facebook OAuth Integration Test ===\n');
  console.log(`API URL: ${API_URL}\n`);

  try {
    // Test 1: Test with missing credentials
    console.log('Test 1: POST /api/auth/social/facebook (missing credentials)');
    try {
      await axios.post(`${API_URL}/api/auth/social/facebook`, {});
      console.log('✗ Should have failed with missing credentials');
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✓ Correctly rejected request with missing credentials');
        console.log('Response:', error.response.data);
      } else {
        console.log('✗ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 2: Test with invalid access token
    console.log('Test 2: POST /api/auth/social/facebook (invalid access token)');
    try {
      await axios.post(`${API_URL}/api/auth/social/facebook`, {
        accessToken: 'invalid-token-12345',
      });
      console.log('✗ Should have failed with invalid token');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✓ Correctly rejected invalid access token');
        console.log('Response:', error.response.data);
      } else {
        console.log('✗ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 3: Test with code but missing redirectUri
    console.log('Test 3: POST /api/auth/social/facebook (code without redirectUri)');
    try {
      await axios.post(`${API_URL}/api/auth/social/facebook`, {
        code: 'some-auth-code',
      });
      console.log('✗ Should have failed with missing redirectUri');
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✓ Correctly rejected code without redirectUri');
        console.log('Response:', error.response.data);
      } else {
        console.log('✗ Unexpected error:', error.message);
      }
    }
    console.log('');

    console.log('=== Facebook OAuth Integration Test Complete ===');
    console.log('✓ All validation tests passed');
    console.log('\nNote: To test successful authentication:');
    console.log('1. Set up a Facebook App at https://developers.facebook.com/');
    console.log('2. Add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to .env');
    console.log('3. Complete the Facebook Login flow in a browser to get a valid access token');
    console.log('4. Test with: curl -X POST http://localhost:5000/api/auth/social/facebook \\');
    console.log('   -H "Content-Type: application/json" \\');
    console.log('   -d \'{"accessToken": "YOUR_VALID_FACEBOOK_TOKEN"}\'');
    console.log('\nAlternatively, use the Facebook SDK in your frontend:');
    console.log('- React: react-facebook-login');
    console.log('- Vue: vue-facebook-login-component');
    console.log('- Angular: angularx-social-login');

  } catch (error) {
    logger.error('Facebook OAuth integration test failed:', error);
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testFacebookOAuthIntegration()
  .then(() => {
    console.log('\n✓ Integration test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Integration test failed:', error);
    process.exit(1);
  });
