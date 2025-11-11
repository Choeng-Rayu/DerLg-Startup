import {
  Model,
  DataTypes,
  Optional,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  ForeignKey,
} from 'sequelize';
import sequelize from '../config/database';
import type User from './User';

/**
 * AI type enum
 */
export enum AIType {
  STREAMING = 'streaming',
  QUICK = 'quick',
  EVENT_BASED = 'event-based',
}

/**
 * Message role enum
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

/**
 * AI message interface
 */
export interface AIMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

/**
 * Context interface
 */
export interface ConversationContext {
  budget?: number;
  destination?: string;
  dates?: {
    start: Date;
    end: Date;
  };
  preferences?: string[];
}

/**
 * Recommendations interface
 */
export interface ConversationRecommendations {
  hotel_ids?: string[];
  tour_ids?: string[];
  event_ids?: string[];
}

/**
 * Conversion interface
 */
export interface ConversationConversion {
  booked: boolean;
  booking_id?: string;
}

/**
 * AIConversation attributes interface
 */
export interface AIConversationAttributes {
  id: string;
  user_id: string;
  session_id: string;
  ai_type: AIType;
  messages: AIMessage[];
  context: ConversationContext;
  recommendations: ConversationRecommendations;
  conversion: ConversationConversion;
  created_at: Date;
  updated_at: Date;
}

/**
 * AIConversation creation attributes
 */
export interface AIConversationCreationAttributes
  extends Optional<
    AIConversationAttributes,
    | 'id'
    | 'messages'
    | 'context'
    | 'recommendations'
    | 'conversion'
    | 'created_at'
    | 'updated_at'
  > {}

/**
 * AIConversation Model
 * Represents AI chat conversations with users
 */
class AIConversation extends Model<
  InferAttributes<AIConversation>,
  InferCreationAttributes<AIConversation>
> {
  // Primary key
  declare id: CreationOptional<string>;

  // Foreign key
  declare user_id: ForeignKey<User['id']>;

  // Session details
  declare session_id: string;
  declare ai_type: AIType;

  // Conversation data
  declare messages: CreationOptional<AIMessage[]>;
  declare context: CreationOptional<ConversationContext>;
  declare recommendations: CreationOptional<ConversationRecommendations>;
  declare conversion: CreationOptional<ConversationConversion>;

  // Timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;

  /**
   * Add a message to the conversation
   */
  async addMessage(role: MessageRole, content: string): Promise<void> {
    const message: AIMessage = {
      role,
      content,
      timestamp: new Date(),
    };
    this.messages.push(message);
    await this.save();
  }

  /**
   * Get message count
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Get user messages count
   */
  getUserMessageCount(): number {
    return this.messages.filter((m) => m.role === MessageRole.USER).length;
  }

  /**
   * Get assistant messages count
   */
  getAssistantMessageCount(): number {
    return this.messages.filter((m) => m.role === MessageRole.ASSISTANT).length;
  }

  /**
   * Get last message
   */
  getLastMessage(): AIMessage | null {
    if (this.messages.length === 0) {
      return null;
    }
    return this.messages[this.messages.length - 1];
  }

  /**
   * Get conversation duration in minutes
   */
  getConversationDuration(): number {
    if (this.messages.length === 0) {
      return 0;
    }
    const firstMessage = this.messages[0];
    const lastMessage = this.messages[this.messages.length - 1];
    const diff =
      new Date(lastMessage.timestamp).getTime() -
      new Date(firstMessage.timestamp).getTime();
    return Math.floor(diff / 60000); // Convert to minutes
  }

  /**
   * Update context
   */
  async updateContext(context: Partial<ConversationContext>): Promise<void> {
    this.context = { ...this.context, ...context };
    await this.save();
  }

  /**
   * Add recommendations
   */
  async addRecommendations(
    recommendations: Partial<ConversationRecommendations>
  ): Promise<void> {
    this.recommendations = { ...this.recommendations, ...recommendations };
    await this.save();
  }

  /**
   * Mark as converted (booking made)
   */
  async markAsConverted(bookingId: string): Promise<void> {
    this.conversion = {
      booked: true,
      booking_id: bookingId,
    };
    await this.save();
  }

  /**
   * Check if conversation resulted in booking
   */
  hasConverted(): boolean {
    return this.conversion.booked === true;
  }

  /**
   * Get total recommendations count
   */
  getTotalRecommendationsCount(): number {
    let count = 0;
    if (this.recommendations.hotel_ids) {
      count += this.recommendations.hotel_ids.length;
    }
    if (this.recommendations.tour_ids) {
      count += this.recommendations.tour_ids.length;
    }
    if (this.recommendations.event_ids) {
      count += this.recommendations.event_ids.length;
    }
    return count;
  }

  /**
   * Get conversation summary
   */
  getSummary(): string {
    const messageCount = this.getMessageCount();
    const duration = this.getConversationDuration();
    const recommendationsCount = this.getTotalRecommendationsCount();
    const converted = this.hasConverted() ? 'Yes' : 'No';

    return `${messageCount} messages, ${duration} minutes, ${recommendationsCount} recommendations, Converted: ${converted}`;
  }
}

/**
 * Initialize AIConversation model
 */
AIConversation.init(
  {
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
      unique: {
        name: 'unique_session_id',
        msg: 'Session ID already exists',
      },
      validate: {
        notEmpty: {
          msg: 'Session ID cannot be empty',
        },
      },
    },
    ai_type: {
      type: DataTypes.ENUM(...Object.values(AIType)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(AIType)],
          msg: 'Invalid AI type',
        },
      },
    },
    messages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    context: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    recommendations: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    conversion: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { booked: false },
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
  },
  {
    sequelize,
    tableName: 'ai_conversations',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_ai_conversations_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_ai_conversations_session',
        fields: ['session_id'],
      },
      {
        name: 'idx_ai_conversations_ai_type',
        fields: ['ai_type'],
      },
      {
        name: 'idx_ai_conversations_created_at',
        fields: ['created_at'],
      },
    ],
    hooks: {
      beforeCreate: async (conversation: AIConversation) => {
        // Ensure session_id is trimmed
        if (conversation.session_id) {
          conversation.session_id = conversation.session_id.trim();
        }

        // Initialize empty arrays/objects if not provided
        if (!conversation.messages) {
          conversation.messages = [];
        }
        if (!conversation.context) {
          conversation.context = {};
        }
        if (!conversation.recommendations) {
          conversation.recommendations = {};
        }
        if (!conversation.conversion) {
          conversation.conversion = { booked: false };
        }
      },
      beforeUpdate: async (conversation: AIConversation) => {
        // Ensure session_id is trimmed if changed
        if (conversation.changed('session_id') && conversation.session_id) {
          conversation.session_id = conversation.session_id.trim();
        }
      },
      beforeSave: async (conversation: AIConversation) => {
        // Validate conversion data
        if (conversation.conversion.booked && !conversation.conversion.booking_id) {
          throw new Error('booking_id is required when booked is true');
        }

        // Validate dates in context if provided
        if (conversation.context.dates) {
          const { start, end } = conversation.context.dates;
          if (start && end && new Date(start) >= new Date(end)) {
            throw new Error('Start date must be before end date');
          }
        }

        // Validate budget is positive if provided
        if (
          conversation.context.budget !== undefined &&
          conversation.context.budget < 0
        ) {
          throw new Error('Budget must be positive');
        }
      },
    },
  }
);

export default AIConversation;
