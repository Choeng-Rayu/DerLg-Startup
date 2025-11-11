import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

// Duration interface
interface Duration {
  days: number;
  nights: number;
}

// Day itinerary interface
interface DayItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation: string | null;
}

// Meeting point interface
interface MeetingPoint {
  address: string;
  latitude: number;
  longitude: number;
}

// Group size interface
interface GroupSize {
  min: number;
  max: number;
}

// Tour difficulty enum
export enum TourDifficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  CHALLENGING = 'challenging',
}

class Tour extends Model<
  InferAttributes<Tour>,
  InferCreationAttributes<Tour>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: string;
  declare destination: string;
  declare duration: Duration;
  declare difficulty: TourDifficulty;
  declare category: string[];
  declare price_per_person: number;
  declare group_size: GroupSize;
  declare inclusions: string[];
  declare exclusions: string[];
  declare itinerary: DayItinerary[];
  declare images: string[];
  declare meeting_point: MeetingPoint;
  declare guide_required: boolean;
  declare transportation_required: boolean;
  declare is_active: CreationOptional<boolean>;
  declare average_rating: CreationOptional<number>;
  declare total_bookings: CreationOptional<number>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Instance method to check if tour is available for group size
  isAvailableForGroupSize(groupSize: number): boolean {
    return groupSize >= this.group_size.min && groupSize <= this.group_size.max;
  }

  // Instance method to calculate total price for group
  calculateGroupPrice(numberOfPeople: number): number {
    return this.price_per_person * numberOfPeople;
  }

  // Instance method to get safe object
  toSafeObject() {
    const tour = this.toJSON();
    return tour;
  }
}

Tour.init(
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
          msg: 'Tour name is required',
        },
        len: {
          args: [2, 255],
          msg: 'Tour name must be between 2 and 255 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Tour description is required',
        },
      },
    },
    destination: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Destination is required',
        },
      },
    },
    duration: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidDuration(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Duration must be a valid object');
          }
          if (typeof value.days !== 'number' || value.days < 1) {
            throw new Error('Duration days must be at least 1');
          }
          if (typeof value.nights !== 'number' || value.nights < 0) {
            throw new Error('Duration nights cannot be negative');
          }
        },
      },
    },
    difficulty: {
      type: DataTypes.ENUM(...Object.values(TourDifficulty)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(TourDifficulty)],
          msg: 'Invalid difficulty level',
        },
      },
    },
    category: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayValidator(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Category must be an array');
          }
          if (value.length === 0) {
            throw new Error('At least one category is required');
          }
        },
      },
    },
    price_per_person: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Price per person cannot be negative',
        },
      },
    },
    group_size: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidGroupSize(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Group size must be a valid object');
          }
          if (typeof value.min !== 'number' || value.min < 1) {
            throw new Error('Minimum group size must be at least 1');
          }
          if (typeof value.max !== 'number' || value.max < value.min) {
            throw new Error('Maximum group size must be greater than or equal to minimum');
          }
        },
      },
    },
    inclusions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayValidator(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Inclusions must be an array');
          }
        },
      },
    },
    exclusions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArrayValidator(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Exclusions must be an array');
          }
        },
      },
    },
    itinerary: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidItinerary(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('Itinerary must be an array');
          }
          for (const day of value) {
            if (!day.day || !day.title || !day.description) {
              throw new Error('Each itinerary day must have day, title, and description');
            }
            if (!Array.isArray(day.activities)) {
              throw new Error('Itinerary activities must be an array');
            }
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
    meeting_point: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidMeetingPoint(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Meeting point must be a valid object');
          }
          if (!value.address) {
            throw new Error('Meeting point address is required');
          }
          if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
            throw new Error('Meeting point latitude and longitude must be numbers');
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
    guide_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    transportation_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    total_bookings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Total bookings cannot be negative',
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
    tableName: 'tours',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_tours_destination',
        fields: ['destination'],
      },
      {
        name: 'idx_tours_difficulty',
        fields: ['difficulty'],
      },
      {
        name: 'idx_tours_is_active',
        fields: ['is_active'],
      },
      {
        name: 'idx_tours_average_rating',
        fields: ['average_rating'],
      },
      {
        name: 'idx_tours_price',
        fields: ['price_per_person'],
      },
    ],
  }
);

export default Tour;
