import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import sequelize from '../config/database';
import User from './User';

// Guide status enum
export enum GuideStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  ON_TOUR = 'on_tour',
}

/**
 * Guide Model
 * Represents tour guides who can be assigned to tours
 * Guides use Telegram for status management without platform login
 */
class Guide extends Model<
  InferAttributes<Guide>,
  InferCreationAttributes<Guide>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare phone: string;
  declare email: string | null;
  declare telegram_user_id: string;
  declare telegram_username: string;
  declare specializations: string[];
  declare languages: string[];
  declare bio: string | null;
  declare profile_image: string | null;
  declare certifications: CreationOptional<string[]>;
  declare status: CreationOptional<GuideStatus>;
  declare average_rating: CreationOptional<number>;
  declare total_tours: CreationOptional<number>;
  declare created_by: ForeignKey<User['id']>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare last_status_update: Date | null;

  /**
   * Instance method to update status
   */
  async updateStatus(newStatus: GuideStatus): Promise<void> {
    this.status = newStatus;
    this.last_status_update = new Date();
    await this.save();
  }

  /**
   * Instance method to check if guide is available
   */
  isAvailable(): boolean {
    return this.status === GuideStatus.AVAILABLE;
  }

  /**
   * Instance method to get safe object
   */
  toSafeObject() {
    const guide = this.toJSON();
    return guide;
  }
}

Guide.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Guide name is required',
        },
        len: {
          args: [2, 255],
          msg: 'Guide name must be between 2 and 255 characters',
        },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Phone number is required',
        },
        is: {
          args: /^\+?[1-9]\d{1,14}$/,
          msg: 'Must be a valid phone number in E.164 format',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    telegram_user_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'unique_guide_telegram_user_id',
        msg: 'This Telegram user ID is already registered as a guide',
      },
      validate: {
        notEmpty: {
          msg: 'Telegram user ID is required',
        },
      },
    },
    telegram_username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Telegram username is required',
        },
      },
    },
    specializations: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayValidator(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Specializations must be an array');
          }
        },
      },
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayValidator(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Languages must be an array');
          }
          if (value.length === 0) {
            throw new Error('At least one language is required');
          }
        },
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Profile image must be a valid URL',
        },
      },
    },
    certifications: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayValidator(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Certifications must be an array');
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(GuideStatus)),
      allowNull: false,
      defaultValue: GuideStatus.AVAILABLE,
      validate: {
        isIn: {
          args: [Object.values(GuideStatus)],
          msg: 'Invalid guide status',
        },
      },
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: {
          args: [0],
          msg: 'Average rating must be at least 0',
        },
        max: {
          args: [5],
          msg: 'Average rating must be at most 5',
        },
      },
    },
    total_tours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Total tours cannot be negative',
        },
      },
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
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
    last_status_update: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'guides',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_guides_telegram_user_id',
        unique: true,
        fields: ['telegram_user_id'],
      },
      {
        name: 'idx_guides_status',
        fields: ['status'],
      },
      {
        name: 'idx_guides_created_by',
        fields: ['created_by'],
      },
      {
        name: 'idx_guides_average_rating',
        fields: ['average_rating'],
      },
    ],
    hooks: {
      beforeCreate: (guide) => {
        // Normalize telegram username
        if (guide.telegram_username) {
          guide.telegram_username = guide.telegram_username.trim();
          // Remove @ if present
          if (guide.telegram_username.startsWith('@')) {
            guide.telegram_username = guide.telegram_username.substring(1);
          }
        }

        // Normalize email if provided
        if (guide.email) {
          guide.email = guide.email.toLowerCase().trim();
        }
      },
      beforeUpdate: (guide) => {
        // Normalize telegram username if changed
        if (guide.changed('telegram_username') && guide.telegram_username) {
          guide.telegram_username = guide.telegram_username.trim();
          if (guide.telegram_username.startsWith('@')) {
            guide.telegram_username = guide.telegram_username.substring(1);
          }
        }

        // Normalize email if changed
        if (guide.changed('email') && guide.email) {
          guide.email = guide.email.toLowerCase().trim();
        }

        // Update last_status_update when status changes
        if (guide.changed('status')) {
          guide.last_status_update = new Date();
        }
      },
    },
  }
);

export default Guide;
