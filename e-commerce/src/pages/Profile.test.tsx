import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Profile from './Profile';
import { useSelector, useDispatch } from 'react-redux';
import { pb } from '../services/pocketbase';

// Mock redux
vi.mock('react-redux', () => {
  return {
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

// Mock pocketbase
vi.mock('../services/pocketbase', () => {
  return {
    pb: {
      authStore: {
        isValid: false,
        model: null,
      },
      collection: vi.fn().mockReturnValue({
        update: vi.fn(),
        requestEmailChange: vi.fn(),
        authRefresh: vi.fn(),
      }),
      send: vi.fn(),
    },
  };
});

describe('Profile Component', () => {
  const mockDispatch = vi.fn();
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    
    // Default valid state
    pb.authStore.isValid = false;
    pb.authStore.model = null;
    
    // Default user state (mock redux)
    vi.mocked(useSelector).mockReturnValue({
      name: 'Lê Văn B',
      email: 'levanb@gmail.com',
      phone: '0987654321',
      address: 'Hà Nội'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders fallback mock profile when not logged in to PocketBase', () => {
    render(<Profile onLogout={mockOnLogout} />);

    expect(screen.getByDisplayValue('Lê Văn B')).toBeInTheDocument();
    expect(screen.getByDisplayValue('levanb@gmail.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0987 654 321')).toBeInTheDocument();
  });

  it('formats phone numbers and removes extra spaces while typing', () => {
    render(<Profile onLogout={mockOnLogout} />);

    const phoneInput = screen.getByLabelText('Số điện thoại');
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '0912 345  678' } });

    expect(phoneInput).toHaveValue('0912 345 678');
  });

  it('formats +84 phone numbers correctly', () => {
    render(<Profile onLogout={mockOnLogout} />);

    const phoneInput = screen.getByLabelText('Số điện thoại');
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '+84912345678' } });

    expect(phoneInput).toHaveValue('+84 912 345 678');
  });

  it('triggers onLogout callback when clicking Đăng xuất', () => {
    render(<Profile onLogout={mockOnLogout} />);

    const logoutBtn = screen.getByRole('button', { name: 'Đăng xuất' });
    fireEvent.click(logoutBtn);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('shows error toast for invalid email', async () => {
    vi.mocked(useSelector).mockReturnValue({
      name: 'Lê Văn B',
      email: 'levanb@gmail.com',
      phone: '0987654321',
      address: 'Hà Nội'
    });
    
    render(<Profile onLogout={mockOnLogout} />);

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'invalid-email' } });
    
    const saveBtn = screen.getByRole('button', { name: 'Lưu thay đổi' });
    fireEvent.click(saveBtn); // Change to click, it will trigger the handler because inputs might be invalid for submit, but wait, type="email" with invalid value won't trigger submit in JSDOM if click is used on a submit button.
    // Actually, let's bypass the form validation by triggering the form's submit directly.
    fireEvent.submit(saveBtn.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Email không hợp lệ!')).toBeInTheDocument();
    });
  });

  it('shows error toast for invalid phone', async () => {
    vi.mocked(useSelector).mockReturnValue({
      name: 'Lê Văn B',
      email: 'levanb@gmail.com',
      phone: '0987654321',
      address: 'Hà Nội'
    });

    render(<Profile onLogout={mockOnLogout} />);

    const phoneInput = screen.getByLabelText('Số điện thoại');
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '123' } });
    
    const saveBtn = screen.getByRole('button', { name: 'Lưu thay đổi' });
    fireEvent.submit(saveBtn.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84 và đủ 10 số)!')).toBeInTheDocument();
    });
  });

  it('updates profile in redux store if not logged in to PocketBase', async () => {
    vi.mocked(useSelector).mockReturnValue({
      name: 'Lê Văn B',
      email: 'levanb@gmail.com',
      phone: '0987654321',
      address: 'Hà Nội'
    });
    render(<Profile onLogout={mockOnLogout} />);

    const nameInput = screen.getByLabelText('Họ và Tên');
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Trần Văn C' } });

    const saveBtn = screen.getByRole('button', { name: 'Lưu thay đổi' });
    fireEvent.submit(saveBtn.closest('form')!);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(screen.getByText('Thông tin cá nhân đã được cập nhật thành công!')).toBeInTheDocument();
    });
  });

  it('updates profile in PocketBase if logged in to PocketBase', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = {
      id: 'usr123',
      name: 'PB User',
      email: 'pb@gmail.com',
      phone: '0987654321',
      address: 'Hà Nội',
      tokenKey: 'fake-token'
    };

    const mockUpdate = vi.fn().mockResolvedValue({ name: 'New Name' });
    vi.mocked(pb.collection).mockReturnValue({
      update: mockUpdate,
      requestEmailChange: vi.fn(),
      authRefresh: vi.fn(),
    } as any);

    render(<Profile onLogout={mockOnLogout} />);

    const nameInput = screen.getByLabelText('Họ và Tên');
    fireEvent.change(nameInput, { target: { name: 'name', value: 'New Name' } });

    const saveBtn = screen.getByRole('button', { name: 'Lưu thay đổi' });
    fireEvent.submit(saveBtn.closest('form')!);

    await waitFor(() => {
      expect(pb.collection).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalledWith('usr123', { name: 'New Name' });
      expect(screen.getByText('Thông tin cá nhân đã được cập nhật thành công!')).toBeInTheDocument();
    });
  });

  it('handles email change in PocketBase', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = {
      id: 'usr123',
      name: 'PB User',
      email: 'pb@gmail.com',
      phone: '0987654321',
      address: 'Hà Nội'
    };

    const mockUpdate = vi.fn().mockResolvedValue({ name: 'PB User Updated' });
    vi.mocked(pb.collection).mockReturnValue({
      update: mockUpdate,
      authRefresh: vi.fn(),
    } as any);
    const mockSend = vi.fn().mockResolvedValue(true);
    pb.send = mockSend;

    render(<Profile onLogout={mockOnLogout} />);

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'new@gmail.com' } });

    const nameInput = screen.getByLabelText('Họ và Tên');
    fireEvent.change(nameInput, { target: { name: 'name', value: 'PB User Updated' } });

    const saveBtn = screen.getByRole('button', { name: 'Lưu thay đổi' });
    fireEvent.submit(saveBtn.closest('form')!);

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith('/api/change-email', expect.any(Object));
      expect(screen.getByText('Cập nhật email thành công! Vui lòng đăng nhập lại.')).toBeInTheDocument();
    });
  });

  it('shows error toast when PocketBase update fails', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = {
      id: 'usr123',
      name: 'PB User',
      email: 'pb@gmail.com',
      phone: '0987654321',
      address: 'Hà Nội'
    };

    const mockUpdate = vi.fn().mockRejectedValue(new Error('Update failed'));
    vi.mocked(pb.collection).mockReturnValue({
      update: mockUpdate,
      requestEmailChange: vi.fn(),
    } as any);

    render(<Profile onLogout={mockOnLogout} />);

    const nameInput = screen.getByLabelText('Họ và Tên');
    fireEvent.change(nameInput, { target: { name: 'name', value: 'PB User Updated' } });

    const saveBtn = screen.getByRole('button', { name: 'Lưu thay đổi' });
    fireEvent.submit(saveBtn.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Có lỗi xảy ra khi lưu thông tin lên PocketBase.')).toBeInTheDocument();
    });
  });
});
