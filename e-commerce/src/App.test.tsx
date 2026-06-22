import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { useSelector, useDispatch } from 'react-redux';
import { useCart } from './context/CartContext';
import { pb } from './services/pocketbase';

// Mock Redux
vi.mock('react-redux', () => {
  return {
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

// Mock CartContext
vi.mock('./context/CartContext', () => {
  const mockProducts = [
    {
      id: 'prod-1',
      name: 'iPhone 13',
      brand: 'Apple',
      rating: 5,
      description: 'Clean iPhone',
      price: 16990000,
      image: '/ip13.png',
      colors: [],
    }
  ];

  return {
    CartProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useCart: vi.fn(() => ({
      products: mockProducts,
      cart: [],
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    })),
  };
});

// Mock PocketBase
vi.mock('./services/pocketbase', () => {
  return {
    pb: {
      authStore: {
        isValid: false,
        model: null,
      },
    },
    getFileUrl: vi.fn(),
  };
});

// Mock nested lazy-loaded components to speed up testing and isolate routing
vi.mock('./pages/Login', () => ({ default: () => <div data-testid="login-page">Login Page</div> }));
vi.mock('./pages/Shop', () => ({ default: () => <div data-testid="shop-page">Shop Page</div> }));
vi.mock('./pages/Cart', () => ({ default: () => <div data-testid="cart-page">Cart Page</div> }));
vi.mock('./pages/Profile', () => ({ default: () => <div data-testid="profile-page">Profile Page</div> }));
vi.mock('./pages/ProductDetail', () => ({ default: () => <div data-testid="product-detail-page">Product Detail Page</div> }));

describe('App Component', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
  });

  it('renders Login page (or fallback) when not logged in', async () => {
    // Return false for isLoggedIn
    vi.mocked(useSelector).mockReturnValue(false);

    render(<App />);

    // Since Suspense wraps Login, we might see the fallback text briefly
    expect(screen.getByText('Đang tải trang đăng nhập...')).toBeInTheDocument();

    // Eventually the lazy-loaded mock Login should appear
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('renders Navigation layout and Shop by default when logged in', async () => {
    // Return true for isLoggedIn
    vi.mocked(useSelector).mockReturnValue(true);

    // Valid user for header rendering
    pb.authStore.isValid = true;
    pb.authStore.model = { avatar: 'avatar.png' };

    render(<App />);

    // Check header
    expect(screen.getByText('Mobile Shopping')).toBeInTheDocument();

    // Check sidebar navigation items
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('My Profile')).toBeInTheDocument();

    // Wait for lazy-loaded Shop page (since default route is /shop)
    await waitFor(() => {
      expect(screen.getByTestId('shop-page')).toBeInTheDocument();
    });
  });
});
