# DerLg Tourism Platform - API Documentation

**Base URL:** `http://localhost:5000/api` (development)  
**Production URL:** `https://api.derlg.com/api`  
**Version:** 1.0  
**Last Updated:** October 23, 2025

## Overview

This document provides complete API documentation for integrating with the DerLg Tourism Platform backend.

## Authentication

All authenticated endpoints require a valid JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Management

- **Access Token:** Valid for 24 hours
- **Refresh Token:** Valid for 30 days
- **Storage:** Store refresh token securely (HTTP-only cookie recommended for web)

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... },
    "timestamp": "2025-10-23T10:30:00.000Z"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_1001` | Invalid credentials |
| `AUTH_1002` | Email already exists |
| `AUTH_1003` | Invalid or expired token |
| `AUTH_1004` | Unauthorized access |
| `AUTH_1005` | Google OAuth failed |
| `VAL_2001` | Validation error |
| `VAL_2002` | Missing required field |
| `SYS_9001` | Internal server error |
| `SYS_9002` | Rate limit exceeded |

## Endpoints

### Health Check

#### GET /health

Check API status.

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "DerLg Tourism Platform API is running",
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

---

## Authentication Endpoints

### Register User

#### POST /auth/register

Create a new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "language": "en",
  "currency": "USD",
  "is_student": false
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `password`: Minimum 8 characters, at least one uppercase, one lowercase, one number
- `first_name`: 1-100 characters
- `last_name`: 1-100 characters
- `phone`: Optional, E.164 format (+1234567890)
- `language`: "en", "km", or "zh"
- `currency`: "USD" or "KHR"
- `is_student`: Boolean

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "tourist",
      "language": "en",
      "currency": "USD",
      "is_student": false,
      "email_verified": false,
      "created_at": "2025-10-23T10:30:00.000Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 86400
    }
  },
  "message": "User registered successfully",
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Email already exists

---

### Login

#### POST /auth/login

Authenticate user with email and password.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "tourist",
      "profile_image": "https://cloudinary.com/image.jpg",
      "language": "en",
      "currency": "USD"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 86400
    }
  },
  "message": "Login successful",
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Invalid credentials
- `403` - Account inactive

---

### Google OAuth

#### POST /auth/social/google

Authenticate user with Google OAuth 2.0.

**Authentication:** Not required

**Request Body:**
```json
{
  "code": "google_authorization_code",
  "redirect_uri": "http://localhost:3000/auth/callback"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "tourist",
      "google_id": "google_user_id",
      "profile_image": "https://lh3.googleusercontent.com/...",
      "email_verified": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 86400
    },
    "is_new_user": false
  },
  "message": "Google authentication successful",
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

**Error Responses:**
- `400` - Invalid authorization code
- `500` - Google OAuth failed

---

### Refresh Token

#### POST /auth/refresh-token

Get a new access token using refresh token.

**Authentication:** Not required (uses refresh token)

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  },
  "message": "Token refreshed successfully",
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token

---

### Logout

#### POST /auth/logout

Logout user and invalidate refresh token.

**Authentication:** Required

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful",
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

---

### Verify Token

#### GET /auth/verify

Verify if access token is valid.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user_id": "uuid",
    "email": "user@example.com",
    "user_type": "tourist"
  },
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Invalid or expired token

---

### Get Current User

#### GET /auth/me

Get authenticated user's profile.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "tourist",
    "phone": "+1234567890",
    "profile_image": "https://cloudinary.com/image.jpg",
    "language": "en",
    "currency": "USD",
    "is_student": false,
    "student_discount_remaining": 3,
    "email_verified": true,
    "phone_verified": false,
    "is_active": true,
    "last_login": "2025-10-23T10:00:00.000Z",
    "created_at": "2025-10-01T10:00:00.000Z"
  },
  "timestamp": "2025-10-23T10:30:00.000Z"
}
```

---

## Data Models

### User

```typescript
interface User {
  id: string                    // UUID
  user_type: 'super_admin' | 'admin' | 'tourist'
  email: string
  phone?: string
  first_name: string
  last_name: string
  profile_image?: string        // Cloudinary URL
  language: 'en' | 'km' | 'zh'
  currency: 'USD' | 'KHR'
  is_student: boolean
  student_email?: string
  student_discount_remaining: number
  email_verified: boolean
  phone_verified: boolean
  is_active: boolean
  last_login?: string           // ISO 8601 date
  created_at: string            // ISO 8601 date
  updated_at: string            // ISO 8601 date
}
```

### JWT Payload

```typescript
interface JWTPayload {
  userId: string
  email: string
  userType: 'super_admin' | 'admin' | 'tourist'
  iat: number                   // Issued at (Unix timestamp)
  exp: number                   // Expiration (Unix timestamp)
}
```

---

## Integration Examples

### Frontend (React/Next.js)

#### API Client Setup

```typescript
// src/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private accessToken: string | null = null

  setAccessToken(token: string) {
    this.accessToken = token
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!data.success) {
      throw new ApiError(data.error)
    }

    return data.data
  }

  // Authentication methods
  async register(userData: RegisterData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async googleLogin(code: string, redirectUri: string) {
    return this.request('/auth/social/google', {
      method: 'POST',
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  async logout(refreshToken: string) {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me')
  }
}

export const apiClient = new ApiClient()
```

#### Authentication Context

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '@/services/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  googleLogin: (code: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from stored token
    const token = localStorage.getItem('access_token')
    if (token) {
      apiClient.setAccessToken(token)
      loadUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const userData = await apiClient.getCurrentUser()
      setUser(userData)
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password)
    localStorage.setItem('access_token', response.tokens.access_token)
    localStorage.setItem('refresh_token', response.tokens.refresh_token)
    apiClient.setAccessToken(response.tokens.access_token)
    setUser(response.user)
  }

  const register = async (data: RegisterData) => {
    const response = await apiClient.register(data)
    localStorage.setItem('access_token', response.tokens.access_token)
    localStorage.setItem('refresh_token', response.tokens.refresh_token)
    apiClient.setAccessToken(response.tokens.access_token)
    setUser(response.user)
  }

  const googleLogin = async (code: string) => {
    const response = await apiClient.googleLogin(code, window.location.origin + '/auth/callback')
    localStorage.setItem('access_token', response.tokens.access_token)
    localStorage.setItem('refresh_token', response.tokens.refresh_token)
    apiClient.setAccessToken(response.tokens.access_token)
    setUser(response.user)
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      await apiClient.logout(refreshToken)
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Mobile (Flutter)

#### API Client Setup

```dart
// lib/services/api_client.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'http://localhost:5000/api';
  final storage = FlutterSecureStorage();
  String? _accessToken;

  Future<void> setAccessToken(String token) async {
    _accessToken = token;
    await storage.write(key: 'access_token', value: token);
  }

  Future<void> loadAccessToken() async {
    _accessToken = await storage.read(key: 'access_token');
  }

  Future<Map<String, dynamic>> request(
    String endpoint, {
    String method = 'GET',
    Map<String, dynamic>? body,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = {
      'Content-Type': 'application/json',
      if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
    };

    http.Response response;
    switch (method) {
      case 'POST':
        response = await http.post(url, headers: headers, body: jsonEncode(body));
        break;
      case 'PUT':
        response = await http.put(url, headers: headers, body: jsonEncode(body));
        break;
      case 'DELETE':
        response = await http.delete(url, headers: headers);
        break;
      default:
        response = await http.get(url, headers: headers);
    }

    final data = jsonDecode(response.body);

    if (!data['success']) {
      throw ApiException(data['error']);
    }

    return data['data'];
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    return await request('/auth/login', method: 'POST', body: {
      'email': email,
      'password': password,
    });
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    return await request('/auth/register', method: 'POST', body: userData);
  }

  Future<Map<String, dynamic>> getCurrentUser() async {
    return await request('/auth/me');
  }
}
```

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Response:** 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "code": "SYS_9002",
    "message": "Too many requests, please try again later",
    "timestamp": "2025-10-23T10:30:00.000Z"
  }
}
```

---

## CORS Configuration

**Allowed Origins:**
- `http://localhost:3000` (frontend dev)
- `http://localhost:3001` (admin dev)
- `https://derlg.com` (production)
- `https://admin.derlg.com` (production)

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:** Content-Type, Authorization

---

## Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Get current user (with token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import the Postman collection (coming soon)
2. Set environment variable `API_URL` to `http://localhost:5000/api`
3. Run authentication requests
4. Token will be automatically saved for subsequent requests

---

## Support

For API issues or questions:
- Check [COMPONENT_SYNC_STATUS.md](./COMPONENT_SYNC_STATUS.md) for current status
- Review [backend/docs/AUTHENTICATION.md](./backend/docs/AUTHENTICATION.md) for detailed auth docs
- See [backend/README.md](./backend/README.md) for backend setup

---

## Changelog

### Version 1.0 (October 23, 2025)
- Initial API documentation
- Authentication endpoints complete
- User registration and login
- Google OAuth 2.0 integration
- JWT token management
