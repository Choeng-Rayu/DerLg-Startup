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

// Location interface
interface Location {
  address: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
}

// Contact interface
interface Contact {
  phone: string;
  email: string;
  website: string;
}

// Hotel status enum
export enum HotelStatus {
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
}

class Hotel extends Model<
  InferAttributes<Hotel>,
  InferCreationAttributes<Hotel>
> {
  declare id: CreationOptional<string>;
  declare admin_id: ForeignKey<User['id']>;
  declare name: string;
  declare description: string;
  declare location: Location;
  declare contact: Contact;
  declare amenities: string[];
  declare images: string[];
  declare logo: string | null;
  declare star_rating: number;
  declare average_rating: CreationOptional<number>;
  declare total_reviews: CreationOptional<number>;
  declare status: CreationOptional<HotelStatus>;
  declare approval_date: Date | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Instance method to get safe object (without sensitive data)
  toSafeObject() {
    const hotel = this.toJSON();
    return hotel;
  }
}

Hotel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Hotel name is required',
        },
        len: {
          args: [2, 255],
          msg: 'Hotel name must be between 2 and 255 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Hotel description is required',
        },
      },
    },
    location: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidLocation(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Location must be a valid object');
          }
          const required = ['address', 'city', 'province', 'country', 'latitude', 'longitude'];
          for (const field of required) {
            if (!value[field]) {
              throw new Error(`Location.${field} is required`);
            }
          }
          if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
            throw new Error('Latitude and longitude must be numbers');
          }
          if (value.latitude < -90 || value.latitude > 90) {
            throw new Error('Latitude must be between -90 and 90');
          }
          if (value.longitude < -180 || value.longitude > 180) {
            throw new Error('Longitude must be between -180 and 180');
          }
        },
      },
    },
    contact: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidContact(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Contact must be a valid object');
          }
          if (!value.phone || !value.email) {
            throw new Error('Contact phone and email are required');
          }
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.email)) {
            throw new Error('Contact email must be valid');
          }
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
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    star_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      validate: {
        min: {
          args: [1],
          msg: 'Star rating must be at least 1',
        },
        max: {
          args: [5],
          msg: 'Star rating must be at most 5',
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
    total_reviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Total reviews cannot be negative',
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(HotelStatus)),
      allowNull: false,
      defaultValue: HotelStatus.PENDING_APPROVAL,
    },
    approval_date: {
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
    tableName: 'hotels',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_hotels_status',
        fields: ['status'],
      },
      {
        name: 'idx_hotels_admin_id',
        fields: ['admin_id'],
      },
      {
        name: 'idx_hotels_average_rating',
        fields: ['average_rating'],
      },
    ],
    hooks: {
      beforeUpdate: (hotel) => {
        // Update approval_date when status changes to active
        if (hotel.changed('status') && hotel.status === HotelStatus.ACTIVE && !hotel.approval_date) {
          hotel.approval_date = new Date();
        }
      },
    },
  }
);

export default Hotel;
