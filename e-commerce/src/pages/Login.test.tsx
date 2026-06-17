import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { pb } from '../services/pocketbase';

// Mock PocketBase
vi.mock('../services/pocketbase', () => {
  return {
    pb: {
      collection: vi.fn().mockImplementation((name) => {
        return {
          getList: vi.fn().mockRejectedValue(new Error('Connection failed')),
          authWithPassword: vi.fn().mockRejectedValue(new Error('Auth failed'))
        };
      })
    }
  };
});

describe('Login Component', () => {
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockOnLoginSuccess.mockClear();
  });

  it('renders login form items correctly', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mật khẩu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
    expect(screen.getByText('Lưu đăng nhập')).toBeInTheDocument();
    expect(screen.getByText('Bạn quên mật khẩu?')).toBeInTheDocument();
  });

  it('toggles password visibility when the eye button is clicked', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button has no text name

    // Initial state: password input type should be password
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button: type should become text
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again: type should become password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('displays error message when submitting form with empty fields', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    // Enter only whitespaces to bypass HTML5 required validation but fail the custom trim() validation
    fireEvent.change(usernameInput, { target: { value: '   ' } });
    fireEvent.change(passwordInput, { target: { value: '   ' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập đầy đủ thông tin đăng nhập!')).toBeInTheDocument();
    });

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('handles validation and displays error message for mock credentials failure', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    // Enter invalid credentials
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Tên đăng nhập hoặc mật khẩu không chính xác!')).toBeInTheDocument();
    });

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('triggers onLoginSuccess callback upon successful mock authentication', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    // Enter valid mock credentials
    fireEvent.change(usernameInput, { target: { value: 'levanb' } });
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledWith('levanb', false);
    });
  });
});
