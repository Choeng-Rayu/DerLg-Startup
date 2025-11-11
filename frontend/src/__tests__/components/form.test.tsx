/**
 * Frontend Component Tests
 * Tests for form validations, user interactions, and component rendering
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock form component for testing
const LoginForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const validatePassword = (value: string) => {
    return value.length >= 8
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (Object.keys(newErrors).length === 0) {
      onSubmit({ email, password })
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      <button type="submit">Login</button>
    </form>
  )
}

describe('LoginForm Component', () => {
  describe('Form Rendering', () => {
    it('should render login form', () => {
      render(<LoginForm onSubmit={jest.fn()} />)
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('should render email input field', () => {
      render(<LoginForm onSubmit={jest.fn()} />)
      const emailInput = screen.getByPlaceholderText('Enter your email')
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should render password input field', () => {
      render(<LoginForm onSubmit={jest.fn()} />)
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const onSubmit = jest.fn()
      render(<LoginForm onSubmit={onSubmit} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /login/i })

      await userEvent.type(emailInput, 'invalid-email')
      await userEvent.type(passwordInput, 'ValidPass123')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should validate password length', async () => {
      const onSubmit = jest.fn()
      render(<LoginForm onSubmit={onSubmit} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /login/i })

      await userEvent.type(emailInput, 'user@example.com')
      await userEvent.type(passwordInput, 'short')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should accept valid email and password', async () => {
      const onSubmit = jest.fn()
      render(<LoginForm onSubmit={onSubmit} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /login/i })

      await userEvent.type(emailInput, 'user@example.com')
      await userEvent.type(passwordInput, 'ValidPass123')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'ValidPass123',
        })
      })
    })
  })

  describe('User Interactions', () => {
    it('should update email input on change', async () => {
      render(<LoginForm onSubmit={jest.fn()} />)
      const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement

      await userEvent.type(emailInput, 'test@example.com')
      expect(emailInput.value).toBe('test@example.com')
    })

    it('should update password input on change', async () => {
      render(<LoginForm onSubmit={jest.fn()} />)
      const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement

      await userEvent.type(passwordInput, 'TestPassword123')
      expect(passwordInput.value).toBe('TestPassword123')
    })

    it('should submit form with valid data', async () => {
      const onSubmit = jest.fn()
      render(<LoginForm onSubmit={onSubmit} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /login/i })

      await userEvent.type(emailInput, 'user@example.com')
      await userEvent.type(passwordInput, 'ValidPass123')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })

    it('should prevent form submission with invalid data', async () => {
      const onSubmit = jest.fn()
      render(<LoginForm onSubmit={onSubmit} />)

      const submitButton = screen.getByRole('button', { name: /login/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display email error message', async () => {
      render(<LoginForm onSubmit={jest.fn()} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const submitButton = screen.getByRole('button', { name: /login/i })

      await userEvent.type(emailInput, 'invalid')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })
    })

    it('should display password error message', async () => {
      render(<LoginForm onSubmit={jest.fn()} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /login/i })

      await userEvent.type(emailInput, 'user@example.com')
      await userEvent.type(passwordInput, 'short')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })

    it('should clear errors on valid input', async () => {
      render(<LoginForm onSubmit={jest.fn()} />)

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const submitButton = screen.getByRole('button', { name: /login/i })

      // First submit with invalid data
      await userEvent.type(emailInput, 'invalid')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })

      // Clear and enter valid data
      await userEvent.clear(emailInput)
      await userEvent.type(emailInput, 'user@example.com')
      await userEvent.type(passwordInput, 'ValidPass123')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument()
      })
    })
  })
})

