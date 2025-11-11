import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('guides', {
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
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    specializations: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    certifications: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    status: {
      type: DataTypes.ENUM('available', 'unavailable', 'on_tour'),
      allowNull: false,
      defaultValue: 'available',
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total_tours: {
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
  await queryInterface.addIndex('guides', ['telegram_user_id'], {
    name: 'idx_guides_telegram_user_id',
    unique: true,
  });

  await queryInterface.addIndex('guides', ['status'], {
    name: 'idx_guides_status',
  });

  await queryInterface.addIndex('guides', ['created_by'], {
    name: 'idx_guides_created_by',
  });

  await queryInterface.addIndex('guides', ['average_rating'], {
    name: 'idx_guides_average_rating',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('guides');
}
