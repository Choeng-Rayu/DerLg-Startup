import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('rooms', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hotel_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hotels',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    room_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bed_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    size_sqm: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    price_per_night: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
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
    total_rooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  await queryInterface.addIndex('rooms', ['hotel_id'], {
    name: 'idx_rooms_hotel_id',
  });

  await queryInterface.addIndex('rooms', ['price_per_night'], {
    name: 'idx_rooms_price',
  });

  await queryInterface.addIndex('rooms', ['capacity'], {
    name: 'idx_rooms_capacity',
  });

  await queryInterface.addIndex('rooms', ['is_active'], {
    name: 'idx_rooms_is_active',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('rooms');
}
