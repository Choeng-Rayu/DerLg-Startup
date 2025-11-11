import axios from 'axios';
import logger from '../utils/logger';

const API_URL = 'http://localhost:5000/api';

/**
 * Test Google OAuth 2.0 Integration
 * 
 * This script tests the Google OAuth authentication endpoint.
 * 
 * Note: To fully test this, you need:
 * 1. Valid Google OAuth credentials in .env file
 * 2. A valid Google ID token or authorization code
 * 
 * For testing purposes, this script demonstrates the API structure.
 */
async function testGoogleOAuth() {
  console.log('=== Testing Google OAuth 2.0 Integration ===\n');

  try {
    // Test 1: Missing credentials
    console.log('Test 1: Testing with missing credentials...');
    try {
      await axios.post(`${API_URL}/auth/social/google`, {});
      console.log('❌ Should have failed with missing credentials');
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected missing credentials');
        console.log('   Error:', error.response.data.error.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n---\n');

    // Test 2: Invalid ID token
    console.log('Test 2: Testing with invalid ID token...');
    try {
      await axios.post(`${API_URL}/auth/social/google`, {
        idToken: 'invalid-token-12345',
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid token');
        console.log('   Error:', error.response.data.error.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n---\n');

    // Test 3: Invalid authorization code
    console.log('Test 3: Testing with invalid authorization code...');
    try {
      await axios.post(`${API_URL}/auth/social/google`, {
        code: 'invalid-code-12345',
      });
      console.log('❌ Should have failed with invalid code');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid authorization code');
        console.log('   Error:', error.response.data.error.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n---\n');

    // Instructions for manual testing
    console.log('📝 Manual Testing Instructions:');
    console.log('');
    console.log('To test with a real Google account:');
    console.log('');
    console.log('1. Set up Google OAuth credentials:');
    console.log('   - Go to https://console.cloud.google.com/');
    console.log('   - Create a new project or select existing');
    console.log('   - Enable Google+ API');
    console.log('   - Create OAuth 2.0 credentials');
    console.log('   - Add authorized redirect URIs');
    console.log('   - Copy Client ID and Client Secret to .env file');
    console.log('');
    console.log('2. Client-side flow (using ID token):');
    console.log('   - Use Google Sign-In button in your frontend');
    console.log('   - Get the ID token from the response');
    console.log('   - Send POST request to /api/auth/social/google with:');
    console.log('     { "idToken": "your-google-id-token" }');
    console.log('');
    console.log('3. Server-side flow (using authorization code):');
    console.log('   - Redirect user to Google OAuth URL');
    console.log('   - Get authorization code from callback');
    console.log('   - Send POST request to /api/auth/social/google with:');
    console.log('     { "code": "your-authorization-code" }');
    console.log('');
    console.log('4. Expected response on success:');
    console.log('   {');
    console.log('     "success": true,');
    console.log('     "data": {');
    console.log('       "user": { ... },');
    console.log('       "accessToken": "...",');
    console.log('       "refreshToken": "...",');
    console.log('       "expiresIn": "24h",');
    console.log('       "isNewUser": true/false');
    console.log('     }');
    console.log('   }');
    console.log('');
    console.log('5. Test scenarios:');
    console.log('   - New user registration via Google');
    console.log('   - Existing user login via Google');
    console.log('   - Linking Google account to existing email');
    console.log('   - Inactive account rejection');

    console.log('\n=== Google OAuth Integration Tests Complete ===');
  } catch (error) {
    logger.error('Test execution error:', error);
    console.error('❌ Test execution failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testGoogleOAuth()
    .then(() => {
      console.log('\n✅ All tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    });
}

export default testGoogleOAuth;
