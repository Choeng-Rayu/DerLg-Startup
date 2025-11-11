# User Model Documentation

## Overview

The User model represents all authenticated users in the DerLg Tourism Platform. It supports three user types: Super Admin, Admin (Hotel Admin), and Tourist, with comprehensive authentication options including email/password, Google OAuth, and Facebook OAuth.

## Table Structure

### Table Name: `users`

### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | UUID | No | UUID v4 | Primary key |
| `user_type` | ENUM | No | - | User role: 'super_admin', 'admin', 'tourist' |
| `email` | VARCHAR(255) | No | - | Unique email address |
| `phone` | VARCHAR(20) | Yes | NULL | Phone number in E.164 format |
| `password_hash` | VARCHAR(255) | Yes | NULL | Bcrypt hashed password |
| `google_id` | VARCHAR(255) | Yes | NULL | Google OAuth ID |
| `facebook_id` | VARCHAR(255) | Yes | NULL | Facebook OAuth ID |
| `first_name` | VARCHAR(100) | No | - | User's first name |
| `last_name` | VARCHAR(100) | No | - | User's last name |
| `profile_image` | VARCHAR(500) | Yes | NULL | Cloudinary URL for profile image |
| `language` | ENUM | No | 'en' | Preferred language: 'en', 'km', 'zh' |
| `currency` | ENUM | No | 'USD' | Preferred currency: 'USD', 'KHR' |
| `is_student` | BOOLEAN | No | false | Student status flag |
| `student_email` | VARCHAR(255) | Yes | NULL | School email for student verification |
| `student_discount_remaining` | INTEGER | No | 3 | Number of student discounts available |
| `jwt_refresh_token` | TEXT | Yes | NULL | Current refresh token |
| `email_verified` | BOOLEAN | No | false | Email verification status |
| `phone_verified` | BOOLEAN | No | false | Phone verification status |
| `is_active` | BOOLEAN | No | true | Account active status |
| `last_login` | DATETIME | Yes | NULL | Last login timestamp |
| `created_at` | DATETIME | No | NOW() | Record creation timestamp |
| `updated_at` | DATETIME | No | NOW() | Record update timestamp |

## Indexes

The following indexes are created for optimal query performance:

1. **idx_users_email** - On `email` field (unique)
2. **idx_users_user_type** - On `user_type` field
3. **idx_users_student_email** - On `student_email` field
4. **idx_users_google_id** - On `google_id` field (unique)
5. **idx_users_facebook_id** - On `facebook_id` field (unique)
6. **idx_users_is_active** - On `is_active` field

## Validations

### Email
- Must be a valid email format
- Cannot be empty
- Automatically converted to lowercase
- Must be unique

### Phone
- Must be in E.164 format (e.g., +1234567890)
- Must be unique if provided

### Password
- Automatically hashed using bcrypt with 10 salt rounds
- Minimum 8 characters (enforced at application level)
- Must contain uppercase, lowercase, and number (enforced at application level)

### User Type
- Must be one of: 'super_admin', 'admin', 'tourist'

### Names
- First name and last name required
- Length between 1 and 100 characters
- Cannot be empty

### Student Fields
- If `is_student` is true, `student_email` is required
- Student email must be valid email format

### Authentication
- User must have at least one authentication method:
  - Password hash, OR
  - Google ID, OR
  - Facebook ID

## Hooks

### Before Create
1. Hash password if provided (using bcrypt with 10 rounds)
2. Normalize email to lowercase
3. Normalize student email to lowercase
4. Auto-verify email for social auth users (Google/Facebook)

### Before Update
1. Hash password if changed and not already hashed
2. Normalize email if changed
3. Normalize student email if changed

### Before Save
1. Validate at least one authentication method exists
2. Validate student email requirement when is_student is true
3. Reset student_discount_remaining to 3 if is_student becomes false

## Instance Methods

### `comparePassword(candidatePassword: string): Promise<boolean>`
Compares a plain text password with the stored hash.

```typescript
const isValid = await user.comparePassword('Password123!');
```

### `getFullName(): string`
Returns the user's full name.

```typescript
const fullName = user.getFullName(); // "John Doe"
```

### `hasStudentDiscountAvailable(): boolean`
Checks if the user has student discounts remaining.

```typescript
if (user.hasStudentDiscountAvailable()) {
  // Apply discount
}
```

### `useStudentDiscount(): Promise<boolean>`
Uses one student discount and decrements the counter.

```typescript
const success = await user.useStudentDiscount();
```

### `toSafeObject(): Partial<UserAttributes>`
Returns user object without sensitive fields (password_hash, jwt_refresh_token).

```typescript
const safeUser = user.toSafeObject();
// Safe to send to client
```

## Usage Examples

### Create a Tourist with Password

```typescript
import User, { UserType } from './models/User';

const tourist = await User.create({
  user_type: UserType.TOURIST,
  email: 'tourist@example.com',
  password_hash: 'Password123!', // Will be hashed automatically
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
});
```

### Create a User with Google OAuth

```typescript
const googleUser = await User.create({
  user_type: UserType.TOURIST,
  email: 'user@gmail.com',
  google_id: 'google_oauth_id_123',
  first_name: 'Jane',
  last_name: 'Smith',
});
// email_verified will be automatically set to true
```

### Create a Student User

```typescript
const student = await User.create({
  user_type: UserType.TOURIST,
  email: 'student@example.com',
  password_hash: 'StudentPass123!',
  first_name: 'Alice',
  last_name: 'Johnson',
  is_student: true,
  student_email: 'alice@university.edu',
});
// student_discount_remaining will be 3 by default
```

### Create an Admin User

```typescript
const admin = await User.create({
  user_type: UserType.ADMIN,
  email: 'admin@hotel.com',
  password_hash: 'AdminPass123!',
  first_name: 'Hotel',
  last_name: 'Manager',
});
```

### Create a Super Admin User

```typescript
const superAdmin = await User.create({
  user_type: UserType.SUPER_ADMIN,
  email: 'superadmin@derlg.com',
  password_hash: 'SuperSecure123!',
  first_name: 'Platform',
  last_name: 'Administrator',
});
```

### Authenticate a User

```typescript
// Find user by email
const user = await User.findOne({
  where: { email: 'tourist@example.com' }
});

if (user && await user.comparePassword('Password123!')) {
  // Authentication successful
  user.last_login = new Date();
  await user.save();
}
```

### Query Users by Type

```typescript
// Get all tourists
const tourists = await User.findAll({
  where: { user_type: UserType.TOURIST }
});

// Get all active admins
const activeAdmins = await User.findAll({
  where: {
    user_type: UserType.ADMIN,
    is_active: true
  }
});
```

### Update User Profile

```typescript
const user = await User.findByPk(userId);
if (user) {
  user.first_name = 'Updated';
  user.profile_image = 'https://cloudinary.com/image.jpg';
  await user.save();
}
```

### Change Password

```typescript
const user = await User.findByPk(userId);
if (user) {
  user.password_hash = 'NewPassword123!'; // Will be hashed automatically
  await user.save();
}
```

### Use Student Discount

```typescript
const user = await User.findByPk(userId);
if (user && user.hasStudentDiscountAvailable()) {
  await user.useStudentDiscount();
  console.log(`Remaining discounts: ${user.student_discount_remaining}`);
}
```

## Security Considerations

1. **Password Hashing**: All passwords are automatically hashed using bcrypt with 10 salt rounds before storage.

2. **Sensitive Data**: Never expose `password_hash` or `jwt_refresh_token` to clients. Use the `toSafeObject()` method.

3. **Email Normalization**: Emails are automatically converted to lowercase to prevent duplicate accounts with different casing.

4. **Social Auth Verification**: Users authenticated via Google or Facebook are automatically marked as email verified.

5. **Unique Constraints**: Email, phone, google_id, and facebook_id have unique constraints to prevent duplicates.

## Testing

Run the User model tests:

```bash
npm run test:user
```

This will:
- Create the users table
- Test all CRUD operations
- Verify password hashing and comparison
- Test validations and constraints
- Verify indexes are created
- Test all instance methods

## Database Synchronization

To sync the User model with the database:

```bash
npm run db:sync
```

This will create or alter the users table to match the model definition.

## Requirements Mapping

This implementation satisfies the following requirements:

- **Requirement 1.1**: User registration with email and password
- **Requirement 32.1**: Multi-role authentication (super_admin, admin, tourist)
- **Requirement 58.1**: User database schema with all required fields
- **Requirement 58.2**: Authentication data storage (email, phone, password_hash, google_id, facebook_id, jwt_refresh_token)

## Related Documentation

- [Database Configuration](./DATABASE.md)
- [Authentication Flow](./AUTHENTICATION.md) (to be created)
- [API Endpoints](./API.md) (to be created)
