import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import sequelize from '../config/database';
import Booking from './Booking';

// Payment gateway enum
export enum PaymentGateway {
  PAYPAL = 'paypal',
  BAKONG = 'bakong',
  STRIPE = 'stripe',
}

// Payment type enum
export enum PaymentType {
  DEPOSIT = 'deposit',
  MILESTONE_1 = 'milestone_1',
  MILESTONE_2 = 'milestone_2',
  MILESTONE_3 = 'milestone_3',
  FULL = 'full',
}

// Transaction status enum
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Escrow status enum
export enum EscrowStatus {
  HELD = 'held',
  RELEASED = 'released',
  REFUNDED = 'refunded',
}

// Currency enum
export enum Currency {
  USD = 'USD',
  KHR = 'KHR',
}

class PaymentTransaction extends Model<
  InferAttributes<PaymentTransaction>,
  InferCreationAttributes<PaymentTransaction>
> {
  declare id: CreationOptional<string>;
  declare booking_id: ForeignKey<Booking['id']>;
  declare transaction_id: string;
  declare gateway: PaymentGateway;
  declare amount: number;
  declare currency: Currency;
  declare payment_type: PaymentType;
  declare status: CreationOptional<TransactionStatus>;
  declare gateway_response: any;
  declare escrow_status: CreationOptional<EscrowStatus>;
  declare escrow_release_date: Date | null;
  declare refund_amount: number | null;
  declare refund_reason: string | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Instance method to check if transaction is successful
  isSuccessful(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }

  // Instance method to check if transaction is pending
  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  // Instance method to check if transaction is refunded
  isRefunded(): boolean {
    return this.status === TransactionStatus.REFUNDED;
  }

  // Instance method to check if escrow is held
  isEscrowHeld(): boolean {
    return this.escrow_status === EscrowStatus.HELD;
  }

  // Instance method to check if escrow is released
  isEscrowReleased(): boolean {
    return this.escrow_status === EscrowStatus.RELEASED;
  }

  // Instance method to get safe object (without sensitive gateway response)
  toSafeObject() {
    const transaction = this.toJSON();
    return {
      ...transaction,
      gateway_response: transaction.gateway_response
        ? { status: transaction.gateway_response.status }
        : null,
    };
  }
}

PaymentTransaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      unique: {
        name: 'unique_transaction_id',
        msg: 'Transaction ID already exists',
      },
      validate: {
        notEmpty: {
          msg: 'Transaction ID is required',
        },
      },
    },
    gateway: {
      type: DataTypes.ENUM(...Object.values(PaymentGateway)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(PaymentGateway)],
          msg: 'Invalid payment gateway',
        },
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'Amount must be greater than 0',
        },
      },
    },
    currency: {
      type: DataTypes.ENUM(...Object.values(Currency)),
      allowNull: false,
      defaultValue: Currency.USD,
      validate: {
        isIn: {
          args: [Object.values(Currency)],
          msg: 'Invalid currency',
        },
      },
    },
    payment_type: {
      type: DataTypes.ENUM(...Object.values(PaymentType)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(PaymentType)],
          msg: 'Invalid payment type',
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TransactionStatus)),
      allowNull: false,
      defaultValue: TransactionStatus.PENDING,
      validate: {
        isIn: {
          args: [Object.values(TransactionStatus)],
          msg: 'Invalid transaction status',
        },
      },
    },
    gateway_response: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Raw response from payment gateway',
    },
    escrow_status: {
      type: DataTypes.ENUM(...Object.values(EscrowStatus)),
      allowNull: false,
      defaultValue: EscrowStatus.HELD,
      validate: {
        isIn: {
          args: [Object.values(EscrowStatus)],
          msg: 'Invalid escrow status',
        },
      },
    },
    escrow_release_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Refund amount cannot be negative',
        },
        isLessThanOrEqualToAmount(value: number | null) {
          if (value !== null && value > (this as any).amount) {
            throw new Error('Refund amount cannot exceed transaction amount');
          }
        },
      },
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
  },
  {
    sequelize,
    tableName: 'payment_transactions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_payment_transactions_booking_id',
        fields: ['booking_id'],
      },
      {
        name: 'idx_payment_transactions_status',
        fields: ['status'],
      },
      {
        name: 'idx_payment_transactions_gateway',
        fields: ['gateway'],
      },
      {
        name: 'idx_payment_transactions_transaction_id',
        fields: ['transaction_id'],
      },
      {
        name: 'idx_payment_transactions_escrow_status',
        fields: ['escrow_status'],
      },
      {
        name: 'idx_payment_transactions_payment_type',
        fields: ['payment_type'],
      },
    ],
    hooks: {
      beforeUpdate: (transaction) => {
        // Set escrow release date when status changes to released
        if (
          transaction.changed('escrow_status') &&
          transaction.escrow_status === EscrowStatus.RELEASED &&
          !transaction.escrow_release_date
        ) {
          transaction.escrow_release_date = new Date();
        }

        // Validate refund amount when status changes to refunded
        if (
          transaction.changed('status') &&
          transaction.status === TransactionStatus.REFUNDED
        ) {
          if (!transaction.refund_amount) {
            throw new Error('Refund amount is required when status is refunded');
          }
          if (!transaction.refund_reason) {
            throw new Error('Refund reason is required when status is refunded');
          }
        }
      },
    },
  }
);

export default PaymentTransaction;
