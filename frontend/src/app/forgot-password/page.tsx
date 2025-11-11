'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { api } from '@/lib/api';
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants';

interface ForgotPasswordFormData {
  identifier: string; // Can be email or phone
  method: 'email' | 'sms';
}

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    identifier: '',
    method: 'email',
  });
  const [errors, setErrors] = useState<{ identifier?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: { identifier?: string } = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    } else if (formData.method === 'email') {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier)) {
        newErrors.identifier = 'Invalid email format';
      }
    } else {
      // Validate phone format
      if (!/^\+?[0-9]{8,15}$/.test(formData.identifier.replace(/\s/g, ''))) {
        newErrors.identifier = 'Invalid phone number format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors
    if (errors.identifier) {
      setErrors({});
    }
    setApiError('');
    setSuccessMessage('');
  };

  const handleMethodChange = (method: 'email' | 'sms') => {
    setFormData(prev => ({ ...prev, method, identifier: '' }));
    setErrors({});
    setApiError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      const payload = formData.method === 'email'
        ? { email: formData.identifier }
        : { phone: formData.identifier };

      const response = await api.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        payload
      );

      if (response.success) {
        const deliveryMethod = formData.method === 'email' ? 'email' : 'SMS';
        setSuccessMessage(
          `Password reset link has been sent to your ${deliveryMethod}. Please check and follow the instructions.`
        );
        setFormData({ identifier: '', method: formData.method });
      } else {
        setApiError(response.error?.message || 'Failed to send reset link. Please try again.');
      }
    } catch (error) {
      setApiError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email or phone number and we'll send you a link to reset your password.
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {apiError}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {successMessage}
              </div>
            )}

            {/* Method Selection */}
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => handleMethodChange('email')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  formData.method === 'email'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => handleMethodChange('sms')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  formData.method === 'sms'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                SMS
              </button>
            </div>

            <Input
              label={formData.method === 'email' ? 'Email address' : 'Phone number'}
              type={formData.method === 'email' ? 'email' : 'tel'}
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              error={errors.identifier}
              placeholder={
                formData.method === 'email' 
                  ? 'you@example.com' 
                  : '+855 12 345 678'
              }
              required
              autoComplete={formData.method === 'email' ? 'email' : 'tel'}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              Send Reset Link
            </Button>

            <div className="text-center">
              <Link 
                href="/login" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
