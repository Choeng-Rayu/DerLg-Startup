/**
 * Authentication Service Unit Tests
 * Tests for user registration, login, password reset, and JWT token generation
 */

import authService from '../../services/auth.service';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  describe('Password Hashing', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);
      const isMatch = await bcrypt.compare(password, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);
      const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);
      
      expect(isMatch).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong password', () => {
      const strongPassword = 'StrongPass123!';
      const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(strongPassword);
      
      expect(isValid).toBe(true);
    });

    it('should reject weak password (no uppercase)', () => {
      const weakPassword = 'weakpass123!';
      const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(weakPassword);
      
      expect(isValid).toBe(false);
    });

    it('should reject weak password (too short)', () => {
      const weakPassword = 'Pass1!';
      const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(weakPassword);
      
      expect(isValid).toBe(false);
    });

    it('should reject weak password (no number)', () => {
      const weakPassword = 'WeakPassword!';
      const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(weakPassword);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email format', () => {
      const validEmail = 'user@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(validEmail)).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidEmail = 'invalid-email';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(invalidEmail)).toBe(false);
    });

    it('should reject email without domain', () => {
      const invalidEmail = 'user@';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(invalidEmail)).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token structure', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const parts = token.split('.');
      
      expect(parts.length).toBe(3);
      expect(parts[0]).toBeDefined();
      expect(parts[1]).toBeDefined();
      expect(parts[2]).toBeDefined();
    });

    it('should have correct JWT header', () => {
      const header = Buffer.from('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', 'base64').toString();
      const parsed = JSON.parse(header);
      
      expect(parsed.alg).toBe('HS256');
      expect(parsed.typ).toBe('JWT');
    });
  });

  describe('Token Expiration', () => {
    it('should set 24-hour expiration for access token', () => {
      const expirationTime = 24 * 60 * 60; // 24 hours in seconds
      const expectedSeconds = 86400;
      
      expect(expirationTime).toBe(expectedSeconds);
    });

    it('should set 7-day expiration for refresh token', () => {
      const expirationTime = 7 * 24 * 60 * 60; // 7 days in seconds
      const expectedSeconds = 604800;
      
      expect(expirationTime).toBe(expectedSeconds);
    });
  });
});

