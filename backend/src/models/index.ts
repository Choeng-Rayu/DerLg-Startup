import sequelize from '../config/database';
import User from './User';
import Hotel from './Hotel';
import Room from './Room';
import Booking from './Booking';
import PaymentTransaction from './PaymentTransaction';
import Tour from './Tour';
import Event from './Event';
import Review from './Review';
import Guide from './Guide';
import Transportation from './Transportation';
import PromoCode from './PromoCode';
import Message from './Message';
import Wishlist from './Wishlist';
import AIConversation from './AIConversation';

// Define associations

// User - Hotel associations
User.hasMany(Hotel, {
  foreignKey: 'admin_id',
  as: 'hotels',
});

Hotel.belongsTo(User, {
  foreignKey: 'admin_id',
  as: 'admin',
});

// Hotel - Room associations
Hotel.hasMany(Room, {
  foreignKey: 'hotel_id',
  as: 'rooms',
});

Room.belongsTo(Hotel, {
  foreignKey: 'hotel_id',
  as: 'hotel',
});

// User - Booking associations
User.hasMany(Booking, {
  foreignKey: 'user_id',
  as: 'bookings',
});

Booking.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Hotel - Booking associations
Hotel.hasMany(Booking, {
  foreignKey: 'hotel_id',
  as: 'bookings',
});

Booking.belongsTo(Hotel, {
  foreignKey: 'hotel_id',
  as: 'hotel',
});

// Room - Booking associations
Room.hasMany(Booking, {
  foreignKey: 'room_id',
  as: 'bookings',
});

Booking.belongsTo(Room, {
  foreignKey: 'room_id',
  as: 'room',
});

// Booking - PaymentTransaction associations
Booking.hasMany(PaymentTransaction, {
  foreignKey: 'booking_id',
  as: 'payment_transactions',
});

PaymentTransaction.belongsTo(Booking, {
  foreignKey: 'booking_id',
  as: 'booking',
});

// User - Review associations
User.hasMany(Review, {
  foreignKey: 'user_id',
  as: 'reviews',
});

Review.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Booking - Review associations
Booking.hasOne(Review, {
  foreignKey: 'booking_id',
  as: 'review',
});

Review.belongsTo(Booking, {
  foreignKey: 'booking_id',
  as: 'booking',
});

// Hotel - Review associations
Hotel.hasMany(Review, {
  foreignKey: 'hotel_id',
  as: 'reviews',
});

Review.belongsTo(Hotel, {
  foreignKey: 'hotel_id',
  as: 'hotel',
});

// Tour - Review associations
Tour.hasMany(Review, {
  foreignKey: 'tour_id',
  as: 'reviews',
});

Review.belongsTo(Tour, {
  foreignKey: 'tour_id',
  as: 'tour',
});

// User - Event associations (created_by)
User.hasMany(Event, {
  foreignKey: 'created_by',
  as: 'created_events',
});

Event.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

// User - Guide associations (created_by)
User.hasMany(Guide, {
  foreignKey: 'created_by',
  as: 'created_guides',
});

Guide.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

// User - Transportation associations (created_by)
User.hasMany(Transportation, {
  foreignKey: 'created_by',
  as: 'created_transportation',
});

Transportation.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

// User - PromoCode associations (created_by)
User.hasMany(PromoCode, {
  foreignKey: 'created_by',
  as: 'created_promo_codes',
});

PromoCode.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

// Booking - Message associations
Booking.hasMany(Message, {
  foreignKey: 'booking_id',
  as: 'messages',
});

Message.belongsTo(Booking, {
  foreignKey: 'booking_id',
  as: 'booking',
});

// User - Message associations (sender)
User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'sent_messages',
});

Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender',
});

// User - Message associations (recipient)
User.hasMany(Message, {
  foreignKey: 'recipient_id',
  as: 'received_messages',
});

Message.belongsTo(User, {
  foreignKey: 'recipient_id',
  as: 'recipient',
});

// User - Wishlist associations
User.hasMany(Wishlist, {
  foreignKey: 'user_id',
  as: 'wishlists',
});

Wishlist.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User - AIConversation associations
User.hasMany(AIConversation, {
  foreignKey: 'user_id',
  as: 'ai_conversations',
});

AIConversation.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Export all models
export {
  sequelize,
  User,
  Hotel,
  Room,
  Booking,
  PaymentTransaction,
  Tour,
  Event,
  Review,
  Guide,
  Transportation,
  PromoCode,
  Message,
  Wishlist,
  AIConversation,
};

// Export default sequelize instance
export default sequelize;
