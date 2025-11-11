import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('reviews', {
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
        comment: 'JSON object with overall, cleanliness, service, location, value ratings (1-5)',
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sentiment: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON object with score (0-1), classification (positive/neutral/negative), and topics array',
      },
      images: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of Cloudinary image URLs',
      },
      helpful_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      admin_response: {
        type: DataTypes.TEXT,
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
    });

    // Create indexes
    await queryInterface.addIndex('reviews', ['user_id'], {
      name: 'idx_reviews_user_id',
    });

    await queryInterface.addIndex('reviews', ['booking_id'], {
      name: 'idx_reviews_booking_id',
    });

    await queryInterface.addIndex('reviews', ['hotel_id'], {
      name: 'idx_reviews_hotel_id',
    });

    await queryInterface.addIndex('reviews', ['tour_id'], {
      name: 'idx_reviews_tour_id',
    });

    await queryInterface.addIndex('reviews', ['is_verified'], {
      name: 'idx_reviews_is_verified',
    });

    await queryInterface.addIndex('reviews', ['created_at'], {
      name: 'idx_reviews_created_at',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('reviews');
  },
};
