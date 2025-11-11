import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('bookings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    booking_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    hotel_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hotels',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    check_in: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    check_out: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    nights: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    guests: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'JSON object with adults and children counts',
    },
    guest_details: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'JSON object with name, email, phone, special_requests',
    },
    pricing: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'JSON object with room_rate, subtotal, discount, promo_code, student_discount, tax, total',
    },
    payment: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'JSON object with method, type, status, transactions, escrow_status',
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    cancellation: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON object with cancelled_at, reason, refund_amount, refund_status',
    },
    calendar_event_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Google Calendar event ID',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Create indexes
  await queryInterface.addIndex('bookings', ['user_id'], {
    name: 'idx_bookings_user_id',
  });

  await queryInterface.addIndex('bookings', ['hotel_id'], {
    name: 'idx_bookings_hotel_id',
  });

  await queryInterface.addIndex('bookings', ['status'], {
    name: 'idx_bookings_status',
  });

  await queryInterface.addIndex('bookings', ['check_in'], {
    name: 'idx_bookings_check_in',
  });

  await queryInterface.addIndex('bookings', ['booking_number'], {
    name: 'idx_bookings_booking_number',
  });

  await queryInterface.addIndex('bookings', ['room_id'], {
    name: 'idx_bookings_room_id',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('bookings');
}
