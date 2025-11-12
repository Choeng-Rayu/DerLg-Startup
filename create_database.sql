-- ============================================================================
-- DerLg Startup Database Creation Script
-- This script creates all tables based on the migration files
-- ============================================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS derlg_startup;
USE derlg_startup;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_type ENUM('super_admin', 'admin', 'tourist') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_image VARCHAR(500),
    language ENUM('en', 'km', 'zh') NOT NULL DEFAULT 'en',
    currency ENUM('USD', 'KHR') NOT NULL DEFAULT 'USD',
    is_student BOOLEAN NOT NULL DEFAULT FALSE,
    student_email VARCHAR(255),
    student_discount_remaining INT NOT NULL DEFAULT 3,
    jwt_refresh_token TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login DATETIME,
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_user_type (user_type),
    INDEX idx_users_student_email (student_email),
    INDEX idx_users_google_id (google_id),
    INDEX idx_users_facebook_id (facebook_id),
    INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. HOTELS TABLE
-- ============================================================================
CREATE TABLE hotels (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    admin_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    location JSON NOT NULL,
    contact JSON NOT NULL,
    amenities JSON NOT NULL DEFAULT '[]',
    images JSON NOT NULL DEFAULT '[]',
    logo VARCHAR(500),
    star_rating INT NOT NULL DEFAULT 3,
    average_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.0,
    total_reviews INT NOT NULL DEFAULT 0,
    status ENUM('pending_approval', 'active', 'inactive', 'rejected') NOT NULL DEFAULT 'pending_approval',
    approval_date DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_hotels_status (status),
    INDEX idx_hotels_admin_id (admin_id),
    INDEX idx_hotels_average_rating (average_rating),
    INDEX idx_hotels_star_rating (star_rating),
    INDEX idx_hotels_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. ROOMS TABLE
-- ============================================================================
CREATE TABLE rooms (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    hotel_id CHAR(36) NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    description LONGTEXT NOT NULL,
    capacity INT NOT NULL,
    bed_type VARCHAR(50) NOT NULL,
    size_sqm DECIMAL(6, 2),
    price_per_night DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
    amenities JSON NOT NULL DEFAULT '[]',
    images JSON NOT NULL DEFAULT '[]',
    total_rooms INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_rooms_hotel_id (hotel_id),
    INDEX idx_rooms_price_per_night (price_per_night),
    INDEX idx_rooms_capacity (capacity),
    INDEX idx_rooms_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. BOOKINGS TABLE
-- ============================================================================
CREATE TABLE bookings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_number VARCHAR(50) UNIQUE,
    user_id CHAR(36) NOT NULL,
    hotel_id CHAR(36) NOT NULL,
    room_id CHAR(36) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT NOT NULL,
    guests JSON NOT NULL COMMENT 'JSON object with adults and children counts',
    guest_details JSON NOT NULL COMMENT 'JSON object with name, email, phone, special_requests',
    pricing JSON NOT NULL COMMENT 'JSON object with room_rate, subtotal, discount, promo_code, student_discount, tax, total',
    payment JSON NOT NULL COMMENT 'JSON object with method, type, status, transactions, escrow_status',
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rejected') NOT NULL DEFAULT 'pending',
    cancellation JSON COMMENT 'JSON object with cancelled_at, reason, refund_amount, refund_status',
    calendar_event_id VARCHAR(255) COMMENT 'Google Calendar event ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_bookings_user_id (user_id),
    INDEX idx_bookings_hotel_id (hotel_id),
    INDEX idx_bookings_room_id (room_id),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_check_in (check_in),
    INDEX idx_bookings_check_out (check_out),
    INDEX idx_bookings_created_at (created_at),
    INDEX idx_bookings_user_status (user_id, status),
    INDEX idx_bookings_hotel_dates (hotel_id, check_in, check_out)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. PAYMENT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE payment_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    gateway ENUM('paypal', 'bakong', 'stripe') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency ENUM('USD', 'KHR') NOT NULL DEFAULT 'USD',
    payment_type ENUM('deposit', 'milestone_1', 'milestone_2', 'milestone_3', 'full') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    gateway_response JSON COMMENT 'Raw response from payment gateway',
    escrow_status ENUM('held', 'released', 'refunded') NOT NULL DEFAULT 'held',
    escrow_release_date DATETIME,
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_payment_transactions_booking_id (booking_id),
    INDEX idx_payment_transactions_status (status),
    INDEX idx_payment_transactions_gateway (gateway),
    INDEX idx_payment_transactions_transaction_id (transaction_id),
    INDEX idx_payment_transactions_escrow_status (escrow_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. TOURS TABLE
-- ============================================================================
CREATE TABLE tours (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    destination VARCHAR(255) NOT NULL,
    duration JSON NOT NULL COMMENT 'JSON object with days and nights',
    difficulty ENUM('easy', 'moderate', 'challenging') NOT NULL,
    category JSON NOT NULL COMMENT 'Array of category strings (e.g., ["cultural", "adventure"])',
    price_per_person DECIMAL(10, 2) NOT NULL,
    group_size JSON NOT NULL COMMENT 'JSON object with min and max group size',
    inclusions JSON NOT NULL COMMENT 'Array of included items/services',
    exclusions JSON NOT NULL COMMENT 'Array of excluded items/services',
    itinerary JSON NOT NULL COMMENT 'Array of day-by-day itinerary objects',
    images JSON NOT NULL COMMENT 'Array of Cloudinary image URLs',
    meeting_point JSON NOT NULL COMMENT 'JSON object with address, latitude, longitude',
    guide_required BOOLEAN NOT NULL DEFAULT TRUE,
    transportation_required BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    average_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.0,
    total_bookings INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tours_is_active (is_active),
    INDEX idx_tours_difficulty (difficulty),
    INDEX idx_tours_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. EVENTS TABLE
-- ============================================================================
CREATE TABLE events (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    event_type ENUM('festival', 'cultural', 'seasonal') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location JSON NOT NULL COMMENT 'JSON object with city, province, venue, latitude, longitude',
    pricing JSON NOT NULL COMMENT 'JSON object with base_price and vip_price',
    capacity INT NOT NULL,
    bookings_count INT NOT NULL DEFAULT 0,
    images JSON NOT NULL COMMENT 'Array of Cloudinary image URLs',
    cultural_significance TEXT NOT NULL,
    what_to_expect TEXT NOT NULL,
    related_tours JSON NOT NULL COMMENT 'Array of related tour IDs',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_events_start_date (start_date),
    INDEX idx_events_is_active (is_active),
    INDEX idx_events_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. REVIEWS TABLE
-- ============================================================================
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    booking_id CHAR(36) NOT NULL,
    hotel_id CHAR(36),
    tour_id CHAR(36),
    ratings JSON NOT NULL COMMENT 'JSON object with overall, cleanliness, service, location, value ratings (1-5)',
    comment LONGTEXT NOT NULL,
    sentiment JSON COMMENT 'JSON object with score (0-1), classification (positive/neutral/negative), and topics array',
    images JSON NOT NULL COMMENT 'Array of Cloudinary image URLs',
    helpful_count INT NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    admin_response TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_reviews_user_id (user_id),
    INDEX idx_reviews_booking_id (booking_id),
    INDEX idx_reviews_hotel_id (hotel_id),
    INDEX idx_reviews_tour_id (tour_id),
    INDEX idx_reviews_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. GUIDES TABLE
-- ============================================================================
CREATE TABLE guides (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    telegram_user_id VARCHAR(100) NOT NULL UNIQUE,
    telegram_username VARCHAR(100) NOT NULL,
    specializations JSON NOT NULL DEFAULT '[]',
    languages JSON NOT NULL DEFAULT '[]',
    bio TEXT,
    profile_image VARCHAR(500),
    certifications JSON NOT NULL DEFAULT '[]',
    status ENUM('available', 'unavailable', 'on_tour') NOT NULL DEFAULT 'available',
    average_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.0,
    total_tours INT NOT NULL DEFAULT 0,
    created_by CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_status_update DATETIME,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_guides_telegram_user_id (telegram_user_id),
    INDEX idx_guides_status (status),
    INDEX idx_guides_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. TRANSPORTATION TABLE
-- ============================================================================
CREATE TABLE transportation (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    driver_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    telegram_user_id VARCHAR(100) NOT NULL UNIQUE,
    telegram_username VARCHAR(100) NOT NULL,
    vehicle_type ENUM('tuk_tuk', 'car', 'van', 'bus') NOT NULL,
    vehicle_model VARCHAR(255) NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    amenities JSON NOT NULL DEFAULT '[]',
    status ENUM('available', 'unavailable', 'on_trip') NOT NULL DEFAULT 'available',
    average_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.0,
    total_trips INT NOT NULL DEFAULT 0,
    created_by CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_status_update DATETIME,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_transportation_telegram_user_id (telegram_user_id),
    INDEX idx_transportation_status (status),
    INDEX idx_transportation_vehicle_type (vehicle_type),
    INDEX idx_transportation_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. PROMO CODES TABLE
-- ============================================================================
CREATE TABLE promo_codes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_booking_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_discount DECIMAL(10, 2),
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    usage_limit INT NOT NULL,
    usage_count INT NOT NULL DEFAULT 0,
    applicable_to ENUM('all', 'hotels', 'tours', 'events') NOT NULL,
    applicable_ids JSON NOT NULL DEFAULT '[]',
    user_type ENUM('all', 'new', 'returning') NOT NULL DEFAULT 'all',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_promo_codes_code (code),
    INDEX idx_promo_codes_is_active (is_active),
    INDEX idx_promo_codes_valid_from (valid_from),
    INDEX idx_promo_codes_valid_until (valid_until),
    INDEX idx_promo_codes_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. MESSAGES TABLE
-- ============================================================================
CREATE TABLE messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    sender_type ENUM('tourist', 'hotel_admin') NOT NULL,
    recipient_id CHAR(36) NOT NULL,
    message LONGTEXT NOT NULL,
    attachments JSON NOT NULL DEFAULT '[]',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_messages_booking_id (booking_id),
    INDEX idx_messages_sender_id (sender_id),
    INDEX idx_messages_recipient (recipient_id, is_read),
    INDEX idx_messages_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. WISHLISTS TABLE
-- ============================================================================
CREATE TABLE wishlists (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    item_type ENUM('hotel', 'tour', 'event') NOT NULL,
    item_id CHAR(36) NOT NULL,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_wishlists_user_id (user_id),
    INDEX idx_wishlists_item (item_type, item_id),
    UNIQUE KEY idx_wishlists_unique (user_id, item_type, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. AI CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE ai_conversations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    session_id VARCHAR(100) NOT NULL UNIQUE,
    ai_type ENUM('streaming', 'quick', 'event-based') NOT NULL,
    messages JSON NOT NULL DEFAULT '[]',
    context JSON NOT NULL DEFAULT '{}',
    recommendations JSON NOT NULL DEFAULT '{}',
    conversion JSON NOT NULL DEFAULT '{"booked": false}',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_ai_conversations_user_id (user_id),
    INDEX idx_ai_conversations_session (session_id),
    INDEX idx_ai_conversations_ai_type (ai_type),
    INDEX idx_ai_conversations_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Database Creation Complete
-- ============================================================================
COMMIT;
