import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProductDetail from './ProductDetail';
import { useCart } from '../context/CartContext';

// Mock useCart hook
vi.mock('../context/CartContext', () => {
  return {
    useCart: vi.fn(),
  };
});

// Mock Pocketbase getFileUrl
vi.mock('../services/pocketbase', () => ({
  getFileUrl: vi.fn((record, filename) => {
    return filename;
  })
}));

describe('ProductDetail Component', () => {
  const mockOnBackToShop = vi.fn();
  const mockOnGoToCart = vi.fn();
  const mockAddToCart = vi.fn();

  const mockProduct = {
    id: 'prod-1',
    name: 'iPhone 13',
    brand: 'Apple',
    rating: 5,
    description: 'Clean iPhone',
    price: 16990000,
    image: '/ip13-default.png',
    colors: [
      { id: 'var-1', name: 'Xanh dương', image: '/ip13-blue.png' },
      { id: 'var-2', name: 'Đen', image: '/ip13-black.png' },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    mockOnBackToShop.mockClear();
    mockOnGoToCart.mockClear();
    mockAddToCart.mockClear();
    vi.useFakeTimers();

    vi.mocked(useCart).mockReturnValue({
      products: [],
      cart: [{ id: 'prod-1', cartId: 'c1', quantity: 2, price: 16990000, name: 'iPhone 13', brand: 'Apple', rating: 5, description: '', image: '', colors: [], variantId: 'var-1' }],
      addToCart: mockAddToCart,
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders "Không tìm thấy sản phẩm" empty state if product is null', () => {
    render(
      <ProductDetail
        product={null}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    expect(screen.getByText('Không tìm thấy sản phẩm')).toBeInTheDocument();

    const backBtn = screen.getByText('Quay lại Cửa hàng');
    fireEvent.click(backBtn);
    expect(mockOnBackToShop).toHaveBeenCalled();
  });

  it('renders product details correctly', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    // Product name
    expect(screen.getByRole('heading', { name: 'iPhone 13' })).toBeInTheDocument();
    // Description
    expect(screen.getByText('Clean iPhone')).toBeInTheDocument();
    // Price formatted
    expect(screen.getByText('16 990 000 VND')).toBeInTheDocument();
    // Rating
    expect(screen.getByText('5')).toBeInTheDocument();
    // Buttons
    expect(screen.getByText('Thêm vào giỏ hàng')).toBeInTheDocument();
    expect(screen.getByText('Mua Ngay')).toBeInTheDocument();

    // Image
    const mainImg = screen.getByAltText('iPhone 13') as HTMLImageElement;
    expect(mainImg.src).toContain('/ip13-blue.png'); // Default is first color image

    // Mini Cart
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 items in mock cart
  });

  it('changes main image when clicking a color variant', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    const mainImg = screen.getByAltText('iPhone 13') as HTMLImageElement;
    expect(mainImg.src).toContain('/ip13-blue.png');

    const blackColor = screen.getByText('Đen');
    fireEvent.click(blackColor);

    expect(mainImg.src).toContain('/ip13-black.png');
  });

  it('adds product to cart and shows toast notification on "Thêm vào giỏ hàng"', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    const addBtn = screen.getByText('Thêm vào giỏ hàng');
    act(() => {
      fireEvent.click(addBtn);
    });

    expect(mockAddToCart).toHaveBeenCalledWith(
      {
        ...mockProduct,
        name: 'iPhone 13 (Xanh dương)',
        image: '/ip13-blue.png',
      },
      'var-1'
    );

    // Toast should appear
    expect(screen.getByText('Đã thêm iPhone 13 (Xanh dương) vào giỏ hàng!')).toBeInTheDocument();

    // Fast-forward time to test toast disappearance (2000ms timeout)
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByText('Đã thêm iPhone 13 (Xanh dương) vào giỏ hàng!')).not.toBeInTheDocument();
  });

  it('adds product to cart and redirects on "Mua Ngay"', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    const buyNowBtn = screen.getByText('Mua Ngay');
    act(() => {
      fireEvent.click(buyNowBtn);
    });

    expect(mockAddToCart).toHaveBeenCalledWith(
      {
        ...mockProduct,
        name: 'iPhone 13 (Xanh dương)',
        image: '/ip13-blue.png',
      },
      'var-1'
    );
    expect(mockOnGoToCart).toHaveBeenCalled();
  });

  it('shows error toast when adding a product with no variants', async () => {
    const productNoVariants = {
      ...mockProduct,
      colors: [],
    };

    render(
      <ProductDetail
        product={productNoVariants}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    const addBtn = screen.getByText('Thêm vào giỏ hàng');
    act(() => {
      fireEvent.click(addBtn);
    });

    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(screen.getByText('Sản phẩm này chưa có biến thể. Vui lòng liên hệ quản trị viên!')).toBeInTheDocument();

    // Fast-forward time to handle toast timeout update
    act(() => {
      vi.runAllTimers();
    });
  });
});
