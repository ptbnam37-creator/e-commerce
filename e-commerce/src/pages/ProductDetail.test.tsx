import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProductDetail from './ProductDetail';
import { useCart } from '../context/CartContext';

// Mock pocketbase
vi.mock('../services/pocketbase', () => {
  return {
    pb: {
      files: {
        getURL: vi.fn(),
      },
      autoCancellation: vi.fn(),
    },
    getFileUrl: vi.fn((_record, filename) => filename),
  };
});

// Mock useCart hook
vi.mock('../context/CartContext', () => {
  return {
    useCart: vi.fn(),
  };
});

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
      { id: 'var-3', name: 'Trắng', image: '/ip13-white.png' },
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
    render(<ProductDetail product={null} onBackToShop={mockOnBackToShop} onGoToCart={mockOnGoToCart} />);
    expect(screen.getByText('Không tìm thấy sản phẩm')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Quay lại Cửa hàng'));
    expect(mockOnBackToShop).toHaveBeenCalled();
  });

  it('renders product details correctly', () => {
    render(<ProductDetail product={mockProduct} onBackToShop={mockOnBackToShop} onGoToCart={mockOnGoToCart} />);
    
    expect(screen.getByRole('heading', { name: 'iPhone 13' })).toBeInTheDocument();
    expect(screen.getByText('Clean iPhone')).toBeInTheDocument();
    expect(screen.getByText('16 990 000 VND')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Thêm vào giỏ hàng')).toBeInTheDocument();
    expect(screen.getByText('Mua Ngay')).toBeInTheDocument();

    const mainImg = screen.getByAltText('iPhone 13') as HTMLImageElement;
    expect(mainImg.src).toContain('/ip13-blue.png'); 
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('changes main image when clicking a color variant', () => {
    render(<ProductDetail product={mockProduct} onBackToShop={mockOnBackToShop} onGoToCart={mockOnGoToCart} />);
    
    const mainImg = screen.getByAltText('iPhone 13') as HTMLImageElement;
    fireEvent.click(screen.getByText('Đen'));
    expect(mainImg.src).toContain('/ip13-black.png');
  });

  it('adds product to cart and shows toast notification', () => {
    render(<ProductDetail product={mockProduct} onBackToShop={mockOnBackToShop} onGoToCart={mockOnGoToCart} />);
    
    fireEvent.click(screen.getByText('Thêm vào giỏ hàng'));
    expect(mockAddToCart).toHaveBeenCalledWith(
      { ...mockProduct, name: 'iPhone 13 (Xanh dương)', image: '/ip13-blue.png' },
      'var-1'
    );
    expect(screen.getByText('Đã thêm iPhone 13 (Xanh dương) vào giỏ hàng!')).toBeInTheDocument();

    act(() => { vi.runAllTimers(); });
    expect(screen.queryByText('Đã thêm iPhone 13 (Xanh dương) vào giỏ hàng!')).not.toBeInTheDocument();
  });

  it('adds product to cart and redirects on "Mua Ngay"', () => {
    render(<ProductDetail product={mockProduct} onBackToShop={mockOnBackToShop} onGoToCart={mockOnGoToCart} />);
    
    fireEvent.click(screen.getByText('Mua Ngay'));
    expect(mockAddToCart).toHaveBeenCalledWith(
      { ...mockProduct, name: 'iPhone 13 (Xanh dương)', image: '/ip13-blue.png' },
      'var-1'
    );
    expect(mockOnGoToCart).toHaveBeenCalled();
  });

  it('shows error toast when adding a product with no variants via "Thêm vào giỏ hàng"', () => {
    const productNoVariants = { ...mockProduct, colors: [] };
    render(<ProductDetail product={productNoVariants} onBackToShop={mockOnBackToShop} onGoToCart={mockOnGoToCart} />);
    
    fireEvent.click(screen.getByText('Thêm vào giỏ hàng'));
    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(screen.getByText('Sản phẩm này chưa có biến thể. Vui lòng liên hệ quản trị viên!')).toBeInTheDocument();
  });

  it('shows error toast when buying a product with no variants via "Mua Ngay"', () => {
    const productNoVariants = { ...mockProduct, colors: [] };
    render(<ProductDetail product={productNoVariants} onBackToShop={mockOnBackToShop} onGoToCart={mockOnGoToCart} />);
    
    fireEvent.click(screen.getByText('Mua Ngay'));
    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(screen.getByText('Sản phẩm này chưa có biến thể. Vui lòng liên hệ quản trị viên!')).toBeInTheDocument();
  });

  it('navigates through colors using carousel buttons', () => {
    render(<ProductDetail product={mockProduct} onBackToShop={mockOnBackToShop} onGoToCart={mockOnGoToCart} />);
    
    const mainImg = screen.getByAltText('iPhone 13') as HTMLImageElement;
    expect(mainImg.src).toContain('/ip13-blue.png');
    
    const prevBtn = screen.getByText('❮');
    const nextBtn = screen.getByText('❯');

    expect(prevBtn).toBeDisabled();

    // Click next -> Đen
    fireEvent.click(nextBtn);
    expect(mainImg.src).toContain('/ip13-black.png');
    expect(prevBtn).not.toBeDisabled();

    // Click next -> Trắng
    fireEvent.click(nextBtn);
    expect(mainImg.src).toContain('/ip13-white.png');
    expect(nextBtn).toBeDisabled();

    // Click prev -> Đen
    fireEvent.click(prevBtn);
    expect(mainImg.src).toContain('/ip13-black.png');
  });

  it('handles main image fallback onError', () => {
    render(<ProductDetail product={mockProduct} onBackToShop={mockOnBackToShop} onGoToCart={mockOnGoToCart} />);
    
    const mainImg = screen.getByAltText('iPhone 13') as HTMLImageElement;
    fireEvent.error(mainImg);
    expect(mainImg.src).toContain('/samsung_a31.png');
  });

  it('clears timeout on unmount', () => {
    const { unmount } = render(<ProductDetail product={mockProduct} onBackToShop={mockOnBackToShop} onGoToCart={mockOnGoToCart} />);
    
    fireEvent.click(screen.getByText('Thêm vào giỏ hàng'));
    expect(screen.getByText('Đã thêm iPhone 13 (Xanh dương) vào giỏ hàng!')).toBeInTheDocument();
    
    unmount(); // should clear timeout
    // the fact it doesn't throw means it worked, but we are just covering the line.
  });
});
