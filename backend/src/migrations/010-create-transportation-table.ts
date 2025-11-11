import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('transportation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    driver_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    telegram_user_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    telegram_username: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.ENUM('tuk_tuk', 'car', 'van', 'bus'),
      allowNull: false,
    },
    vehicle_model: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    license_plate: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    status: {
      type: DataTypes.ENUM('available', 'unavailable', 'on_trip'),
      allowNull: false,
      defaultValue: 'available',
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total_trips: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
  });

  // Create indexes
  await queryInterface.addIndex('transportation', ['telegram_user_id'], {
    name: 'idx_transportation_telegram_user_id',
    unique: true,
  });

  await queryInterface.addIndex('transportation', ['status'], {
    name: 'idx_transportation_status',
  });

  await queryInterface.addIndex('transportation', ['vehicle_type'], {
    name: 'idx_transportation_vehicle_type',
  });

  await queryInterface.addIndex('transportation', ['created_by'], {
    name: 'idx_transportation_created_by',
  });

  await queryInterface.addIndex('transportation', ['average_rating'], {
    name: 'idx_transportation_average_rating',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('transportation');
}
