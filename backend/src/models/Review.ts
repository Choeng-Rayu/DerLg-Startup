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
import Booking from './Booking';
import Hotel from './Hotel';
import Tour from './Tour';

// Ratings interface
interface Ratings {
  overall: number;
  cleanliness: number;
  service: number;
  location: number;
  value: number;
}

// Topic sentiment interface
interface TopicSentiment {
  topic: string;
  sentiment: number;
}

// Sentiment interface
interface Sentiment {
  score: number;
  classification: 'positive' | 'neutral' | 'negative';
  topics: TopicSentiment[];
}

// Sentiment classification enum
export enum SentimentClassification {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
}

class Review extends Model<
  InferAttributes<Review>,
  InferCreationAttributes<Review>
> {
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<User['id']>;
  declare booking_id: ForeignKey<Booking['id']>;
  declare hotel_id: ForeignKey<Hotel['id']> | null;
  declare tour_id: ForeignKey<Tour['id']> | null;
  declare ratings: Ratings;
  declare comment: string;
  declare sentiment: Sentiment | null;
  declare images: string[];
  declare helpful_count: CreationOptional<number>;
  declare is_verified: CreationOptional<boolean>;
  declare admin_response: string | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Instance method to calculate average rating
  getAverageRating(): number {
    const { overall, cleanliness, service, location, value } = this.ratings;
    return (overall + cleanliness + service + location + value) / 5;
  }

  // Instance method to check if review is positive
  isPositive(): boolean {
    return this.sentiment?.classification === SentimentClassification.POSITIVE;
  }

  // Instance method to check if review is negative
  isNegative(): boolean {
    return this.sentiment?.classification === SentimentClassification.NEGATIVE;
  }

  // Instance method to check if review needs attention (extremely negative)
  needsAttention(): boolean {
    return this.sentiment !== null && this.sentiment.score < 0.3;
  }

  // Instance method to increment helpful count
  async markAsHelpful(): Promise<void> {
    this.helpful_count += 1;
    await this.save();
  }

  // Instance method to get safe object
  toSafeObject() {
    const review = this.toJSON();
    return {
      ...review,
      average_rating: this.getAverageRating(),
      is_positive: this.isPositive(),
      is_negative: this.isNegative(),
      needs_attention: this.needsAttention(),
    };
  }
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    hotel_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'hotels',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    tour_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tours',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    ratings: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidRatings(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Ratings must be a valid object');
          }
          const required = ['overall', 'cleanliness', 'service', 'location', 'value'];
          for (const field of required) {
            if (typeof value[field] !== 'number') {
              throw new Error(`Ratings.${field} must be a number`);
            }
            if (value[field] < 1 || value[field] > 5) {
              throw new Error(`Ratings.${field} must be between 1 and 5`);
            }
          }
        },
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Review comment is required',
        },
        len: {
          args: [10, 5000],
          msg: 'Review comment must be between 10 and 5000 characters',
        },
      },
    },
    sentiment: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidSentiment(value: any) {
          if (value !== null && value !== undefined) {
            if (typeof value !== 'object') {
              throw new Error('Sentiment must be a valid object or null');
            }
            if (typeof value.score !== 'number' || value.score < 0 || value.score > 1) {
              throw new Error('Sentiment score must be a number between 0 and 1');
            }
            if (!['positive', 'neutral', 'negative'].includes(value.classification)) {
              throw new Error('Sentiment classification must be positive, neutral, or negative');
            }
            if (!Array.isArray(value.topics)) {
              throw new Error('Sentiment topics must be an array');
            }
            for (const topic of value.topics) {
              if (!topic.topic || typeof topic.sentiment !== 'number') {
                throw new Error('Each sentiment topic must have topic and sentiment fields');
              }
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
    helpful_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Helpful count cannot be negative',
        },
      },
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    admin_response: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'Admin response must be at most 2000 characters',
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
    tableName: 'reviews',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_reviews_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_reviews_booking_id',
        fields: ['booking_id'],
      },
      {
        name: 'idx_reviews_hotel_id',
        fields: ['hotel_id'],
      },
      {
        name: 'idx_reviews_tour_id',
        fields: ['tour_id'],
      },
      {
        name: 'idx_reviews_is_verified',
        fields: ['is_verified'],
      },
      {
        name: 'idx_reviews_created_at',
        fields: ['created_at'],
      },
    ],
    hooks: {
      beforeSave: (review) => {
        // Ensure at least one of hotel_id or tour_id is provided
        if (!review.hotel_id && !review.tour_id) {
          throw new Error('Review must be associated with either a hotel or a tour');
        }
      },
    },
  }
);

export default Review;
