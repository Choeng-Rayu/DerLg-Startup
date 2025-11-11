import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import logger from '../utils/logger';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const WEBHOOK_URL = `${API_URL}/api/webhook/telegram`;

// Test data
const TEST_GUIDE_TELEGRAM_ID = '123456789';
const TEST_DRIVER_TELEGRAM_ID = '987654321';

/**
 * Test WebSocket connection and real-time updates
 */
async function testWebSocketConnection(): Promise<Socket> {
  console.log('\n=== Testing WebSocket Connection ===\n');

  return new Promise((resolve, reject) => {
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      console.log(`   Socket ID: ${socket.id}`);
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      reject(error);
    });

    socket.on('disconnect', (reason) => {
      console.log(`⚠️  WebSocket disconnected: ${reason}`);
    });

    // Listen for provider status updates
    socket.on('provider:status:update', (data) => {
      console.log('\n📡 Received provider status update:');
      console.log(JSON.stringify(data, null, 2));
    });

    // Listen for booking availability updates
    socket.on('booking:availability:update', (data) => {
      console.log('\n📡 Received booking availability update:');
      console.log(JSON.stringify(data, null, 2));
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!socket.connected) {
        reject(new Error('WebSocket connection timeout'));
      }
    }, 5000);
  });
}

/**
 * Test webhook status update for guide
 */
async function testGuideStatusUpdate(status: string): Promise<void> {
  console.log(`\n=== Testing Guide Status Update (${status}) ===\n`);

  try {
    const response = await axios.post(`${WEBHOOK_URL}/status`, {
      telegram_user_id: TEST_GUIDE_TELEGRAM_ID,
      telegram_username: 'test_guide',
      status: status,
      timestamp: new Date().toISOString(),
    });

    console.log('✅ Guide status update successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Guide status update failed');
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Request failed:', error.message);
    }
  }
}

/**
 * Test webhook status update for driver
 */
async function testDriverStatusUpdate(status: string): Promise<void> {
  console.log(`\n=== Testing Driver Status Update (${status}) ===\n`);

  try {
    const response = await axios.post(`${WEBHOOK_URL}/status`, {
      telegram_user_id: TEST_DRIVER_TELEGRAM_ID,
      telegram_username: 'test_driver',
      status: status,
      timestamp: new Date().toISOString(),
    });

    console.log('✅ Driver status update successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Driver status update failed');
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Request failed:', error.message);
    }
  }
}

/**
 * Test getting provider status
 */
async function testGetProviderStatus(telegramUserId: string): Promise<void> {
  console.log(`\n=== Testing Get Provider Status (${telegramUserId}) ===\n`);

  try {
    const response = await axios.get(`${WEBHOOK_URL}/status/${telegramUserId}`);

    console.log('✅ Get provider status successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Get provider status failed');
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Request failed:', error.message);
    }
  }
}

/**
 * Test invalid status update
 */
async function testInvalidStatusUpdate(): Promise<void> {
  console.log('\n=== Testing Invalid Status Update ===\n');

  try {
    const response = await axios.post(`${WEBHOOK_URL}/status`, {
      telegram_user_id: TEST_GUIDE_TELEGRAM_ID,
      telegram_username: 'test_guide',
      status: 'invalid_status',
      timestamp: new Date().toISOString(),
    });

    console.log('⚠️  Invalid status was accepted (should have been rejected)');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Invalid status correctly rejected');
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

/**
 * Test missing required fields
 */
async function testMissingFields(): Promise<void> {
  console.log('\n=== Testing Missing Required Fields ===\n');

  try {
    const response = await axios.post(`${WEBHOOK_URL}/status`, {
      telegram_username: 'test_guide',
      // Missing telegram_user_id and status
    });

    console.log('⚠️  Request with missing fields was accepted (should have been rejected)');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Missing fields correctly rejected');
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

/**
 * Wait for a specified duration
 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main test function
 */
async function runTests(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Provider Status Management & WebSocket Test Suite       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  let socket: Socket | null = null;

  try {
    // Test 1: WebSocket Connection
    socket = await testWebSocketConnection();
    await wait(1000);

    // Test 2: Guide Status Updates
    await testGuideStatusUpdate('available');
    await wait(2000);

    await testGuideStatusUpdate('unavailable');
    await wait(2000);

    await testGuideStatusUpdate('on_tour');
    await wait(2000);

    // Test 3: Driver Status Updates
    await testDriverStatusUpdate('available');
    await wait(2000);

    await testDriverStatusUpdate('unavailable');
    await wait(2000);

    await testDriverStatusUpdate('on_trip');
    await wait(2000);

    // Test 4: Get Provider Status
    await testGetProviderStatus(TEST_GUIDE_TELEGRAM_ID);
    await wait(1000);

    await testGetProviderStatus(TEST_DRIVER_TELEGRAM_ID);
    await wait(1000);

    // Test 5: Error Cases
    await testInvalidStatusUpdate();
    await wait(1000);

    await testMissingFields();
    await wait(1000);

    // Test 6: Non-existent Provider
    await testGetProviderStatus('999999999');
    await wait(1000);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    All Tests Completed                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  } finally {
    // Cleanup
    if (socket) {
      socket.disconnect();
      console.log('\n🔌 WebSocket disconnected');
    }
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
