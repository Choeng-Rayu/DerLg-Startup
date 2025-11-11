import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import sequelize from '../config/database';
import Hotel from './Hotel';

class Room extends Model<
  InferAttributes<Room>,
  InferCreationAttributes<Room>
> {
  declare id: CreationOptional<string>;
  declare hotel_id: ForeignKey<Hotel['id']>;
  declare room_type: string;
  declare description: string;
  declare capacity: number;
  declare bed_type: string;
  declare size_sqm: number | null;
  declare price_per_night: number;
  declare discount_percentage: CreationOptional<number>;
  declare amenities: string[];
  declare images: string[];
  declare total_rooms: number;
  declare is_active: CreationOptional<boolean>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Instance method to calculate discounted price
  getDiscountedPrice(): number {
    if (this.discount_percentage > 0) {
      return this.price_per_night * (1 - this.discount_percentage / 100);
    }
    return this.price_per_night;
  }

  // Instance method to get safe object
  toSafeObject() {
    const room = this.toJSON();
    return {
      ...room,
      discounted_price: this.getDiscountedPrice(),
    };
  }
}

Room.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    room_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Room type is required',
        },
        len: {
          args: [2, 100],
          msg: 'Room type must be between 2 and 100 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Room description is required',
        },
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Room capacity must be at least 1 guest',
        },
        max: {
          args: [20],
          msg: 'Room capacity must be at most 20 guests',
        },
      },
    },
    bed_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Bed type is required',
        },
        isIn: {
          args: [['single', 'double', 'queen', 'king', 'twin', 'bunk']],
          msg: 'Bed type must be one of: single, double, queen, king, twin, bunk',
        },
      },
    },
    size_sqm: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'Room size must be at least 1 square meter',
        },
      },
    },
    price_per_night: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'Price per night must be greater than 0',
        },
      },
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Discount percentage cannot be negative',
        },
        max: {
          args: [100],
          msg: 'Discount percentage cannot exceed 100',
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
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayValidator(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Images must be an array');
          }
        },
      },
    },
    total_rooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'Total rooms must be at least 1',
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'rooms',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_rooms_hotel_id',
        fields: ['hotel_id'],
      },
      {
        name: 'idx_rooms_price',
        fields: ['price_per_night'],
      },
      {
        name: 'idx_rooms_capacity',
        fields: ['capacity'],
      },
      {
        name: 'idx_rooms_is_active',
        fields: ['is_active'],
      },
    ],
  }
);

export default Room;
