import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('hotels', {
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
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    contact: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    star_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total_reviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending_approval', 'active', 'inactive', 'rejected'),
      allowNull: false,
      defaultValue: 'pending_approval',
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
  });

  // Create indexes
  await queryInterface.addIndex('hotels', ['status'], {
    name: 'idx_hotels_status',
  });

  await queryInterface.addIndex('hotels', ['admin_id'], {
    name: 'idx_hotels_admin_id',
  });

  await queryInterface.addIndex('hotels', ['average_rating'], {
    name: 'idx_hotels_average_rating',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('hotels');
}
