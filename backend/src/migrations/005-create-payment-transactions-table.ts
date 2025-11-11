import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('payment_transactions', {
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
    transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    gateway: {
      type: DataTypes.ENUM('paypal', 'bakong', 'stripe'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.ENUM('USD', 'KHR'),
      allowNull: false,
      defaultValue: 'USD',
    },
    payment_type: {
      type: DataTypes.ENUM('deposit', 'milestone_1', 'milestone_2', 'milestone_3', 'full'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    gateway_response: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Raw response from payment gateway',
    },
    escrow_status: {
      type: DataTypes.ENUM('held', 'released', 'refunded'),
      allowNull: false,
      defaultValue: 'held',
    },
    escrow_release_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    refund_reason: {
      type: DataTypes.TEXT,
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
  await queryInterface.addIndex('payment_transactions', ['booking_id'], {
    name: 'idx_payment_transactions_booking_id',
  });

  await queryInterface.addIndex('payment_transactions', ['status'], {
    name: 'idx_payment_transactions_status',
  });

  await queryInterface.addIndex('payment_transactions', ['gateway'], {
    name: 'idx_payment_transactions_gateway',
  });

  await queryInterface.addIndex('payment_transactions', ['transaction_id'], {
    name: 'idx_payment_transactions_transaction_id',
  });

  await queryInterface.addIndex('payment_transactions', ['escrow_status'], {
    name: 'idx_payment_transactions_escrow_status',
  });

  await queryInterface.addIndex('payment_transactions', ['payment_type'], {
    name: 'idx_payment_transactions_payment_type',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('payment_transactions');
}
