import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Add password reset fields to users table
 * Adds password_reset_token and password_reset_expires columns
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('users', 'password_reset_token', {
    type: DataTypes.STRING(255),
    allowNull: true,
    after: 'jwt_refresh_token',
  });

  await queryInterface.addColumn('users', 'password_reset_expires', {
    type: DataTypes.DATE,
    allowNull: true,
    after: 'password_reset_token',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('users', 'password_reset_expires');
  await queryInterface.removeColumn('users', 'password_reset_token');
}
