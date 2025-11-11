import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create wishlists table
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('wishlists', {
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
    item_type: {
      type: DataTypes.ENUM('hotel', 'tour', 'event'),
      allowNull: false,
    },
    item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    notes: {
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
  await queryInterface.addIndex('wishlists', ['user_id'], {
    name: 'idx_wishlists_user_id',
  });

  await queryInterface.addIndex('wishlists', ['item_type', 'item_id'], {
    name: 'idx_wishlists_item',
  });

  await queryInterface.addIndex(
    'wishlists',
    ['user_id', 'item_type', 'item_id'],
    {
      name: 'idx_wishlists_unique',
      unique: true,
    }
  );

  console.log('✅ wishlists table created successfully');
}

/**
 * Rollback: Drop wishlists table
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('wishlists');
  console.log('✅ wishlists table dropped successfully');
}
