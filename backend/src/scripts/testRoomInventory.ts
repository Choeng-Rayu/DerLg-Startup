import axios from 'axios';
import logger from '../utils/logger';

const API_BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Test Room Inventory Management
 * Tests all room CRUD operations for hotel admins
 */

async function testRoomInventory() {
  console.log('\n=== Testing Room Inventory Management ===\n');

  let adminToken = '';
  let hotelId = '';
  let roomId = '';

  try {
    // Step 1: Login as hotel admin
    console.log('1. Logging in as hotel admin...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@hotel.com',
        password: 'Admin123!',
      });

      if (loginResponse.data.success && loginResponse.data.data.accessToken) {
        adminToken = loginResponse.data.data.accessToken;
        results.push({
          test: 'Hotel Admin Login',
          status: 'PASS',
          message: 'Successfully logged in as hotel admin',
        });
        console.log('✓ Hotel admin logged in successfully\n');
      } else {
        throw new Error('Login failed - no access token received');
      }
    } catch (error: any) {
      results.push({
        test: 'Hotel Admin Login',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      console.log('✗ Hotel admin login failed\n');
      throw error;
    }

    // Step 2: Get hotel profile to verify hotel exists
    console.log('2. Getting hotel profile...');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/hotel/profile`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (profileResponse.data.success && profileResponse.data.data.hotel) {
        hotelId = profileResponse.data.data.hotel.id;
        results.push({
          test: 'Get Hotel Profile',
          status: 'PASS',
          message: `Hotel profile retrieved: ${profileResponse.data.data.hotel.name}`,
          data: { hotelId },
        });
        console.log(`✓ Hotel profile retrieved: ${profileResponse.data.data.hotel.name}\n`);
      } else {
        throw new Error('Failed to get hotel profile');
      }
    } catch (error: any) {
      results.push({
        test: 'Get Hotel Profile',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      console.log('✗ Failed to get hotel profile\n');
      throw error;
    }

    // Step 3: Get all rooms (should be empty or have existing rooms)
    console.log('3. Getting all rooms...');
    try {
      const roomsResponse = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (roomsResponse.data.success) {
        const roomCount = roomsResponse.data.data.rooms.length;
        results.push({
          test: 'Get All Rooms',
          status: 'PASS',
          message: `Retrieved ${roomCount} room(s)`,
          data: { roomCount },
        });
        console.log(`✓ Retrieved ${roomCount} room(s)\n`);
      } else {
        throw new Error('Failed to get rooms');
      }
    } catch (error: any) {
      results.push({
        test: 'Get All Rooms',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      console.log('✗ Failed to get rooms\n');
      throw error;
    }

    // Step 4: Create a new room
    console.log('4. Creating a new room...');
    try {
      const newRoom = {
        room_type: 'Deluxe Suite',
        description: 'Spacious deluxe suite with ocean view and modern amenities',
        capacity: 4,
        bed_type: 'king',
        size_sqm: 45.5,
        price_per_night: 150.00,
        discount_percentage: 10,
        amenities: ['wifi', 'tv', 'minibar', 'balcony', 'ocean_view'],
        images: [],
        total_rooms: 5,
      };

      const createResponse = await axios.post(`${API_BASE_URL}/rooms`, newRoom, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (createResponse.data.success && createResponse.data.data.room) {
        roomId = createResponse.data.data.room.id;
        results.push({
          test: 'Create Room',
          status: 'PASS',
          message: 'Room created successfully',
          data: { roomId, room: createResponse.data.data.room },
        });
        console.log(`✓ Room created successfully: ${roomId}\n`);
      } else {
        throw new Error('Failed to create room');
      }
    } catch (error: any) {
      results.push({
        test: 'Create Room',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      console.log('✗ Failed to create room\n');
      throw error;
    }

    // Step 5: Test validation - invalid capacity
    console.log('5. Testing validation - invalid capacity (should fail)...');
    try {
      await axios.post(
        `${API_BASE_URL}/rooms`,
        {
          room_type: 'Invalid Room',
          description: 'This should fail',
          capacity: 25, // Invalid: exceeds 20
          bed_type: 'king',
          price_per_night: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      results.push({
        test: 'Validation - Invalid Capacity',
        status: 'FAIL',
        message: 'Should have rejected capacity > 20',
      });
      console.log('✗ Validation failed - accepted invalid capacity\n');
    } catch (error: any) {
      if (error.response?.status === 400) {
        results.push({
          test: 'Validation - Invalid Capacity',
          status: 'PASS',
          message: 'Correctly rejected invalid capacity',
        });
        console.log('✓ Correctly rejected invalid capacity\n');
      } else {
        throw error;
      }
    }

    // Step 6: Test validation - invalid price
    console.log('6. Testing validation - invalid price (should fail)...');
    try {
      await axios.post(
        `${API_BASE_URL}/rooms`,
        {
          room_type: 'Invalid Room',
          description: 'This should fail',
          capacity: 2,
          bed_type: 'queen',
          price_per_night: -50, // Invalid: negative price
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      results.push({
        test: 'Validation - Invalid Price',
        status: 'FAIL',
        message: 'Should have rejected negative price',
      });
      console.log('✗ Validation failed - accepted negative price\n');
    } catch (error: any) {
      if (error.response?.status === 400) {
        results.push({
          test: 'Validation - Invalid Price',
          status: 'PASS',
          message: 'Correctly rejected negative price',
        });
        console.log('✓ Correctly rejected negative price\n');
      } else {
        throw error;
      }
    }

    // Step 7: Update the room
    console.log('7. Updating room details...');
    try {
      const updateData = {
        room_type: 'Premium Deluxe Suite',
        price_per_night: 175.00,
        discount_percentage: 15,
        amenities: ['wifi', 'tv', 'minibar', 'balcony', 'ocean_view', 'jacuzzi'],
      };

      const updateResponse = await axios.put(`${API_BASE_URL}/rooms/${roomId}`, updateData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (updateResponse.data.success) {
        results.push({
          test: 'Update Room',
          status: 'PASS',
          message: 'Room updated successfully',
          data: { room: updateResponse.data.data.room },
        });
        console.log('✓ Room updated successfully\n');
      } else {
        throw new Error('Failed to update room');
      }
    } catch (error: any) {
      results.push({
        test: 'Update Room',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      console.log('✗ Failed to update room\n');
      throw error;
    }

    // Step 8: Get all rooms again (should include the new room)
    console.log('8. Getting all rooms after creation...');
    try {
      const roomsResponse = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (roomsResponse.data.success) {
        const roomCount = roomsResponse.data.data.rooms.length;
        const createdRoom = roomsResponse.data.data.rooms.find((r: any) => r.id === roomId);
        
        if (createdRoom) {
          results.push({
            test: 'Get All Rooms After Creation',
            status: 'PASS',
            message: `Retrieved ${roomCount} room(s), including newly created room`,
            data: { roomCount, createdRoom },
          });
          console.log(`✓ Retrieved ${roomCount} room(s), including newly created room\n`);
        } else {
          throw new Error('Created room not found in list');
        }
      } else {
        throw new Error('Failed to get rooms');
      }
    } catch (error: any) {
      results.push({
        test: 'Get All Rooms After Creation',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      console.log('✗ Failed to get rooms after creation\n');
      throw error;
    }

    // Step 9: Delete the room
    console.log('9. Deleting room...');
    try {
      const deleteResponse = await axios.delete(`${API_BASE_URL}/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (deleteResponse.data.success) {
        results.push({
          test: 'Delete Room',
          status: 'PASS',
          message: 'Room deleted successfully',
        });
        console.log('✓ Room deleted successfully\n');
      } else {
        throw new Error('Failed to delete room');
      }
    } catch (error: any) {
      results.push({
        test: 'Delete Room',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      console.log('✗ Failed to delete room\n');
      throw error;
    }

    // Step 10: Verify room is deleted
    console.log('10. Verifying room is deleted...');
    try {
      const roomsResponse = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (roomsResponse.data.success) {
        const deletedRoom = roomsResponse.data.data.rooms.find((r: any) => r.id === roomId);
        
        if (!deletedRoom) {
          results.push({
            test: 'Verify Room Deletion',
            status: 'PASS',
            message: 'Room successfully removed from list',
          });
          console.log('✓ Room successfully removed from list\n');
        } else {
          throw new Error('Deleted room still appears in list');
        }
      } else {
        throw new Error('Failed to get rooms');
      }
    } catch (error: any) {
      results.push({
        test: 'Verify Room Deletion',
        status: 'FAIL',
        message: error.response?.data?.error?.message || error.message,
      });
      console.log('✗ Failed to verify room deletion\n');
      throw error;
    }

    // Step 11: Test unauthorized access (no token)
    console.log('11. Testing unauthorized access (should fail)...');
    try {
      await axios.get(`${API_BASE_URL}/rooms`);

      results.push({
        test: 'Unauthorized Access',
        status: 'FAIL',
        message: 'Should have rejected request without token',
      });
      console.log('✗ Security failed - allowed access without token\n');
    } catch (error: any) {
      if (error.response?.status === 401) {
        results.push({
          test: 'Unauthorized Access',
          status: 'PASS',
          message: 'Correctly rejected request without token',
        });
        console.log('✓ Correctly rejected request without token\n');
      } else {
        throw error;
      }
    }

  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message);
  }

  // Print summary
  console.log('\n=== Test Summary ===\n');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${result.test}: ${result.message}`);
  });

  console.log(`\nTotal: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testRoomInventory().catch((error) => {
  logger.error('Test execution failed:', error);
  process.exit(1);
});
