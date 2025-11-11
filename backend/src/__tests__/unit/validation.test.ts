/**
 * Input Validation Unit Tests
 * Tests for email, password, phone, and other input validations
 */

describe('Input Validation', () => {
  describe('Email Validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it('should validate correct email', () => {
      expect(emailRegex.test('user@example.com')).toBe(true);
    });

    it('should validate email with subdomain', () => {
      expect(emailRegex.test('user@mail.example.com')).toBe(true);
    });

    it('should reject email without @', () => {
      expect(emailRegex.test('userexample.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(emailRegex.test('user@')).toBe(false);
    });

    it('should reject email with spaces', () => {
      expect(emailRegex.test('user @example.com')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    it('should validate strong password', () => {
      expect(passwordRegex.test('StrongPass123')).toBe(true);
    });

    it('should reject password without uppercase', () => {
      expect(passwordRegex.test('strongpass123')).toBe(false);
    });

    it('should reject password without lowercase', () => {
      expect(passwordRegex.test('STRONGPASS123')).toBe(false);
    });

    it('should reject password without number', () => {
      expect(passwordRegex.test('StrongPassword')).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      expect(passwordRegex.test('Pass12')).toBe(false);
    });
  });

  describe('Phone Number Validation', () => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    it('should validate phone with country code', () => {
      expect(phoneRegex.test('+855969983479')).toBe(true);
    });

    it('should validate phone without country code', () => {
      expect(phoneRegex.test('969983479')).toBe(true);
    });

    it('should reject phone with letters', () => {
      expect(phoneRegex.test('+855ABC983479')).toBe(false);
    });

    it('should reject phone with spaces', () => {
      expect(phoneRegex.test('+855 969 983 479')).toBe(false);
    });
  });

  describe('URL Validation', () => {
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

    it('should validate HTTPS URL', () => {
      expect(urlRegex.test('https://example.com')).toBe(true);
    });

    it('should validate HTTP URL', () => {
      expect(urlRegex.test('http://example.com')).toBe(true);
    });

    it('should validate URL without protocol', () => {
      expect(urlRegex.test('example.com')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(urlRegex.test('not a url')).toBe(false);
    });
  });

  describe('Date Validation', () => {
    it('should validate correct date format', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(dateRegex.test('2024-11-10')).toBe(true);
    });

    it('should reject invalid date format', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(dateRegex.test('10-11-2024')).toBe(false);
    });

    it('should validate date is in future', () => {
      const checkInDate = new Date('2025-12-31');
      const today = new Date();
      expect(checkInDate > today).toBe(true);
    });

    it('should reject date in past', () => {
      const checkInDate = new Date('2020-01-01');
      const today = new Date();
      expect(checkInDate > today).toBe(false);
    });
  });

  describe('Number Validation', () => {
    it('should validate positive integer', () => {
      const value = 5;
      expect(Number.isInteger(value) && value > 0).toBe(true);
    });

    it('should reject negative number', () => {
      const value = -5;
      expect(Number.isInteger(value) && value > 0).toBe(false);
    });

    it('should validate price range', () => {
      const price = 150;
      const minPrice = 10;
      const maxPrice = 1000;
      expect(price >= minPrice && price <= maxPrice).toBe(true);
    });

    it('should reject price outside range', () => {
      const price = 1500;
      const minPrice = 10;
      const maxPrice = 1000;
      expect(price >= minPrice && price <= maxPrice).toBe(false);
    });
  });

  describe('String Validation', () => {
    it('should validate non-empty string', () => {
      const value = 'test';
      expect(typeof value === 'string' && value.length > 0).toBe(true);
    });

    it('should reject empty string', () => {
      const value = '';
      expect(typeof value === 'string' && value.length > 0).toBe(false);
    });

    it('should validate string length', () => {
      const value = 'test';
      const minLength = 2;
      const maxLength = 10;
      expect(value.length >= minLength && value.length <= maxLength).toBe(true);
    });

    it('should reject string exceeding max length', () => {
      const value = 'this is a very long string that exceeds the maximum length';
      const maxLength = 10;
      expect(value.length <= maxLength).toBe(false);
    });
  });

  describe('XSS Prevention', () => {
    it('should detect script tags', () => {
      const input = '<script>alert("xss")</script>';
      const hasScriptTag = /<script[^>]*>.*?<\/script>/gi.test(input);
      expect(hasScriptTag).toBe(true);
    });

    it('should detect event handlers', () => {
      const input = '<img src="x" onerror="alert(\'xss\')">';
      const hasEventHandler = /on\w+\s*=/gi.test(input);
      expect(hasEventHandler).toBe(true);
    });

    it('should allow safe HTML', () => {
      const input = '<p>This is safe text</p>';
      const hasScriptTag = /<script[^>]*>.*?<\/script>/gi.test(input);
      expect(hasScriptTag).toBe(false);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should detect SQL keywords in input', () => {
      const input = "'; DROP TABLE users; --";
      const hasSQLKeywords = /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)/gi.test(input);
      expect(hasSQLKeywords).toBe(true);
    });

    it('should allow normal input', () => {
      const input = 'John Doe';
      const hasSQLKeywords = /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)/gi.test(input);
      expect(hasSQLKeywords).toBe(false);
    });
  });
});

