import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration to create users table
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_type: {
      type: DataTypes.ENUM('super_admin', 'admin', 'tourist'),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    google_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    facebook_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    language: {
      type: DataTypes.ENUM('en', 'km', 'zh'),
      allowNull: false,
      defaultValue: 'en',
    },
    currency: {
      type: DataTypes.ENUM('USD', 'KHR'),
      allowNull: false,
      defaultValue: 'USD',
    },
    is_student: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    student_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    student_discount_remaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    jwt_refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    last_login: {
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
  await queryInterface.addIndex('users', ['email'], {
    name: 'idx_users_email',
  });

  await queryInterface.addIndex('users', ['user_type'], {
    name: 'idx_users_user_type',
  });

  await queryInterface.addIndex('users', ['student_email'], {
    name: 'idx_users_student_email',
  });

  await queryInterface.addIndex('users', ['google_id'], {
    name: 'idx_users_google_id',
  });

  await queryInterface.addIndex('users', ['facebook_id'], {
    name: 'idx_users_facebook_id',
  });

  await queryInterface.addIndex('users', ['is_active'], {
    name: 'idx_users_is_active',
  });
}

/**
 * Migration to drop users table
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('users');
}
