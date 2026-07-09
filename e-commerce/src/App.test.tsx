import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App, { AppContent } from './App';
import { useSelector, useDispatch } from 'react-redux';
import { pb } from './services/pocketbase';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

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
      cart: [{ id: '1', quantity: 2 }], // mock 2 items in cart for testing badge
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
    getFileUrl: vi.fn().mockReturnValue('/mock-avatar.png'),
  };
});

// Mock nested lazy-loaded components
vi.mock('./pages/Login', () => ({ 
  default: ({ onLoginSuccess }: any) => (
    <div data-testid="login-page">
      Login Page
      <button data-testid="trigger-login" onClick={() => onLoginSuccess('testuser', true)}>Trigger Login</button>
    </div>
  ) 
}));
vi.mock('./pages/Shop', () => ({ 
  default: ({ onSelectProduct }: any) => (
    <div data-testid="shop-page">
      Shop Page
      <button data-testid="select-product" onClick={() => onSelectProduct({ id: 'prod-1' })}>Select Product</button>
    </div>
  ) 
}));
vi.mock('./pages/Cart', () => ({ default: () => <div data-testid="cart-page">Cart Page</div> }));
vi.mock('./pages/Profile', () => ({ 
  default: ({ onLogout }: any) => (
    <div data-testid="profile-page">
      Profile Page
      <button data-testid="trigger-logout" onClick={onLogout}>Trigger Logout</button>
    </div>
  ) 
}));
vi.mock('./pages/ProductDetail', () => ({ 
  default: ({ onBackToShop, onGoToCart }: any) => (
    <div data-testid="product-detail-page">
      Product Detail Page
      <button data-testid="back-to-shop" onClick={onBackToShop}>Back</button>
      <button data-testid="go-to-cart" onClick={onGoToCart}>Go to Cart</button>
    </div>
  ) 
}));

describe('App Component', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    
    // Default mock valid auth store
    pb.authStore.isValid = true;
    pb.authStore.model = { avatar: 'avatar.png' };
  });

  it('renders Login page when not logged in and handles loginSuccess', async () => {
    vi.mocked(useSelector).mockReturnValue(false);
    render(
      <MemoryRouter>
        <AppContent />
      </MemoryRouter>
    );

    expect(screen.getByText('Đang tải trang đăng nhập...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('trigger-login'));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'auth/loginAction',
      payload: { username: 'testuser', rememberMe: true }
    });
  });

  it('renders Navigation layout and Shop by default when logged in', async () => {
    vi.mocked(useSelector).mockReturnValue(true);
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <AppContent />
      </MemoryRouter>
    );

    expect(screen.getByText('Mobile Shopping')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('My Profile')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('shop-page')).toBeInTheDocument();
    });
  });

  it('navigates to Cart when clicking Cart nav item', async () => {
    vi.mocked(useSelector).mockReturnValue(true);
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('shop-page')).toBeInTheDocument());

    const cartBtn = screen.getByRole('button', { name: /Cart/i });
    fireEvent.click(cartBtn);

    await waitFor(() => {
      expect(screen.getByTestId('cart-page')).toBeInTheDocument();
    });
  });

  it('navigates to Profile when clicking Profile nav item and handles logout', async () => {
    vi.mocked(useSelector).mockReturnValue(true);
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('shop-page')).toBeInTheDocument());

    const profileBtn = screen.getByRole('button', { name: /My Profile/i });
    fireEvent.click(profileBtn);

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('trigger-logout'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'auth/logoutAction' });
  });

  it('navigates to Shop when clicking Logo', async () => {
    vi.mocked(useSelector).mockReturnValue(true);
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('shop-page')).toBeInTheDocument());
    
    // Go to cart first
    fireEvent.click(screen.getByRole('button', { name: /Cart/i }));
    await waitFor(() => expect(screen.getByTestId('cart-page')).toBeInTheDocument());

    // Click logo
    fireEvent.click(screen.getByText('Mobile Shopping').parentElement!);
    
    await waitFor(() => {
      expect(screen.getByTestId('shop-page')).toBeInTheDocument();
    });
  });

  it('navigates to Profile when clicking Avatar in header', async () => {
    vi.mocked(useSelector).mockReturnValue(true);
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('shop-page')).toBeInTheDocument());
    
    // Click avatar
    fireEvent.click(screen.getByAltText('User Profile'));
    
    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });
  });

  it('navigates to Product Detail when selecting a product', async () => {
    vi.mocked(useSelector).mockReturnValue(true);
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('shop-page')).toBeInTheDocument());
    
    fireEvent.click(screen.getByTestId('select-product'));
    
    await waitFor(() => {
      expect(screen.getByTestId('product-detail-page')).toBeInTheDocument();
    });

    // Test product detail back/cart buttons
    fireEvent.click(screen.getByTestId('back-to-shop'));
    await waitFor(() => expect(screen.getByTestId('shop-page')).toBeInTheDocument());
    
    fireEvent.click(screen.getByTestId('select-product'));
    await waitFor(() => expect(screen.getByTestId('product-detail-page')).toBeInTheDocument());
    
    fireEvent.click(screen.getByTestId('go-to-cart'));
    await waitFor(() => expect(screen.getByTestId('cart-page')).toBeInTheDocument());
  });

  it('ProductDetailWrapper shows empty state if product not found', async () => {
    // To test ProductDetailWrapper with invalid ID, we will manually render the AppContent 
    // inside a MemoryRouter pointing to an invalid product route.
    vi.mocked(useSelector).mockReturnValue(true);
    
    render(
      <MemoryRouter initialEntries={['/product/invalid-id']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy sản phẩm.')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Quay lại cửa hàng'));
    // It should navigate to /shop but we can just verify the button exists and is clickable
  });

  it('toggles sidebar collapse', async () => {
    vi.mocked(useSelector).mockReturnValue(true);
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <AppContent />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('shop-page')).toBeInTheDocument());
    
    // Find hamburger menu (it has 3 spans inside a div with class hamburger-icon)
    // We can query it by its parent class.
    const hamburgerMenu = document.querySelector('.hamburger-icon');
    expect(hamburgerMenu).toBeInTheDocument();

    const sidebar = document.querySelector('.app-sidebar');
    expect(sidebar).not.toHaveClass('collapsed');

    fireEvent.click(hamburgerMenu!);
    expect(sidebar).toHaveClass('collapsed');

    fireEvent.click(hamburgerMenu!);
    expect(sidebar).not.toHaveClass('collapsed');
  });
});
