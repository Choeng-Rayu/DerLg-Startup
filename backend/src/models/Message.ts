import {
  Model,
  DataTypes,
  Optional,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  ForeignKey,
} from 'sequelize';
import sequelize from '../config/database';
import type Booking from './Booking';
import type User from './User';

/**
 * Sender type enum
 */
export enum SenderType {
  TOURIST = 'tourist',
  HOTEL_ADMIN = 'hotel_admin',
}

/**
 * Message attributes interface
 */
export interface MessageAttributes {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_type: SenderType;
  recipient_id: string;
  message: string;
  attachments: string[];
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Message creation attributes
 */
export interface MessageCreationAttributes
  extends Optional<
    MessageAttributes,
    | 'id'
    | 'attachments'
    | 'is_read'
    | 'read_at'
    | 'created_at'
    | 'updated_at'
  > {}

/**
 * Message Model
 * Represents messages between tourists and hotel admins
 */
class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  // Primary key
  declare id: CreationOptional<string>;

  // Foreign keys
  declare booking_id: ForeignKey<Booking['id']>;
  declare sender_id: ForeignKey<User['id']>;
  declare recipient_id: ForeignKey<User['id']>;

  // Message details
  declare sender_type: SenderType;
  declare message: string;
  declare attachments: CreationOptional<string[]>;

  // Read status
  declare is_read: CreationOptional<boolean>;
  declare read_at: Date | null;

  // Timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Associations
  declare booking?: NonAttribute<Booking>;
  declare sender?: NonAttribute<User>;
  declare recipient?: NonAttribute<User>;

  /**
   * Mark message as read
   */
  async markAsRead(): Promise<void> {
    if (!this.is_read) {
      this.is_read = true;
      this.read_at = new Date();
      await this.save();
    }
  }

  /**
   * Check if message has attachments
   */
  hasAttachments(): boolean {
    return this.attachments.length > 0;
  }

  /**
   * Get time since message was sent
   */
  getTimeSince(): string {
    const now = new Date();
    const diff = now.getTime() - this.created_at.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  /**
   * Get message preview (first 100 characters)
   */
  getPreview(length: number = 100): string {
    if (this.message.length <= length) {
      return this.message;
    }
    return this.message.substring(0, length) + '...';
  }
}

/**
 * Initialize Message model
 */
Message.init(
  {
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
      type: DataTypes.ENUM(...Object.values(SenderType)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(SenderType)],
          msg: 'Invalid sender type',
        },
      },
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
      validate: {
        notEmpty: {
          msg: 'Message cannot be empty',
        },
        len: {
          args: [1, 5000],
          msg: 'Message must be between 1 and 5000 characters',
        },
      },
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
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
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_messages_booking_id',
        fields: ['booking_id'],
      },
      {
        name: 'idx_messages_sender_id',
        fields: ['sender_id'],
      },
      {
        name: 'idx_messages_recipient',
        fields: ['recipient_id', 'is_read'],
      },
      {
        name: 'idx_messages_created_at',
        fields: ['created_at'],
      },
    ],
    hooks: {
      beforeCreate: async (message: Message) => {
        // Trim message content
        if (message.message) {
          message.message = message.message.trim();
        }
      },
      beforeUpdate: async (message: Message) => {
        // Trim message content if changed
        if (message.changed('message') && message.message) {
          message.message = message.message.trim();
        }

        // Set read_at when marking as read
        if (message.changed('is_read') && message.is_read && !message.read_at) {
          message.read_at = new Date();
        }
      },
      beforeSave: async (message: Message) => {
        // Validate sender and recipient are different
        if (message.sender_id === message.recipient_id) {
          throw new Error('Sender and recipient cannot be the same');
        }

        // Validate read_at is set when is_read is true
        if (message.is_read && !message.read_at) {
          message.read_at = new Date();
        }
      },
    },
  }
);

export default Message;
