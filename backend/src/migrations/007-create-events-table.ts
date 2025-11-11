import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('events', {
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
      event_type: {
        type: DataTypes.ENUM('festival', 'cultural', 'seasonal'),
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      location: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'JSON object with city, province, venue, latitude, longitude',
      },
      pricing: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'JSON object with base_price and vip_price',
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookings_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      images: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of Cloudinary image URLs',
      },
      cultural_significance: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      what_to_expect: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      related_tours: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of related tour IDs',
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
    });

    // Create indexes
    await queryInterface.addIndex('events', ['start_date'], {
      name: 'idx_events_start_date',
    });

    await queryInterface.addIndex('events', ['end_date'], {
      name: 'idx_events_end_date',
    });

    await queryInterface.addIndex('events', ['event_type'], {
      name: 'idx_events_event_type',
    });

    await queryInterface.addIndex('events', ['is_active'], {
      name: 'idx_events_is_active',
    });

    await queryInterface.addIndex('events', ['created_by'], {
      name: 'idx_events_created_by',
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('events');
  },
};
