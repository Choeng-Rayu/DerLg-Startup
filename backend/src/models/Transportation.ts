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

// Vehicle type enum
export enum VehicleType {
  TUK_TUK = 'tuk_tuk',
  CAR = 'car',
  VAN = 'van',
  BUS = 'bus',
}

// Transportation status enum
export enum TransportationStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  ON_TRIP = 'on_trip',
}

/**
 * Transportation Model
 * Represents transportation providers (drivers and vehicles)
 * Drivers use Telegram for status management without platform login
 */
class Transportation extends Model<
  InferAttributes<Transportation>,
  InferCreationAttributes<Transportation>
> {
  declare id: CreationOptional<string>;
  declare driver_name: string;
  declare phone: string;
  declare telegram_user_id: string;
  declare telegram_username: string;
  declare vehicle_type: VehicleType;
  declare vehicle_model: string;
  declare license_plate: string;
  declare capacity: number;
  declare amenities: CreationOptional<string[]>;
  declare status: CreationOptional<TransportationStatus>;
  declare average_rating: CreationOptional<number>;
  declare total_trips: CreationOptional<number>;
  declare created_by: ForeignKey<User['id']>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare last_status_update: Date | null;

  /**
   * Instance method to update status
   */
  async updateStatus(newStatus: TransportationStatus): Promise<void> {
    this.status = newStatus;
    this.last_status_update = new Date();
    await this.save();
  }

  /**
   * Instance method to check if transportation is available
   */
  isAvailable(): boolean {
    return this.status === TransportationStatus.AVAILABLE;
  }

  /**
   * Instance method to get safe object
   */
  toSafeObject() {
    const transportation = this.toJSON();
    return transportation;
  }
}

Transportation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    driver_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Driver name is required',
        },
        len: {
          args: [2, 255],
          msg: 'Driver name must be between 2 and 255 characters',
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
    telegram_user_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'unique_transportation_telegram_user_id',
        msg: 'This Telegram user ID is already registered as a driver',
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
    vehicle_type: {
      type: DataTypes.ENUM(...Object.values(VehicleType)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(VehicleType)],
          msg: 'Invalid vehicle type',
        },
      },
    },
    vehicle_model: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Vehicle model is required',
        },
      },
    },
    license_plate: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'License plate is required',
        },
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Capacity must be at least 1',
        },
        max: {
          args: [100],
          msg: 'Capacity must be at most 100',
        },
      },
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayValidator(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Amenities must be an array');
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TransportationStatus)),
      allowNull: false,
      defaultValue: TransportationStatus.AVAILABLE,
      validate: {
        isIn: {
          args: [Object.values(TransportationStatus)],
          msg: 'Invalid transportation status',
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
    total_trips: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Total trips cannot be negative',
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
    tableName: 'transportation',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_transportation_telegram_user_id',
        unique: true,
        fields: ['telegram_user_id'],
      },
      {
        name: 'idx_transportation_status',
        fields: ['status'],
      },
      {
        name: 'idx_transportation_vehicle_type',
        fields: ['vehicle_type'],
      },
      {
        name: 'idx_transportation_created_by',
        fields: ['created_by'],
      },
      {
        name: 'idx_transportation_average_rating',
        fields: ['average_rating'],
      },
    ],
    hooks: {
      beforeCreate: (transportation) => {
        // Normalize telegram username
        if (transportation.telegram_username) {
          transportation.telegram_username = transportation.telegram_username.trim();
          // Remove @ if present
          if (transportation.telegram_username.startsWith('@')) {
            transportation.telegram_username = transportation.telegram_username.substring(1);
          }
        }

        // Normalize license plate
        if (transportation.license_plate) {
          transportation.license_plate = transportation.license_plate.toUpperCase().trim();
        }
      },
      beforeUpdate: (transportation) => {
        // Normalize telegram username if changed
        if (transportation.changed('telegram_username') && transportation.telegram_username) {
          transportation.telegram_username = transportation.telegram_username.trim();
          if (transportation.telegram_username.startsWith('@')) {
            transportation.telegram_username = transportation.telegram_username.substring(1);
          }
        }

        // Normalize license plate if changed
        if (transportation.changed('license_plate') && transportation.license_plate) {
          transportation.license_plate = transportation.license_plate.toUpperCase().trim();
        }

        // Update last_status_update when status changes
        if (transportation.changed('status')) {
          transportation.last_status_update = new Date();
        }
      },
    },
  }
);

export default Transportation;
