import {
  Model,
  DataTypes,
  Optional,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import sequelize from '../config/database';

/**
 * Discount type enum
 */
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

/**
 * Applicable to enum
 */
export enum ApplicableTo {
  ALL = 'all',
  HOTELS = 'hotels',
  TOURS = 'tours',
  EVENTS = 'events',
}

/**
 * User type enum for promo codes
 */
export enum PromoUserType {
  ALL = 'all',
  NEW = 'new',
  RETURNING = 'returning',
}

/**
 * PromoCode attributes interface
 */
export interface PromoCodeAttributes {
  id: string;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  min_booking_amount: number;
  max_discount: number | null;
  valid_from: Date;
  valid_until: Date;
  usage_limit: number;
  usage_count: number;
  applicable_to: ApplicableTo;
  applicable_ids: string[];
  user_type: PromoUserType;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * PromoCode creation attributes
 */
export interface PromoCodeCreationAttributes
  extends Optional<
    PromoCodeAttributes,
    | 'id'
    | 'description'
    | 'min_booking_amount'
    | 'max_discount'
    | 'usage_count'
    | 'applicable_ids'
    | 'user_type'
    | 'is_active'
    | 'created_at'
    | 'updated_at'
  > {}

/**
 * PromoCode Model
 * Represents promotional codes for discounts
 */
class PromoCode extends Model<
  InferAttributes<PromoCode>,
  InferCreationAttributes<PromoCode>
> {
  // Primary key
  declare id: CreationOptional<string>;

  // Code information
  declare code: string;
  declare description: CreationOptional<string>;

  // Discount details
  declare discount_type: DiscountType;
  declare discount_value: number;
  declare min_booking_amount: CreationOptional<number>;
  declare max_discount: number | null;

  // Validity period
  declare valid_from: Date;
  declare valid_until: Date;

  // Usage tracking
  declare usage_limit: number;
  declare usage_count: CreationOptional<number>;

  // Applicability
  declare applicable_to: ApplicableTo;
  declare applicable_ids: CreationOptional<string[]>;
  declare user_type: CreationOptional<PromoUserType>;

  // Status
  declare is_active: CreationOptional<boolean>;

  // Creator
  declare created_by: string;

  // Timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  /**
   * Check if promo code is valid
   */
  isValid(): boolean {
    const now = new Date();
    return (
      this.is_active &&
      this.valid_from <= now &&
      this.valid_until >= now &&
      this.usage_count < this.usage_limit
    );
  }

  /**
   * Check if promo code can be applied to a specific item
   */
  canApplyTo(itemType: string, itemId?: string): boolean {
    if (this.applicable_to === ApplicableTo.ALL) {
      return true;
    }

    if (this.applicable_to === itemType) {
      if (this.applicable_ids.length === 0) {
        return true;
      }
      if (itemId && this.applicable_ids.includes(itemId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(bookingAmount: number): number {
    if (bookingAmount < this.min_booking_amount) {
      return 0;
    }

    let discount = 0;

    if (this.discount_type === DiscountType.PERCENTAGE) {
      discount = (bookingAmount * this.discount_value) / 100;
    } else {
      discount = this.discount_value;
    }

    // Apply max discount cap if set
    if (this.max_discount !== null && discount > this.max_discount) {
      discount = this.max_discount;
    }

    return Math.round(discount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Increment usage count
   */
  async incrementUsage(): Promise<void> {
    this.usage_count += 1;
    await this.save();
  }

  /**
   * Check if usage limit reached
   */
  hasReachedLimit(): boolean {
    return this.usage_count >= this.usage_limit;
  }
}

/**
 * Initialize PromoCode model
 */
PromoCode.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_promo_code',
        msg: 'Promo code already exists',
      },
      validate: {
        notEmpty: {
          msg: 'Promo code cannot be empty',
        },
        isUppercase: {
          msg: 'Promo code must be uppercase',
        },
        len: {
          args: [3, 50],
          msg: 'Promo code must be between 3 and 50 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    discount_type: {
      type: DataTypes.ENUM(...Object.values(DiscountType)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(DiscountType)],
          msg: 'Invalid discount type',
        },
      },
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Discount value must be positive',
        },
        isValidPercentage(value: number) {
          if (this.discount_type === DiscountType.PERCENTAGE && value > 100) {
            throw new Error('Percentage discount cannot exceed 100');
          }
        },
      },
    },
    min_booking_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Minimum booking amount must be positive',
        },
      },
    },
    max_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Maximum discount must be positive',
        },
      },
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterValidFrom(value: Date) {
          if (value <= (this as any).valid_from) {
            throw new Error('Valid until must be after valid from date');
          }
        },
      },
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Usage limit must be at least 1',
        },
      },
    },
    usage_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Usage count cannot be negative',
        },
      },
    },
    applicable_to: {
      type: DataTypes.ENUM(...Object.values(ApplicableTo)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(ApplicableTo)],
          msg: 'Invalid applicable to value',
        },
      },
    },
    applicable_ids: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    user_type: {
      type: DataTypes.ENUM(...Object.values(PromoUserType)),
      allowNull: false,
      defaultValue: PromoUserType.ALL,
      validate: {
        isIn: {
          args: [Object.values(PromoUserType)],
          msg: 'Invalid user type',
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
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
    tableName: 'promo_codes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_promo_codes_code',
        fields: ['code'],
      },
      {
        name: 'idx_promo_codes_valid',
        fields: ['valid_from', 'valid_until'],
      },
      {
        name: 'idx_promo_codes_is_active',
        fields: ['is_active'],
      },
      {
        name: 'idx_promo_codes_applicable_to',
        fields: ['applicable_to'],
      },
    ],
    hooks: {
      beforeCreate: async (promoCode: PromoCode) => {
        // Ensure code is uppercase
        if (promoCode.code) {
          promoCode.code = promoCode.code.toUpperCase().trim();
        }
      },
      beforeUpdate: async (promoCode: PromoCode) => {
        // Ensure code is uppercase if changed
        if (promoCode.changed('code') && promoCode.code) {
          promoCode.code = promoCode.code.toUpperCase().trim();
        }
      },
      beforeSave: async (promoCode: PromoCode) => {
        // Validate usage count doesn't exceed limit
        if (promoCode.usage_count > promoCode.usage_limit) {
          throw new Error('Usage count cannot exceed usage limit');
        }

        // Auto-deactivate if expired
        const now = new Date();
        if (promoCode.valid_until < now) {
          promoCode.is_active = false;
        }
      },
    },
  }
);

export default PromoCode;
