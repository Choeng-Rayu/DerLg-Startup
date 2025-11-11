# DerLg Tourism Platform - Cross-Component Integration Guide

**Version**: 1.0  
**Date**: October 23, 2025  
**Status**: Active Development

## ⚠️ Current Integration Status

**Backend API:** ✅ Ready for integration (Tasks 1-11 complete)
**Frontend Web:** ⏳ Needs implementation (Tasks 44-58)
**System Admin:** ⏳ Needs implementation (Tasks 59-66)
**Mobile App:** ⏳ Needs implementation (Tasks 88-91)
**AI Engine:** ⏳ Not created (Tasks 30-35)

See [COMPONENT_SYNC_STATUS.md](./COMPONENT_SYNC_STATUS.md) for detailed status.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Contract Specifications](#api-contract-specifications)
3. [Authentication Flow](#authentication-flow)
4. [Data Models & Type Definitions](#data-models--type-definitions)
5. [Environment Configuration](#environment-configuration)
6. [Integration Checklist](#integration-checklist)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     DerLg Tourism Platform                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │◀────│ System Admin │
│  (Next.js)   │     │  (Express)   │     │  (Next.js)   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                      │
       │                    │                      │
       ▼                    ▼                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Mobile App  │     │  AI Engine   │     │    MySQL     │
│  (Flutter)   │     │  (FastAPI)   │     │  Database    │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Communication Patterns

1. **Frontend ↔ Backend**: REST API (HTTP/HTTPS)
2. **Mobile ↔ Backend**: REST API (HTTP/HTTPS)
3. **System Admin ↔ Backend**: REST API (HTTP/HTTPS)
4. **Backend ↔ AI Engine**: REST API (HTTP/HTTPS)
5. **Backend ↔ Database**: Sequelize ORM
6. **Real-time**: Socket.io (WebSocket) - Future

---

## API Contract Specifications

### Base URLs

```typescript
// Development
const API_URLS = {
  backend: 'http://localhost:5000',
  ai: 'http://localhost:8000',
  frontend: 'http://localhost:3000',
  admin: 'http://localhost:3001',
};

// Production
const API_URLS = {
  backend: 'https://api.derlg.com',
  ai: 'https://ai.derlg.com',
  frontend: 'https://derlg.com',
  admin: 'https://admin.derlg.com',
};
```

### Authentication Endpoints

#### POST /api/auth/register
**Request:**
```typescript
{
  user_type: 'tourist' | 'admin' | 'super_admin';
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  language?: 'en' | 'km' | 'zh';
  currency?: 'USD' | 'KHR';
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      user_type: string;
      // ... other safe user fields
    };
    tokens: {
      accessToken: string;  // 24h expiry
      refreshToken: string; // 30d expiry
    };
  };
  timestamp: string;
}
```

#### POST /api/auth/login
**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:** Same as register

#### POST /api/auth/refresh-token
**Request:**
```typescript
{
  refreshToken: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  timestamp: string;
}
```

#### POST /api/auth/logout
**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```typescript
{
  success: true;
  data: {
    message: 'Logged out successfully';
  };
  timestamp: string;
}
```

#### GET /api/auth/me
**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
    profile_image: string | null;
    language: string;
    currency: string;
    is_student: boolean;
    // ... other safe user fields
  };
  timestamp: string;
}
```

### Error Response Format

All errors follow this structure:

```typescript
{
  success: false;
  error: {
    code: string;        // e.g., 'AUTH_1001', 'VAL_2001'
    message: string;     // Human-readable error message
    details?: any;       // Optional additional details
    timestamp: string;
  };
}
```

### Common Error Codes

```typescript
// Authentication Errors (AUTH_XXXX)
AUTH_1001: 'Invalid credentials'
AUTH_1002: 'Email already exists'
AUTH_1003: 'Invalid or expired token'
AUTH_1004: 'Unauthorized access'
AUTH_1005: 'Account not active'

// Validation Errors (VAL_XXXX)
VAL_2001: 'Invalid email format'
VAL_2002: 'Password too weak'
VAL_2003: 'Required field missing'
VAL_2004: 'Invalid data format'

// System Errors (SYS_XXXX)
SYS_9001: 'Internal server error'
SYS_9002: 'Too many requests'
SYS_9003: 'Service unavailable'
```

---

## Authentication Flow

### Web Frontend (Next.js)

#### 1. Token Storage Strategy

```typescript
// lib/auth.ts
import { cookies } from 'next/headers';

export async function setAuthTokens(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  // Store access token (24h)
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
  
  // Store refresh token (30d)
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
}

export async function clearAuthTokens() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}
```

#### 2. API Client with Auto-Refresh

```typescript
// lib/api-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

class APIClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              const refreshToken = await getRefreshToken();
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`,
                { refreshToken }
              );

              const { accessToken, refreshToken: newRefreshToken } = response.data.data;
              await setAuthTokens(accessToken, newRefreshToken);

              this.isRefreshing = false;
              this.onRefreshed(accessToken);
              this.refreshSubscribers = [];

              return this.client(originalRequest);
            } catch (refreshError) {
              this.isRefreshing = false;
              await clearAuthTokens();
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          }

          return new Promise((resolve) => {
            this.refreshSubscribers.push((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(this.client(originalRequest));
            });
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
  }

  // API methods
  async get<T>(url: string, config?: any) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new APIClient();
```

### Mobile App (Flutter)

#### 1. Secure Token Storage

```dart
// lib/services/storage_service.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  final _storage = const FlutterSecureStorage();

  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await _storage.write(key: 'accessToken', value: accessToken);
    await _storage.write(key: 'refreshToken', value: refreshToken);
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: 'accessToken');
  }

  Future<String?> getRefreshToken() async {
    return await _storage.read(key: 'refreshToken');
  }

  Future<void> clearTokens() async {
    await _storage.delete(key: 'accessToken');
    await _storage.delete(key: 'refreshToken');
  }
}
```

#### 2. API Client with Dio

```dart
// lib/services/api_service.dart
import 'package:dio/dio.dart';

class APIService {
  late Dio _dio;
  final StorageService _storage = StorageService();
  bool _isRefreshing = false;

  APIService() {
    _dio = Dio(BaseOptions(
      baseUrl: const String.fromEnvironment('API_URL', 
        defaultValue: 'http://localhost:5000'),
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    // Request interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401 && !_isRefreshing) {
          _isRefreshing = true;
          
          try {
            final refreshToken = await _storage.getRefreshToken();
            final response = await _dio.post('/api/auth/refresh-token',
              data: {'refreshToken': refreshToken});
            
            final newAccessToken = response.data['data']['accessToken'];
            final newRefreshToken = response.data['data']['refreshToken'];
            
            await _storage.saveTokens(newAccessToken, newRefreshToken);
            _isRefreshing = false;
            
            // Retry original request
            error.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
            return handler.resolve(await _dio.fetch(error.requestOptions));
          } catch (e) {
            _isRefreshing = false;
            await _storage.clearTokens();
            // Navigate to login
            return handler.reject(error);
          }
        }
        return handler.next(error);
      },
    ));
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) {
    return _dio.put(path, data: data);
  }

  Future<Response> delete(String path) {
    return _dio.delete(path);
  }
}
```

---

## Data Models & Type Definitions

### Shared TypeScript Types

Create a shared types file that matches backend Sequelize models:

```typescript
// types/models.ts

export interface User {
  id: string;
  user_type: 'super_admin' | 'admin' | 'tourist';
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  language: 'en' | 'km' | 'zh';
  currency: 'USD' | 'KHR';
  is_student: boolean;
  student_email: string | null;
  student_discount_remaining: number;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hotel {
  id: string;
  admin_id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    province: string;
    country: string;
    latitude: number;
    longitude: number;
    google_maps_url: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string | null;
  };
  amenities: string[];
  images: string[];
  star_rating: number;
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  average_rating: number;
  total_reviews: number;
  total_bookings: number;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  hotel_id: string;
  room_type: string;
  description: string;
  capacity: number;
  bed_type: string;
  size_sqm: number;
  price_per_night: number;
  discount_percentage: number;
  amenities: string[];
  images: string[];
  total_rooms: number;
  available_rooms: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  user_id: string;
  hotel_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: {
    adults: number;
    children: number;
  };
  guest_details: {
    name: string;
    email: string;
    phone: string;
    special_requests: string;
  };
  pricing: {
    room_rate: number;
    subtotal: number;
    discount: number;
    promo_code: string | null;
    student_discount: number;
    tax: number;
    total: number;
  };
  payment: {
    method: 'paypal' | 'bakong' | 'stripe';
    type: 'deposit' | 'milestone' | 'full';
    status: 'pending' | 'partial' | 'completed' | 'refunded';
    transactions: PaymentTransactionInfo[];
    escrow_status: 'held' | 'released';
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  cancellation: {
    cancelled_at: string;
    reason: string;
    refund_amount: number;
    refund_status: string;
  } | null;
  calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransactionInfo {
  transaction_id: string;
  amount: number;
  payment_type: string;
  status: string;
  timestamp: string;
}

// Add more model types as needed...
```

### Flutter Models

```dart
// lib/models/user.dart
class User {
  final String id;
  final String userType;
  final String email;
  final String? phone;
  final String firstName;
  final String lastName;
  final String? profileImage;
  final String language;
  final String currency;
  final bool isStudent;
  final String? studentEmail;
  final int studentDiscountRemaining;
  final bool emailVerified;
  final bool phoneVerified;
  final bool isActive;
  final DateTime? lastLogin;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.userType,
    required this.email,
    this.phone,
    required this.firstName,
    required this.lastName,
    this.profileImage,
    required this.language,
    required this.currency,
    required this.isStudent,
    this.studentEmail,
    required this.studentDiscountRemaining,
    required this.emailVerified,
    required this.phoneVerified,
    required this.isActive,
    this.lastLogin,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      userType: json['user_type'],
      email: json['email'],
      phone: json['phone'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      profileImage: json['profile_image'],
      language: json['language'],
      currency: json['currency'],
      isStudent: json['is_student'],
      studentEmail: json['student_email'],
      studentDiscountRemaining: json['student_discount_remaining'],
      emailVerified: json['email_verified'],
      phoneVerified: json['phone_verified'],
      isActive: json['is_active'],
      lastLogin: json['last_login'] != null 
        ? DateTime.parse(json['last_login']) 
        : null,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_type': userType,
      'email': email,
      'phone': phone,
      'first_name': firstName,
      'last_name': lastName,
      'profile_image': profileImage,
      'language': language,
      'currency': currency,
      'is_student': isStudent,
      'student_email': studentEmail,
      'student_discount_remaining': studentDiscountRemaining,
      'email_verified': emailVerified,
      'phone_verified': phoneVerified,
      'is_active': isActive,
      'last_login': lastLogin?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
```

---

## Environment Configuration

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=derlg_tourism
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AI_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-CS4CQ72GZ6
```

### System Admin (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

### Mobile App (--dart-define)

```bash
flutter run --dart-define=API_URL=http://localhost:5000 --dart-define=AI_URL=http://localhost:8000
```

Or create a `.env` file and use flutter_dotenv:

```
API_URL=http://localhost:5000
AI_URL=http://localhost:8000
```

---

## Integration Checklist

### Phase 1: Backend Ready ✅
- [x] Database models created
- [x] Migrations run
- [x] Authentication endpoints working
- [x] JWT token generation working
- [x] Error handling implemented

### Phase 2: Frontend Integration 🔄
- [ ] Install axios dependency
- [ ] Create API client with auto-refresh
- [ ] Create shared TypeScript types
- [ ] Implement authentication pages
- [ ] Test login/register flow
- [ ] Implement protected routes
- [ ] Test token refresh mechanism

### Phase 3: System Admin Integration 🔄
- [ ] Install axios dependency
- [ ] Create API client
- [ ] Create admin authentication
- [ ] Implement role-based access
- [ ] Create dashboard layout
- [ ] Test admin login flow

### Phase 4: Mobile Integration 🔄
- [ ] Install dio and flutter_secure_storage
- [ ] Create API service
- [ ] Create Dart models
- [ ] Implement authentication screens
- [ ] Test login/register flow
- [ ] Implement secure token storage

### Phase 5: AI Engine Integration ⏳
- [ ] Set up FastAPI project
- [ ] Create health check endpoint
- [ ] Implement recommendation API
- [ ] Integrate with backend
- [ ] Test AI endpoints

---

## Common Patterns

### 1. Protected Route (Next.js)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/bookings/:path*', '/dashboard/:path*'],
};
```

### 2. Server Action (Next.js)

```typescript
// app/actions/auth.ts
'use server';

import { apiClient } from '@/lib/api-client';
import { setAuthTokens } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });

    await setAuthTokens(
      response.data.tokens.accessToken,
      response.data.tokens.refreshToken
    );

    redirect('/dashboard');
  } catch (error: any) {
    return {
      error: error.response?.data?.error?.message || 'Login failed',
    };
  }
}
```

### 3. State Management (Flutter with Provider)

```dart
// lib/providers/auth_provider.dart
import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  final APIService _apiService = APIService();
  final StorageService _storage = StorageService();

  Future<void> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });

      final data = response.data['data'];
      _user = User.fromJson(data['user']);
      
      await _storage.saveTokens(
        data['tokens']['accessToken'],
        data['tokens']['refreshToken'],
      );

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _storage.clearTokens();
    _user = null;
    notifyListeners();
  }
}
```

---

## Troubleshooting

### Issue: CORS Errors

**Symptom**: Browser console shows CORS policy errors

**Solution**:
1. Ensure backend CORS_ORIGIN includes frontend URL
2. Check backend app.ts has correct CORS configuration
3. Verify credentials: true in frontend axios config

### Issue: 401 Unauthorized After Token Refresh

**Symptom**: Still getting 401 after token refresh

**Solution**:
1. Check refresh token is being sent correctly
2. Verify refresh token hasn't expired (30 days)
3. Check backend JWT_REFRESH_SECRET matches
4. Clear cookies and login again

### Issue: Type Mismatches

**Symptom**: TypeScript errors about incompatible types

**Solution**:
1. Ensure frontend types match backend models exactly
2. Check snake_case vs camelCase conversion
3. Verify optional fields are marked with `?`
4. Update types when backend models change

### Issue: Mobile App Can't Connect to Backend

**Symptom**: Network errors in mobile app

**Solution**:
1. Use `10.0.2.2:5000` for Android emulator (not localhost)
2. Use actual IP address for iOS simulator
3. Check backend is running and accessible
4. Verify API_URL environment variable

---

## Next Steps

1. **Implement Frontend Authentication** (Priority 1)
   - Create login/register pages
   - Set up API client
   - Test authentication flow

2. **Implement System Admin Authentication** (Priority 2)
   - Create admin login page
   - Set up role-based access
   - Create dashboard layout

3. **Create Shared Type Definitions** (Priority 3)
   - Extract types from backend models
   - Create TypeScript definitions
   - Create Dart models

4. **Test End-to-End Flow** (Priority 4)
   - Register user from frontend
   - Login from frontend
   - Fetch user data
   - Test token refresh

5. **Implement Mobile Authentication** (Priority 5)
   - Create authentication screens
   - Set up API service
   - Test on emulator/simulator

---

**Last Updated**: October 23, 2025  
**Maintained By**: Development Team  
**Review Frequency**: After each major integration milestone
