import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    },
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
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      phone: '0222222222',
      address: 'Hà Nội',
    });

    render(<Profile onLogout={mockOnLogout} />);

    expect(screen.getByLabelText('Họ và Tên')).toHaveValue('Nguyễn Văn A');
    expect(screen.getByLabelText('Email')).toHaveValue('nguyenvana@gmail.com');
    expect(screen.getByLabelText('Số điện thoại')).toHaveValue('0222222222');
    expect(screen.getByLabelText('Địa chỉ nhận hàng')).toHaveValue('Hà Nội');
  });

  it('triggers onLogout callback when clicking Đăng xuất', () => {
    vi.mocked(useSelector).mockReturnValue({
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      phone: '0222222222',
      address: 'Hà Nội',
    });

    render(<Profile onLogout={mockOnLogout} />);

    const logoutBtn = screen.getByRole('button', { name: 'Đăng xuất' });
    fireEvent.click(logoutBtn);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });
});
