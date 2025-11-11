import facebookOAuthService from '../services/facebook-oauth.service';
import logger from '../utils/logger';

/**
 * Test script for Facebook OAuth service
 * 
 * This script tests the Facebook OAuth service methods
 */

async function testFacebookOAuth() {
  console.log('=== Facebook OAuth Service Test ===\n');

  try {
    // Test 1: Generate authorization URL
    console.log('Test 1: Generate Facebook authorization URL');
    const redirectUri = 'http://localhost:3000/auth/facebook/callback';
    const state = 'random-state-string-for-csrf-protection';
    const authUrl = facebookOAuthService.getAuthorizationUrl(redirectUri, state);
    console.log('✓ Authorization URL generated successfully');
    console.log('URL:', authUrl);
    console.log('');

    // Test 2: Verify access token (requires a valid token)
    console.log('Test 2: Verify Facebook access token');
    console.log('⚠ Skipping - requires a valid Facebook access token from client');
    console.log('To test manually:');
    console.log('1. Get a Facebook access token from the Facebook Login flow');
    console.log('2. Call: await facebookOAuthService.verifyAccessToken(token)');
    console.log('');

    // Test 3: Exchange authorization code (requires a valid code)
    console.log('Test 3: Exchange authorization code for access token');
    console.log('⚠ Skipping - requires a valid authorization code from Facebook');
    console.log('To test manually:');
    console.log('1. Complete the Facebook OAuth flow to get an authorization code');
    console.log('2. Call: await facebookOAuthService.getTokenFromCode(code, redirectUri)');
    console.log('');

    console.log('=== Facebook OAuth Service Test Complete ===');
    console.log('✓ All basic tests passed');
    console.log('\nNote: Full integration testing requires:');
    console.log('- Valid Facebook App ID and App Secret in .env');
    console.log('- Completing the Facebook OAuth flow to get tokens/codes');
    console.log('- Testing via the API endpoint: POST /api/auth/social/facebook');

  } catch (error) {
    logger.error('Facebook OAuth test failed:', error);
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testFacebookOAuth()
  .then(() => {
    console.log('\n✓ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  });
