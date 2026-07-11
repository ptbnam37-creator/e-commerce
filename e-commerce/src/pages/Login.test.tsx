import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { pb } from '../services/pocketbase';

export const mockGetList = vi.fn().mockRejectedValue(new Error('Connection failed'));
export const mockAuthWithPassword = vi.fn().mockRejectedValue(new Error('Auth failed'));

// Mock PocketBase
vi.mock('../services/pocketbase', () => {
  return {
    pb: {
      filter: vi.fn((expr, params) => {
        let result = expr;
        for (const [key, value] of Object.entries(params || {})) {
          result = result.replace(new RegExp(`{:${key}}`, 'g'), typeof value === 'string' ? `'${value}'` : value);
        }
        return result;
      }),
      collection: vi.fn().mockImplementation(() => {
        return {
          getList: mockGetList,
          authWithPassword: mockAuthWithPassword
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
    mockGetList.mockClear();
    mockAuthWithPassword.mockClear();
    vi.stubEnv('VITE_MOCK_PASSWORD', '12345678');
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
    const toggleButton = screen.getByRole('button', { name: 'Hiện mật khẩu' });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ẩn mật khẩu' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('displays error message when submitting form with empty fields', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    fireEvent.change(usernameInput, { target: { value: '   ' } });
    fireEvent.change(passwordInput, { target: { value: '   ' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập đầy đủ thông tin đăng nhập!')).toBeInTheDocument();
    });

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('displays error message for invalid email format', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    fireEvent.change(usernameInput, { target: { value: 'invalid-email@' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email không hợp lệ!')).toBeInTheDocument();
    });
  });

  it('displays error message for invalid phone format', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    fireEvent.change(usernameInput, { target: { value: '12345' } }); // valid digits but wrong format
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84 và đủ 10 số)!')).toBeInTheDocument();
    });
  });

  it('shows info message when clicking Forgot Password', async () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const forgotLink = screen.getByText('Bạn quên mật khẩu?');
    fireEvent.click(forgotLink);

    await waitFor(() => {
      expect(screen.getByText('Vui lòng liên hệ quản trị viên để khôi phục mật khẩu.')).toBeInTheDocument();
    });
  });

  it('handles validation and displays error message for mock credentials failure', async () => {
    mockAuthWithPassword.mockRejectedValueOnce(new Error('Auth failed'));
    
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Tên đăng nhập hoặc mật khẩu không chính xác!')).toBeInTheDocument();
    });

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('triggers onLoginSuccess callback upon successful mock authentication', async () => {
    mockAuthWithPassword.mockRejectedValueOnce(new Error('Auth failed'));

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    fireEvent.change(usernameInput, { target: { value: 'levanb' } });
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    
    // Also test checking "Remember Me"
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /Lưu đăng nhập/i });
    fireEvent.click(rememberMeCheckbox);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledWith('levanb', true);
    });
  });

  it('logs warning when PocketBase authentication fails and falls back to mock auth', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const pbError = new Error('Auth failed');
    mockAuthWithPassword.mockRejectedValueOnce(pbError);

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    fireEvent.change(usernameInput, { target: { value: 'levanb' } });
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith('PocketBase authentication failed or server offline.', pbError);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Falling back to mock auth in DEV environment...');
      expect(mockOnLoginSuccess).toHaveBeenCalledWith('levanb', false);
    });

    consoleWarnSpy.mockRestore();
  });

  it('logs in successfully using PocketBase', async () => {
    // Setup pb mocks to succeed
    mockGetList.mockResolvedValueOnce({
      items: [{ email: 'pb-user@gmail.com' }]
    });
    mockAuthWithPassword.mockResolvedValueOnce({
      record: { name: 'PB User' }
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    fireEvent.change(usernameInput, { target: { value: '0987654321' } }); // using phone to trigger getList
    fireEvent.change(passwordInput, { target: { value: 'realpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockGetList).toHaveBeenCalled();
      expect(mockAuthWithPassword).toHaveBeenCalledWith('pb-user@gmail.com', 'realpassword');
      expect(mockOnLoginSuccess).toHaveBeenCalledWith('PB User', false);
    });
  });

  it('handles PocketBase login network error gracefully', async () => {
    mockAuthWithPassword.mockRejectedValueOnce(new Error('Network Error'));
    vi.stubEnv('DEV', false); // force non-dev mode so it doesn't fallback to mock auth
    
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Tên đăng nhập hoặc mật khẩu không chính xác!')).toBeInTheDocument();
    });
  });
});
