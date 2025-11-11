import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Test script for hotel search and listing endpoints
 */
async function testHotelSearch() {
  console.log('\n=== Testing Hotel Search and Listing Endpoints ===\n');

  try {
    // Test 1: Get all hotels with pagination
    console.log('Test 1: GET /api/hotels (with pagination)');
    const hotelsResponse = await axios.get(`${API_BASE_URL}/hotels`, {
      params: {
        page: 1,
        limit: 5,
      },
    });
    console.log('✓ Status:', hotelsResponse.status);
    console.log('✓ Hotels found:', hotelsResponse.data.data.hotels.length);
    console.log('✓ Pagination:', hotelsResponse.data.data.pagination);
    console.log('');

    // Test 2: Search hotels by destination
    console.log('Test 2: GET /api/hotels/search (by destination)');
    const searchByDestination = await axios.get(`${API_BASE_URL}/hotels/search`, {
      params: {
        destination: 'Phnom Penh',
        page: 1,
        limit: 10,
      },
    });
    console.log('✓ Status:', searchByDestination.status);
    console.log('✓ Hotels found:', searchByDestination.data.data.hotels.length);
    console.log('✓ Filters applied:', searchByDestination.data.data.filters);
    console.log('');

    // Test 3: Search hotels with price range
    console.log('Test 3: GET /api/hotels/search (with price range)');
    const searchByPrice = await axios.get(`${API_BASE_URL}/hotels/search`, {
      params: {
        minPrice: 50,
        maxPrice: 200,
        page: 1,
        limit: 10,
      },
    });
    console.log('✓ Status:', searchByPrice.status);
    console.log('✓ Hotels found:', searchByPrice.data.data.hotels.length);
    console.log('');

    // Test 4: Search hotels with guest capacity
    console.log('Test 4: GET /api/hotels/search (with guest capacity)');
    const searchByGuests = await axios.get(`${API_BASE_URL}/hotels/search`, {
      params: {
        guests: 2,
        page: 1,
        limit: 10,
      },
    });
    console.log('✓ Status:', searchByGuests.status);
    console.log('✓ Hotels found:', searchByGuests.data.data.hotels.length);
    console.log('');

    // Test 5: Search hotels with amenities
    console.log('Test 5: GET /api/hotels/search (with amenities)');
    const searchByAmenities = await axios.get(`${API_BASE_URL}/hotels/search`, {
      params: {
        amenities: ['wifi', 'pool'],
        page: 1,
        limit: 10,
      },
    });
    console.log('✓ Status:', searchByAmenities.status);
    console.log('✓ Hotels found:', searchByAmenities.data.data.hotels.length);
    console.log('');

    // Test 6: Search hotels with star rating
    console.log('Test 6: GET /api/hotels/search (with star rating)');
    const searchByStarRating = await axios.get(`${API_BASE_URL}/hotels/search`, {
      params: {
        starRating: 4,
        page: 1,
        limit: 10,
      },
    });
    console.log('✓ Status:', searchByStarRating.status);
    console.log('✓ Hotels found:', searchByStarRating.data.data.hotels.length);
    console.log('');

    // Test 7: Search hotels with minimum rating
    console.log('Test 7: GET /api/hotels/search (with minimum rating)');
    const searchByMinRating = await axios.get(`${API_BASE_URL}/hotels/search`, {
      params: {
        minRating: 4.0,
        page: 1,
        limit: 10,
      },
    });
    console.log('✓ Status:', searchByMinRating.status);
    console.log('✓ Hotels found:', searchByMinRating.data.data.hotels.length);
    console.log('');

    // Test 8: Search hotels with sorting (price low to high)
    console.log('Test 8: GET /api/hotels/search (sort by price low)');
    const searchSortPriceLow = await axios.get(`${API_BASE_URL}/hotels/search`, {
      params: {
        sortBy: 'price_low',
        page: 1,
        limit: 10,
      },
    });
    console.log('✓ Status:', searchSortPriceLow.status);
    console.log('✓ Hotels found:', searchSortPriceLow.data.data.hotels.length);
    if (searchSortPriceLow.data.data.hotels.length > 0) {
      console.log('✓ First hotel starting price:', searchSortPriceLow.data.data.hotels[0].starting_price);
    }
    console.log('');

    // Test 9: Search hotels with sorting (rating)
    console.log('Test 9: GET /api/hotels/search (sort by rating)');
    const searchSortRating = await axios.get(`${API_BASE_URL}/hotels/search`, {
      params: {
        sortBy: 'rating',
        page: 1,
        limit: 10,
      },
    });
    console.log('✓ Status:', searchSortRating.status);
    console.log('✓ Hotels found:', searchSortRating.data.data.hotels.length);
    if (searchSortRating.data.data.hotels.length > 0) {
      console.log('✓ First hotel rating:', searchSortRating.data.data.hotels[0].average_rating);
    }
    console.log('');

    // Test 10: Combined search with multiple filters
    console.log('Test 10: GET /api/hotels/search (combined filters)');
    const searchCombined = await axios.get(`${API_BASE_URL}/hotels/search`, {
      params: {
        destination: 'Siem Reap',
        guests: 2,
        minPrice: 30,
        maxPrice: 150,
        starRating: 4,
        sortBy: 'rating',
        page: 1,
        limit: 10,
      },
    });
    console.log('✓ Status:', searchCombined.status);
    console.log('✓ Hotels found:', searchCombined.data.data.hotels.length);
    console.log('✓ Filters:', searchCombined.data.data.filters);
    console.log('');

    // Test 11: Get hotel by ID (if we have hotels)
    if (hotelsResponse.data.data.hotels.length > 0) {
      const hotelId = hotelsResponse.data.data.hotels[0].id;
      console.log('Test 11: GET /api/hotels/:id');
      const hotelDetail = await axios.get(`${API_BASE_URL}/hotels/${hotelId}`);
      console.log('✓ Status:', hotelDetail.status);
      console.log('✓ Hotel name:', hotelDetail.data.data.hotel.name);
      console.log('✓ Rooms available:', hotelDetail.data.data.hotel.rooms?.length || 0);
      console.log('');
    }

    // Test 12: Get non-existent hotel
    console.log('Test 12: GET /api/hotels/:id (non-existent)');
    try {
      await axios.get(`${API_BASE_URL}/hotels/00000000-0000-0000-0000-000000000000`);
    } catch (error: any) {
      if (error.response) {
        console.log('✓ Status:', error.response.status);
        console.log('✓ Error message:', error.response.data.error.message);
        console.log('');
      }
    }

    console.log('=== All Hotel Search Tests Completed Successfully ===\n');
  } catch (error: any) {
    console.error('✗ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
testHotelSearch();
