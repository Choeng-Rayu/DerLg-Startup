import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Add Database Indexes for Query Optimization
 * Adds indexes to frequently queried columns to improve performance
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  try {
    // Hotel indexes
    await queryInterface.addIndex('hotels', ['status'], {
      name: 'idx_hotels_status',
    });

    await queryInterface.addIndex('hotels', ['admin_id'], {
      name: 'idx_hotels_admin_id',
    });

    await queryInterface.addIndex('hotels', ['average_rating'], {
      name: 'idx_hotels_average_rating',
    });

    await queryInterface.addIndex('hotels', ['star_rating'], {
      name: 'idx_hotels_star_rating',
    });

    await queryInterface.addIndex('hotels', ['created_at'], {
      name: 'idx_hotels_created_at',
    });

    // Room indexes
    await queryInterface.addIndex('rooms', ['hotel_id'], {
      name: 'idx_rooms_hotel_id',
    });

    await queryInterface.addIndex('rooms', ['is_active'], {
      name: 'idx_rooms_is_active',
    });

    await queryInterface.addIndex('rooms', ['capacity'], {
      name: 'idx_rooms_capacity',
    });

    await queryInterface.addIndex('rooms', ['price_per_night'], {
      name: 'idx_rooms_price_per_night',
    });

    // Booking indexes
    await queryInterface.addIndex('bookings', ['user_id'], {
      name: 'idx_bookings_user_id',
    });

    await queryInterface.addIndex('bookings', ['hotel_id'], {
      name: 'idx_bookings_hotel_id',
    });

    await queryInterface.addIndex('bookings', ['room_id'], {
      name: 'idx_bookings_room_id',
    });

    await queryInterface.addIndex('bookings', ['status'], {
      name: 'idx_bookings_status',
    });

    await queryInterface.addIndex('bookings', ['check_in'], {
      name: 'idx_bookings_check_in',
    });

    await queryInterface.addIndex('bookings', ['check_out'], {
      name: 'idx_bookings_check_out',
    });

    await queryInterface.addIndex('bookings', ['created_at'], {
      name: 'idx_bookings_created_at',
    });

    // Composite index for booking searches
    await queryInterface.addIndex('bookings', ['user_id', 'status'], {
      name: 'idx_bookings_user_status',
    });

    await queryInterface.addIndex('bookings', ['hotel_id', 'check_in', 'check_out'], {
      name: 'idx_bookings_hotel_dates',
    });

    // Review indexes
    await queryInterface.addIndex('reviews', ['hotel_id'], {
      name: 'idx_reviews_hotel_id',
    });

    await queryInterface.addIndex('reviews', ['user_id'], {
      name: 'idx_reviews_user_id',
    });

    await queryInterface.addIndex('reviews', ['booking_id'], {
      name: 'idx_reviews_booking_id',
    });

    await queryInterface.addIndex('reviews', ['created_at'], {
      name: 'idx_reviews_created_at',
    });

    // User indexes
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email',
      unique: true,
    });

    await queryInterface.addIndex('users', ['user_type'], {
      name: 'idx_users_user_type',
    });

    await queryInterface.addIndex('users', ['is_active'], {
      name: 'idx_users_is_active',
    });

    // Payment indexes
    await queryInterface.addIndex('payment_transactions', ['booking_id'], {
      name: 'idx_payment_transactions_booking_id',
    });

    await queryInterface.addIndex('payment_transactions', ['status'], {
      name: 'idx_payment_transactions_status',
    });

    await queryInterface.addIndex('payment_transactions', ['gateway'], {
      name: 'idx_payment_transactions_gateway',
    });

    // Tour indexes
    await queryInterface.addIndex('tours', ['destination'], {
      name: 'idx_tours_destination',
    });

    await queryInterface.addIndex('tours', ['guide_id'], {
      name: 'idx_tours_guide_id',
    });

    // Event indexes
    await queryInterface.addIndex('events', ['start_date'], {
      name: 'idx_events_start_date',
    });

    await queryInterface.addIndex('events', ['end_date'], {
      name: 'idx_events_end_date',
    });

    // Message indexes
    await queryInterface.addIndex('messages', ['booking_id'], {
      name: 'idx_messages_booking_id',
    });

    await queryInterface.addIndex('messages', ['sender_id'], {
      name: 'idx_messages_sender_id',
    });

    await queryInterface.addIndex('messages', ['is_read'], {
      name: 'idx_messages_is_read',
    });

    // Wishlist indexes
    await queryInterface.addIndex('wishlists', ['user_id'], {
      name: 'idx_wishlists_user_id',
    });

    await queryInterface.addIndex('wishlists', ['item_type'], {
      name: 'idx_wishlists_item_type',
    });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  try {
    // Drop all indexes
    const indexes = [
      'idx_hotels_status',
      'idx_hotels_admin_id',
      'idx_hotels_average_rating',
      'idx_hotels_star_rating',
      'idx_hotels_created_at',
      'idx_rooms_hotel_id',
      'idx_rooms_is_active',
      'idx_rooms_capacity',
      'idx_rooms_price_per_night',
      'idx_bookings_user_id',
      'idx_bookings_hotel_id',
      'idx_bookings_room_id',
      'idx_bookings_status',
      'idx_bookings_check_in',
      'idx_bookings_check_out',
      'idx_bookings_created_at',
      'idx_bookings_user_status',
      'idx_bookings_hotel_dates',
      'idx_reviews_hotel_id',
      'idx_reviews_user_id',
      'idx_reviews_booking_id',
      'idx_reviews_created_at',
      'idx_users_email',
      'idx_users_user_type',
      'idx_users_is_active',
      'idx_payment_transactions_booking_id',
      'idx_payment_transactions_status',
      'idx_payment_transactions_gateway',
      'idx_tours_destination',
      'idx_tours_guide_id',
      'idx_events_start_date',
      'idx_events_end_date',
      'idx_messages_booking_id',
      'idx_messages_sender_id',
      'idx_messages_is_read',
      'idx_wishlists_user_id',
      'idx_wishlists_item_type',
    ];

    for (const indexName of indexes) {
      try {
        await queryInterface.removeIndex(indexName);
      } catch (error) {
        // Index might not exist, continue
      }
    }

    console.log('Database indexes removed successfully');
  } catch (error) {
    console.error('Error removing indexes:', error);
    throw error;
  }
}

