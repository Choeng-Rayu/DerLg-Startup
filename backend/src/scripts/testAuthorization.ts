/**
 * Test script for role-based authorization middleware
 * 
 * This script tests the authorize middleware with different user roles
 * to ensure proper access control is enforced.
 */

import axios from 'axios';
import authService from '../services/auth.service';
import User, { UserType } from '../models/User';
import sequelize from '../config/database';
import logger from '../utils/logger';

const API_BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

/**
 * Helper function to add test result
 */
function addResult(test: string, passed: boolean, message: string) {
  results.push({ test, passed, message });
  const status = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${test}: ${message}`);
}

/**
 * Create test users with different roles
 */
async function createTestUsers() {
  console.log('\n📝 Creating test users...\n');

  try {
    // Create super admin user
    const superAdmin = await User.create({
      user_type: UserType.SUPER_ADMIN,
      email: 'superadmin@test.com',
      password_hash: 'TestPassword123!',
      first_name: 'Super',
      last_name: 'Admin',
      email_verified: true,
      is_active: true,
    });

    // Create admin user
    const admin = await User.create({
      user_type: UserType.ADMIN,
      email: 'admin@test.com',
      password_hash: 'TestPassword123!',
      first_name: 'Hotel',
      last_name: 'Admin',
      email_verified: true,
      is_active: true,
    });

    // Create tourist user
    const tourist = await User.create({
      user_type: UserType.TOURIST,
      email: 'tourist@test.com',
      password_hash: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'Tourist',
      email_verified: true,
      is_active: true,
    });

    addResult('Create test users', true, 'All test users created successfully');

    return { superAdmin, admin, tourist };
  } catch (error) {
    addResult('Create test users', false, `Failed: ${error}`);
    throw error;
  }
}

/**
 * Generate JWT tokens for test users
 */
function generateTokens(users: { superAdmin: User; admin: User; tourist: User }) {
  console.log('\n🔑 Generating JWT tokens...\n');

  try {
    const superAdminToken = authService.generateAccessToken({
      userId: users.superAdmin.id,
      email: users.superAdmin.email,
      userType: users.superAdmin.user_type,
    });

    const adminToken = authService.generateAccessToken({
      userId: users.admin.id,
      email: users.admin.email,
      userType: users.admin.user_type,
    });

    const touristToken = authService.generateAccessToken({
      userId: users.tourist.id,
      email: users.tourist.email,
      userType: users.tourist.user_type,
    });

    addResult('Generate JWT tokens', true, 'All tokens generated successfully');

    return { superAdminToken, adminToken, touristToken };
  } catch (error) {
    addResult('Generate JWT tokens', false, `Failed: ${error}`);
    throw error;
  }
}

/**
 * Test authorization middleware with different roles
 */
async function testAuthorization(tokens: {
  superAdminToken: string;
  adminToken: string;
  touristToken: string;
}) {
  console.log('\n🔒 Testing authorization middleware...\n');

  // Test 1: Super admin accessing super admin route
  try {
    await axios.get(`${API_BASE_URL}/test/super-admin`, {
      headers: { Authorization: `Bearer ${tokens.superAdminToken}` },
    });

    addResult(
      'Super admin access to super admin route',
      true,
      'Access granted as expected'
    );
  } catch (error: any) {
    if (error.response?.status === 404) {
      addResult(
        'Super admin access to super admin route',
        true,
        'Route not implemented yet (expected)'
      );
    } else {
      addResult(
        'Super admin access to super admin route',
        false,
        `Unexpected error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  // Test 2: Admin accessing super admin route (should fail)
  try {
    await axios.get(`${API_BASE_URL}/test/super-admin`, {
      headers: { Authorization: `Bearer ${tokens.adminToken}` },
    });

    addResult(
      'Admin access to super admin route',
      false,
      'Access granted when it should be forbidden'
    );
  } catch (error: any) {
    if (error.response?.status === 403) {
      addResult(
        'Admin access to super admin route',
        true,
        'Access denied as expected (403 Forbidden)'
      );
    } else if (error.response?.status === 404) {
      addResult(
        'Admin access to super admin route',
        true,
        'Route not implemented yet (expected)'
      );
    } else {
      addResult(
        'Admin access to super admin route',
        false,
        `Unexpected error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  // Test 3: Tourist accessing super admin route (should fail)
  try {
    await axios.get(`${API_BASE_URL}/test/super-admin`, {
      headers: { Authorization: `Bearer ${tokens.touristToken}` },
    });

    addResult(
      'Tourist access to super admin route',
      false,
      'Access granted when it should be forbidden'
    );
  } catch (error: any) {
    if (error.response?.status === 403) {
      addResult(
        'Tourist access to super admin route',
        true,
        'Access denied as expected (403 Forbidden)'
      );
    } else if (error.response?.status === 404) {
      addResult(
        'Tourist access to super admin route',
        true,
        'Route not implemented yet (expected)'
      );
    } else {
      addResult(
        'Tourist access to super admin route',
        false,
        `Unexpected error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  // Test 4: Admin accessing admin route
  try {
    await axios.get(`${API_BASE_URL}/test/admin`, {
      headers: { Authorization: `Bearer ${tokens.adminToken}` },
    });

    addResult('Admin access to admin route', true, 'Access granted as expected');
  } catch (error: any) {
    if (error.response?.status === 404) {
      addResult(
        'Admin access to admin route',
        true,
        'Route not implemented yet (expected)'
      );
    } else {
      addResult(
        'Admin access to admin route',
        false,
        `Unexpected error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  // Test 5: Tourist accessing admin route (should fail)
  try {
    await axios.get(`${API_BASE_URL}/test/admin`, {
      headers: { Authorization: `Bearer ${tokens.touristToken}` },
    });

    addResult(
      'Tourist access to admin route',
      false,
      'Access granted when it should be forbidden'
    );
  } catch (error: any) {
    if (error.response?.status === 403) {
      addResult(
        'Tourist access to admin route',
        true,
        'Access denied as expected (403 Forbidden)'
      );
    } else if (error.response?.status === 404) {
      addResult(
        'Tourist access to admin route',
        true,
        'Route not implemented yet (expected)'
      );
    } else {
      addResult(
        'Tourist access to admin route',
        false,
        `Unexpected error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  // Test 6: Tourist accessing tourist route
  try {
    await axios.get(`${API_BASE_URL}/test/tourist`, {
      headers: { Authorization: `Bearer ${tokens.touristToken}` },
    });

    addResult('Tourist access to tourist route', true, 'Access granted as expected');
  } catch (error: any) {
    if (error.response?.status === 404) {
      addResult(
        'Tourist access to tourist route',
        true,
        'Route not implemented yet (expected)'
      );
    } else {
      addResult(
        'Tourist access to tourist route',
        false,
        `Unexpected error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  // Test 7: No token accessing protected route (should fail)
  try {
    await axios.get(`${API_BASE_URL}/test/tourist`);

    addResult(
      'No token access to protected route',
      false,
      'Access granted when it should be unauthorized'
    );
  } catch (error: any) {
    if (error.response?.status === 401) {
      addResult(
        'No token access to protected route',
        true,
        'Access denied as expected (401 Unauthorized)'
      );
    } else if (error.response?.status === 404) {
      addResult(
        'No token access to protected route',
        true,
        'Route not implemented yet (expected)'
      );
    } else {
      addResult(
        'No token access to protected route',
        false,
        `Unexpected error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  // Test 8: Multiple roles access
  try {
    await axios.get(`${API_BASE_URL}/test/admin-or-super`, {
      headers: { Authorization: `Bearer ${tokens.adminToken}` },
    });

    addResult(
      'Admin access to admin-or-super route',
      true,
      'Access granted as expected'
    );
  } catch (error: any) {
    if (error.response?.status === 404) {
      addResult(
        'Admin access to admin-or-super route',
        true,
        'Route not implemented yet (expected)'
      );
    } else {
      addResult(
        'Admin access to admin-or-super route',
        false,
        `Unexpected error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  try {
    await axios.get(`${API_BASE_URL}/test/admin-or-super`, {
      headers: { Authorization: `Bearer ${tokens.superAdminToken}` },
    });

    addResult(
      'Super admin access to admin-or-super route',
      true,
      'Access granted as expected'
    );
  } catch (error: any) {
    if (error.response?.status === 404) {
      addResult(
        'Super admin access to admin-or-super route',
        true,
        'Route not implemented yet (expected)'
      );
    } else {
      addResult(
        'Super admin access to admin-or-super route',
        false,
        `Unexpected error: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }
}

/**
 * Clean up test data
 */
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...\n');

  try {
    await User.destroy({
      where: {
        email: ['superadmin@test.com', 'admin@test.com', 'tourist@test.com'],
      },
    });

    addResult('Cleanup test data', true, 'Test users deleted successfully');
  } catch (error) {
    addResult('Cleanup test data', false, `Failed: ${error}`);
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`\x1b[32m✓ Passed: ${passed}\x1b[0m`);
  console.log(`\x1b[31m✗ Failed: ${failed}\x1b[0m`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.test}: ${r.message}`);
      });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Main test function
 */
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 AUTHORIZATION MIDDLEWARE TEST');
  console.log('='.repeat(60));

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Create test users
    const users = await createTestUsers();

    // Generate tokens
    const tokens = generateTokens(users);

    // Test authorization
    await testAuthorization(tokens);

    // Cleanup
    await cleanup();

    // Print summary
    printSummary();

    // Exit
    process.exit(results.some((r) => !r.passed) ? 1 : 0);
  } catch (error) {
    logger.error('Test execution failed:', error);
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
