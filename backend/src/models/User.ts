import {
  Model,
  DataTypes,
  Optional,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database';
import type Guide from './Guide';
import type Transportation from './Transportation';

/**
 * User type enum
 */
export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TOURIST = 'tourist',
}

/**
 * Language enum
 */
export enum Language {
  ENGLISH = 'en',
  KHMER = 'km',
  CHINESE = 'zh',
}

/**
 * Currency enum
 */
export enum Currency {
  USD = 'USD',
  KHR = 'KHR',
}

/**
 * User attributes interface
 */
export interface UserAttributes {
  id: string;
  user_type: UserType;
  email: string;
  phone: string | null;
  password_hash: string | null;
  google_id: string | null;
  facebook_id: string | null;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  language: Language;
  currency: Currency;
  is_student: boolean;
  student_email: string | null;
  student_discount_remaining: number;
  jwt_refresh_token: string | null;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * User creation attributes (optional fields for creation)
 */
export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | 'id'
    | 'phone'
    | 'password_hash'
    | 'google_id'
    | 'facebook_id'
    | 'profile_image'
    | 'language'
    | 'currency'
    | 'is_student'
    | 'student_email'
    | 'student_discount_remaining'
    | 'jwt_refresh_token'
    | 'password_reset_token'
    | 'password_reset_expires'
    | 'email_verified'
    | 'phone_verified'
    | 'is_active'
    | 'last_login'
    | 'created_at'
    | 'updated_at'
  > {}

/**
 * User Model
 * Represents users in the system with different roles (super_admin, admin, tourist)
 */
class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  // Primary key
  declare id: CreationOptional<string>;

  // User type and authentication
  declare user_type: UserType;
  declare email: string;
  declare phone: string | null;
  declare password_hash: string | null;
  declare google_id: string | null;
  declare facebook_id: string | null;

  // Profile information
  declare first_name: string;
  declare last_name: string;
  declare profile_image: string | null;

  // Preferences
  declare language: CreationOptional<Language>;
  declare currency: CreationOptional<Currency>;

  // Student information
  declare is_student: CreationOptional<boolean>;
  declare student_email: string | null;
  declare student_discount_remaining: CreationOptional<number>;

  // Authentication tokens
  declare jwt_refresh_token: string | null;
  declare password_reset_token: string | null;
  declare password_reset_expires: Date | null;

  // Verification and status
  declare email_verified: CreationOptional<boolean>;
  declare phone_verified: CreationOptional<boolean>;
  declare is_active: CreationOptional<boolean>;
  declare last_login: Date | null;

  // Timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Associations
  declare created_guides?: NonAttribute<Guide[]>;
  declare created_transportation?: NonAttribute<Transportation[]>;
  declare wishlists?: NonAttribute<any[]>;
  declare ai_conversations?: NonAttribute<any[]>;
  declare sent_messages?: NonAttribute<any[]>;
  declare received_messages?: NonAttribute<any[]>;
  declare created_promo_codes?: NonAttribute<any[]>;

  /**
   * Instance method to compare password
   */
  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password_hash) {
      return false;
    }
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  /**
   * Instance method to get full name
   */
  getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  /**
   * Instance method to check if user has student discount available
   */
  hasStudentDiscountAvailable(): boolean {
    return this.is_student && this.student_discount_remaining > 0;
  }

  /**
   * Instance method to use student discount
   */
  async useStudentDiscount(): Promise<boolean> {
    if (!this.hasStudentDiscountAvailable()) {
      return false;
    }
    this.student_discount_remaining -= 1;
    await this.save();
    return true;
  }

  /**
   * Instance method to get safe user object (without sensitive data)
   */
  toSafeObject(): Partial<UserAttributes> {
    const {
      password_hash,
      jwt_refresh_token,
      password_reset_token,
      password_reset_expires,
      ...safeUser
    } = this.get({ plain: true });
    return safeUser;
  }
}

/**
 * Initialize User model
 */
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_type: {
      type: DataTypes.ENUM(...Object.values(UserType)),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(UserType)],
          msg: 'Invalid user type',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'unique_email',
        msg: 'Email address already exists',
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
        notEmpty: {
          msg: 'Email cannot be empty',
        },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: {
        name: 'unique_phone',
        msg: 'Phone number already exists',
      },
      validate: {
        is: {
          args: /^\+?[1-9]\d{1,14}$/,
          msg: 'Must be a valid phone number in E.164 format',
        },
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    google_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: {
        name: 'unique_google_id',
        msg: 'Google account already linked',
      },
    },
    facebook_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: {
        name: 'unique_facebook_id',
        msg: 'Facebook account already linked',
      },
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'First name cannot be empty',
        },
        len: {
          args: [1, 100],
          msg: 'First name must be between 1 and 100 characters',
        },
      },
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Last name cannot be empty',
        },
        len: {
          args: [1, 100],
          msg: 'Last name must be between 1 and 100 characters',
        },
      },
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Profile image must be a valid URL',
        },
      },
    },
    language: {
      type: DataTypes.ENUM(...Object.values(Language)),
      allowNull: false,
      defaultValue: Language.ENGLISH,
      validate: {
        isIn: {
          args: [Object.values(Language)],
          msg: 'Invalid language',
        },
      },
    },
    currency: {
      type: DataTypes.ENUM(...Object.values(Currency)),
      allowNull: false,
      defaultValue: Currency.USD,
      validate: {
        isIn: {
          args: [Object.values(Currency)],
          msg: 'Invalid currency',
        },
      },
    },
    is_student: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    student_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid student email address',
        },
        isStudentEmail(value: string | null) {
          if (this.is_student && !value) {
            throw new Error('Student email is required when is_student is true');
          }
        },
      },
    },
    student_discount_remaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      validate: {
        min: {
          args: [0],
          msg: 'Student discount remaining cannot be negative',
        },
      },
    },
    jwt_refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
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
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_users_email',
        fields: ['email'],
      },
      {
        name: 'idx_users_user_type',
        fields: ['user_type'],
      },
      {
        name: 'idx_users_student_email',
        fields: ['student_email'],
      },
      {
        name: 'idx_users_google_id',
        fields: ['google_id'],
      },
      {
        name: 'idx_users_facebook_id',
        fields: ['facebook_id'],
      },
      {
        name: 'idx_users_is_active',
        fields: ['is_active'],
      },
    ],
    hooks: {
      /**
       * Before create hook - hash password if provided
       */
      beforeCreate: async (user: User) => {
        // Hash password if provided
        if (user.password_hash && !user.password_hash.startsWith('$2')) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }

        // Normalize email to lowercase
        if (user.email) {
          user.email = user.email.toLowerCase().trim();
        }

        // Normalize student email to lowercase
        if (user.student_email) {
          user.student_email = user.student_email.toLowerCase().trim();
        }

        // Verify social auth users automatically
        if (user.google_id || user.facebook_id) {
          user.email_verified = true;
        }
      },

      /**
       * Before update hook - hash password if changed
       */
      beforeUpdate: async (user: User) => {
        // Hash password if it was changed and not already hashed
        if (user.changed('password_hash') && user.password_hash) {
          if (!user.password_hash.startsWith('$2')) {
            const salt = await bcrypt.genSalt(10);
            user.password_hash = await bcrypt.hash(user.password_hash, salt);
          }
        }

        // Normalize email if changed
        if (user.changed('email') && user.email) {
          user.email = user.email.toLowerCase().trim();
        }

        // Normalize student email if changed
        if (user.changed('student_email') && user.student_email) {
          user.student_email = user.student_email.toLowerCase().trim();
        }
      },

      /**
       * Before save hook - validate password requirements
       */
      beforeSave: async (user: User) => {
        // Validate that user has at least one authentication method
        if (!user.password_hash && !user.google_id && !user.facebook_id) {
          throw new Error(
            'User must have at least one authentication method (password, Google, or Facebook)'
          );
        }

        // Validate student discount logic
        if (user.is_student && !user.student_email) {
          throw new Error('Student email is required when is_student is true');
        }

        if (!user.is_student && user.student_discount_remaining !== 3) {
          user.student_discount_remaining = 3;
        }
      },
    },
  }
);

export default User;
