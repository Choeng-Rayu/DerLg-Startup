import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create ai_conversations table
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('ai_conversations', {
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
    session_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    ai_type: {
      type: DataTypes.ENUM('streaming', 'quick', 'event-based'),
      allowNull: false,
    },
    messages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '[]',
    },
    context: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '{}',
    },
    recommendations: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '{}',
    },
    conversion: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: '{"booked": false}',
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
  await queryInterface.addIndex('ai_conversations', ['user_id'], {
    name: 'idx_ai_conversations_user_id',
  });

  await queryInterface.addIndex('ai_conversations', ['session_id'], {
    name: 'idx_ai_conversations_session',
  });

  await queryInterface.addIndex('ai_conversations', ['ai_type'], {
    name: 'idx_ai_conversations_ai_type',
  });

  await queryInterface.addIndex('ai_conversations', ['created_at'], {
    name: 'idx_ai_conversations_created_at',
  });

  console.log('✅ ai_conversations table created successfully');
}

/**
 * Rollback: Drop ai_conversations table
 */
export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('ai_conversations');
  console.log('✅ ai_conversations table dropped successfully');
}
