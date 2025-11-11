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
import type User from './User';

/**
 * Item type enum
 */
export enum ItemType {
  HOTEL = 'hotel',
  TOUR = 'tour',
  EVENT = 'event',
}

/**
 * Wishlist attributes interface
 */
export interface WishlistAttributes {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Wishlist creation attributes
 */
export interface WishlistCreationAttributes
  extends Optional<
    WishlistAttributes,
    'id' | 'notes' | 'created_at' | 'updated_at'
  > {}

/**
 * Wishlist Model
 * Represents user's saved hotels, tours, and events
 */
class Wishlist extends Model<
  InferAttributes<Wishlist>,
  InferCreationAttributes<Wishlist>
> {
  // Primary key
  declare id: CreationOptional<string>;

  // Foreign key
  declare user_id: ForeignKey<User['id']>;

  // Item details
  declare item_type: ItemType;
  declare item_id: string;
  declare notes: string | null;

  // Timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;

  /**
   * Check if wishlist item has notes
   */
  hasNotes(): boolean {
    return this.notes !== null && this.notes !== undefined && this.notes.trim().length > 0;
  }

  /**
   * Update notes
   */
  async updateNotes(notes: string): Promise<void> {
    this.notes = notes.trim() || null;
    await this.save();
  }

  /**
   * Get formatted item type
   */
  getFormattedItemType(): string {
    return this.item_type.charAt(0).toUpperCase() + this.item_type.slice(1);
  }

  /**
   * Get time since added
   */
  getTimeSinceAdded(): string {
    const now = new Date();
    const diff = now.getTime() - this.created_at.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return 'Today';
    }
  }
}

/**
 * Initialize Wishlist model
 */
Wishlist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
    item_type: {
      type: DataTypes.ENUM(...Object.values(ItemType)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(ItemType)],
          msg: 'Invalid item type',
        },
      },
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Item ID cannot be empty',
        },
        isUUID: {
          args: 4,
          msg: 'Item ID must be a valid UUID',
        },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Notes must be less than 1000 characters',
        },
      },
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
    tableName: 'wishlists',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_wishlists_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_wishlists_item',
        fields: ['item_type', 'item_id'],
      },
      {
        name: 'idx_wishlists_unique',
        unique: true,
        fields: ['user_id', 'item_type', 'item_id'],
      },
    ],
    hooks: {
      beforeCreate: async (wishlist: Wishlist) => {
        // Trim notes if provided
        if (wishlist.notes) {
          wishlist.notes = wishlist.notes.trim() || null;
        }
      },
      beforeUpdate: async (wishlist: Wishlist) => {
        // Trim notes if changed
        if (wishlist.changed('notes') && wishlist.notes) {
          wishlist.notes = wishlist.notes.trim() || null;
        }
      },
      beforeSave: async (wishlist: Wishlist) => {
        // Validate that item_id is a valid UUID
        const uuidPattern =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(wishlist.item_id)) {
          throw new Error('Item ID must be a valid UUID');
        }
      },
    },
  }
);

export default Wishlist;
