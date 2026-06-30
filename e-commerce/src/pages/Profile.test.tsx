
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Profile from './Profile';
import { useSelector, useDispatch } from 'react-redux';
import { pb } from '../services/pocketbase';


// Mock react-redux hooks
vi.mock('react-redux', () => {
  return {
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

// Mock PocketBase
vi.mock('../services/pocketbase', () => {
  return {
    pb: {
      collection: vi.fn().mockImplementation(() => {
        return {
          update: vi.fn().mockResolvedValue({}),
          authRefresh: vi.fn().mockResolvedValue({}),
        };
      }),
      authStore: {
        isValid: false,
        model: null,
      },
      files: {
        getURL: vi.fn().mockReturnValue('/mock-avatar.png'),
      },
      send: vi.fn().mockResolvedValue({}),
    },
    getFileUrl: vi.fn().mockReturnValue('/mock-avatar.png'),
  };
});

describe('Profile Component', () => {
  const mockOnLogout = vi.fn();
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockOnLogout.mockClear();
    mockDispatch.mockClear();
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
  });

  it('renders fallback mock profile when not logged in to PocketBase', () => {
    vi.mocked(useSelector).mockReturnValue({
      name: 'Lê Văn B',
      email: 'levanb@gmail.com',
      phone: '0111111111',
      address: 'Hà Nội',
    });

    render(<Profile onLogout={mockOnLogout} />);

    expect(screen.getByLabelText('Họ và Tên')).toHaveValue('Lê Văn B');
    expect(screen.getByLabelText('Email')).toHaveValue('levanb@gmail.com');
    expect(screen.getByLabelText('Số điện thoại')).toHaveValue('0111111111');
    expect(screen.getByLabelText('Địa chỉ nhận hàng')).toHaveValue('Hà Nội');
  });

  it('triggers onLogout callback when clicking Đăng xuất', () => {
    vi.mocked(useSelector).mockReturnValue({
      name: 'Lê Văn B',
      email: 'levanb@gmail.com',
      phone: '0111111111',
      address: 'Hà Nội',
    });

    render(<Profile onLogout={mockOnLogout} />);

    const logoutBtn = screen.getByRole('button', { name: 'Đăng xuất' });
    fireEvent.click(logoutBtn);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('handles email update error and reverts email field', async () => {
    vi.useFakeTimers();
    vi.mocked(useSelector).mockReturnValue({
      name: 'Lê Văn B',
      email: 'levanb@gmail.com',
      phone: '0111111111',
      address: 'Hà Nội',
    });

    // Simulate logged-in PocketBase user
    pb.authStore.isValid = true;
    pb.authStore.model = {
      id: 'test-user-id',
      name: 'Lê Văn B',
      email: 'levanb@gmail.com',
      phone: '0111111111',
      address: 'Hà Nội',
      rank: 'Normal'
    } as any;

    const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockSend = vi.mocked(pb.send).mockRejectedValueOnce(new Error('Email already in use'));

    render(<Profile onLogout={mockOnLogout} />);

    const emailInput = screen.getByLabelText('Email');

    // Change email
    fireEvent.change(emailInput, { target: { value: 'newemail@gmail.com' } });
    expect(emailInput).toHaveValue('newemail@gmail.com');

    // Submit form
    const form = emailInput.closest('form');
    expect(form).not.toBeNull();

    await act(async () => {
      fireEvent.submit(form!);
    });

    // Assert pb.send was called
    expect(mockSend).toHaveBeenCalledWith('/api/change-email', {
      method: 'POST',
      body: { id: 'test-user-id', email: 'newemail@gmail.com' }
    });

    // Assert console.warn was called
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'Failed to update email via custom hook:',
      expect.any(Error)
    );
    expect(mockConsoleWarn.mock.calls[0][1].message).toBe('Email already in use');

    // Assert error toast is shown
    expect(screen.getByText('Lỗi: Email already in use')).toBeInTheDocument();

    // Assert email input reverted to original
    expect(emailInput).toHaveValue('levanb@gmail.com');

    // Clean up
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
    mockConsoleWarn.mockRestore();

    // Reset pb.authStore state for other tests
    pb.authStore.isValid = false;
    pb.authStore.model = null;
  });
});
