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
  city: string;
  province: string;
  venue: string;
  latitude: number;
  longitude: number;
}

// Pricing interface
interface Pricing {
  base_price: number;
  vip_price: number;
}

// Event type enum
export enum EventType {
  FESTIVAL = 'festival',
  CULTURAL = 'cultural',
  SEASONAL = 'seasonal',
}

class Event extends Model<
  InferAttributes<Event>,
  InferCreationAttributes<Event>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: string;
  declare event_type: EventType;
  declare start_date: Date;
  declare end_date: Date;
  declare location: Location;
  declare pricing: Pricing;
  declare capacity: number;
  declare bookings_count: CreationOptional<number>;
  declare images: string[];
  declare cultural_significance: string;
  declare what_to_expect: string;
  declare related_tours: string[];
  declare is_active: CreationOptional<boolean>;
  declare created_by: ForeignKey<User['id']>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Instance method to check if event is upcoming
  isUpcoming(): boolean {
    const now = new Date();
    const startDate = new Date(this.start_date);
    return startDate > now;
  }

  // Instance method to check if event is ongoing
  isOngoing(): boolean {
    const now = new Date();
    const startDate = new Date(this.start_date);
    const endDate = new Date(this.end_date);
    return now >= startDate && now <= endDate;
  }

  // Instance method to check if event is past
  isPast(): boolean {
    const now = new Date();
    const endDate = new Date(this.end_date);
    return endDate < now;
  }

  // Instance method to check if event has available capacity
  hasAvailableCapacity(): boolean {
    return this.bookings_count < this.capacity;
  }

  // Instance method to get available spots
  getAvailableSpots(): number {
    return Math.max(0, this.capacity - this.bookings_count);
  }

  // Instance method to calculate event duration in days
  getDurationInDays(): number {
    const startDate = new Date(this.start_date);
    const endDate = new Date(this.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  }

  // Instance method to get safe object
  toSafeObject() {
    const event = this.toJSON();
    return {
      ...event,
      is_upcoming: this.isUpcoming(),
      is_ongoing: this.isOngoing(),
      is_past: this.isPast(),
      available_spots: this.getAvailableSpots(),
      duration_days: this.getDurationInDays(),
    };
  }
}

Event.init(
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
          msg: 'Event name is required',
        },
        len: {
          args: [2, 255],
          msg: 'Event name must be between 2 and 255 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Event description is required',
        },
      },
    },
    event_type: {
      type: DataTypes.ENUM(...Object.values(EventType)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(EventType)],
          msg: 'Invalid event type',
        },
      },
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isAfterStartDate(value: string) {
          const startDate = (this as any).start_date;
          if (startDate) {
            const start = new Date(startDate);
            const end = new Date(value);
            if (end < start) {
              throw new Error('End date must be after or equal to start date');
            }
          }
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
          const required = ['city', 'province', 'venue', 'latitude', 'longitude'];
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
    pricing: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidPricing(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Pricing must be a valid object');
          }
          if (typeof value.base_price !== 'number' || value.base_price < 0) {
            throw new Error('Base price must be a non-negative number');
          }
          if (typeof value.vip_price !== 'number' || value.vip_price < 0) {
            throw new Error('VIP price must be a non-negative number');
          }
          if (value.vip_price < value.base_price) {
            throw new Error('VIP price must be greater than or equal to base price');
          }
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
      },
    },
    bookings_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Bookings count cannot be negative',
        },
        notExceedCapacity(value: number) {
          if (value > (this as any).capacity) {
            throw new Error('Bookings count cannot exceed capacity');
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
    cultural_significance: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Cultural significance is required',
        },
      },
    },
    what_to_expect: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'What to expect is required',
        },
      },
    },
    related_tours: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayValidator(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Related tours must be an array');
          }
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
      onDelete: 'CASCADE',
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
  },
  {
    sequelize,
    tableName: 'events',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_events_start_date',
        fields: ['start_date'],
      },
      {
        name: 'idx_events_end_date',
        fields: ['end_date'],
      },
      {
        name: 'idx_events_event_type',
        fields: ['event_type'],
      },
      {
        name: 'idx_events_is_active',
        fields: ['is_active'],
      },
      {
        name: 'idx_events_created_by',
        fields: ['created_by'],
      },
    ],
  }
);

export default Event;
