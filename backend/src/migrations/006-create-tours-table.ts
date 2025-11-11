import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('tours', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      destination: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      duration: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'JSON object with days and nights',
      },
      difficulty: {
        type: DataTypes.ENUM('easy', 'moderate', 'challenging'),
        allowNull: false,
      },
      category: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of category strings (e.g., ["cultural", "adventure"])',
      },
      price_per_person: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      group_size: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'JSON object with min and max group size',
      },
      inclusions: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of included items/services',
      },
      exclusions: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of excluded items/services',
      },
      itinerary: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of day-by-day itinerary objects',
      },
      images: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of Cloudinary image URLs',
      },
      meeting_point: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'JSON object with address, latitude, longitude',
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
      },
      total_bookings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.addIndex('tours', ['destination'], {
      name: 'idx_tours_destination',
    });

    await queryInterface.addIndex('tours', ['difficulty'], {
      name: 'idx_tours_difficulty',
    });

    await queryInterface.addIndex('tours', ['is_active'], {
      name: 'idx_tours_is_active',
    });

    await queryInterface.addIndex('tours', ['average_rating'], {
      name: 'idx_tours_average_rating',
    });

    await queryInterface.addIndex('tours', ['price_per_person'], {
      name: 'idx_tours_price',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('tours');
  },
};
