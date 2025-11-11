import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create messages table
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('messages', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    sender_type: {
      type: DataTypes.ENUM('tourist', 'hotel_admin'),
      allowNull: false,
    },
    recipient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
  await queryInterface.addIndex('messages', ['booking_id'], {
    name: 'idx_messages_booking_id',
  });

  await queryInterface.addIndex('messages', ['sender_id'], {
    name: 'idx_messages_sender_id',
  });

  await queryInterface.addIndex('messages', ['recipient_id', 'is_read'], {
    name: 'idx_messages_recipient',
  });

  await queryInterface.addIndex('messages', ['created_at'], {
    name: 'idx_messages_created_at',
  });

  console.log('✅ messages table created successfully');
}

/**
 * Rollback: Drop messages table
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('messages');
  console.log('✅ messages table dropped successfully');
}
