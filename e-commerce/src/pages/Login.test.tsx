
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';


// Mock PocketBase
vi.mock('../services/pocketbase', () => {
  return {
    pb: {
      filter: vi.fn((expr, params) => {
        // Mock implementation of pb.filter to prevent "pb.filter is not a function" error in tests
        let result = expr;
        for (const [key, value] of Object.entries(params || {})) {
          result = result.replace(new RegExp(`{:${key}}`, 'g'), typeof value === 'string' ? `'${value}'` : value);
        }
        return result;
      }),
      collection: vi.fn().mockImplementation(() => {
        return {
          getList: vi.fn().mockRejectedValue(new Error('Connection failed')),
          authWithPassword: vi.fn().mockRejectedValue(new Error('Auth failed'))
        };
      })
    }
  };
});

  it('displays fallback error message when an unexpected error occurs', async () => {
    // We can simulate an unexpected error reaching the outer catch block by intercepting one of the methods used inside the block.
    // However, the issue description points at import.meta.env.DEV fallback, where the mocked pocketbase fails.
    // Wait, the goal is: "We already have tests mocking PocketBase login in Login.test.tsx. It's straightforward to mock it to reject with an error and check if the expected error message ('Đã xảy ra lỗi kết nối, vui lòng thử lại.' or fallback) is shown."
    // Ah, if PocketBase login rejects, and it falls back to import.meta.env.DEV, AND if that inner promise ALSO fails,
    // it will throw and reach the outer catch block!
    // But the mock auth inner promise never rejects; it just resolves to { success: false, ... }.
    // But what if import.meta.env.DEV is false? Then it goes to the 'else' block and sets error "Tên đăng nhập...".
    // Wait, the outer catch block is:
    // catch { setError('Đã xảy ra lỗi kết nối, vui lòng thử lại.'); }
    // It says "uncovered error path". Which path is that?
    // If PocketBase rejects, it's caught by inner catch (line 101).
    // Then it checks import.meta.env.DEV.
    // What could throw to reach the outer catch block (line 131)?
    // E.g. if `pb.collection('users').getList(...)` throws? No, that's caught by inner-inner catch (line 90).
    // If `pb.collection('users').authWithPassword` throws? Caught by inner catch (line 101).
    // So if the outer block doesn't throw, how can we cover it?
    // Perhaps if we mock `setIsLoading` to throw? No, that's not natural.
    // What if we mock `import.meta.env.DEV` to be a getter that throws? (We tried, didn't work).
    // Let's just mock `onLoginSuccess` to throw! But onLoginSuccess is only called on success, so we'd have to make the mock succeed.
    // But if mock logic succeeds, onLoginSuccess(..., ...) throws, it is caught by outer catch block. Let's do that!

    const throwingMock = vi.fn().mockImplementation(() => {
      throw new Error('Unexpected error in success handler');
    });

    render(<Login onLoginSuccess={throwingMock} />);

    const usernameInput = screen.getByPlaceholderText('Tên đăng nhập, Email hoặc số điện thoại');
    const passwordInput = screen.getByPlaceholderText('Mật khẩu');
    const submitButton = screen.getByRole('button', { name: 'Đăng nhập' });

    // Enter valid mock credentials to reach onLoginSuccess
    fireEvent.change(usernameInput, { target: { value: 'levanb' } });
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Đã xảy ra lỗi kết nối, vui lòng thử lại.')).toBeInTheDocument();
    });
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
