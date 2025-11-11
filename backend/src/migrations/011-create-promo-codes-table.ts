import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create promo_codes table
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('promo_codes', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    min_booking_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    max_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usage_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    applicable_to: {
      type: DataTypes.ENUM('all', 'hotels', 'tours', 'events'),
      allowNull: false,
    },
    applicable_ids: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    user_type: {
      type: DataTypes.ENUM('all', 'new', 'returning'),
      allowNull: false,
      defaultValue: 'all',
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
  await queryInterface.addIndex('promo_codes', ['code'], {
    name: 'idx_promo_codes_code',
  });

  await queryInterface.addIndex('promo_codes', ['valid_from', 'valid_until'], {
    name: 'idx_promo_codes_valid',
  });

  await queryInterface.addIndex('promo_codes', ['is_active'], {
    name: 'idx_promo_codes_is_active',
  });

  await queryInterface.addIndex('promo_codes', ['applicable_to'], {
    name: 'idx_promo_codes_applicable_to',
  });

  console.log('✅ promo_codes table created successfully');
}

/**
 * Rollback: Drop promo_codes table
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('promo_codes');
  console.log('✅ promo_codes table dropped successfully');
}
