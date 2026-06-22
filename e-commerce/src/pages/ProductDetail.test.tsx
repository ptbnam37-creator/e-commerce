import React from 'react';
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

describe('ProductDetail Component', () => {
  const mockOnBackToShop = vi.fn();
  const mockOnGoToCart = vi.fn();
  const mockAddToCart = vi.fn();

  const mockProductWithVariants = {
    id: 'prod-1',
    name: 'iPhone 13',
    brand: 'Apple',
    rating: 5,
    description: 'A great phone',
    price: 16990000,
    image: '/ip13-default.png',
    colors: [
      { id: 'var-1', name: 'Xanh dương', image: '/ip13-blue.png' },
      { id: 'var-2', name: 'Đỏ', image: '/ip13-red.png' },
    ],
  };

  const mockProductWithoutVariants = {
    id: 'prod-2',
    name: 'Oppo Reno 11F',
    brand: 'Oppo',
    rating: 4,
    description: 'Another phone',
    price: 8990000,
    image: '/oppo_reno11f.png',
    colors: [],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    mockAddToCart.mockClear();
    mockOnGoToCart.mockClear();
    vi.useFakeTimers();
    vi.mocked(useCart).mockReturnValue({
      products: [],
      cart: [{ id: 'cart-1', quantity: 2 } as any], // Mocking some cart items to test totalItems badge
      addToCart: mockAddToCart,
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    });
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders "Không tìm thấy sản phẩm" when product prop is null', () => {
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
        product={mockProductWithVariants}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    expect(screen.getByText('iPhone 13')).toBeInTheDocument();
    expect(screen.getByText('A great phone')).toBeInTheDocument();
    expect(screen.getByText('16 990 000 VND')).toBeInTheDocument();

    // Check main image
    const mainImg = screen.getByAltText('iPhone 13') as HTMLImageElement;
    expect(mainImg).toHaveAttribute('src', '/ip13-blue.png'); // Defaults to first variant image

    // Check color variants are rendered
    expect(screen.getByText('Xanh dương')).toBeInTheDocument();
    expect(screen.getByText('Đỏ')).toBeInTheDocument();
  });

  it('handles selecting a color variant', () => {
    render(
      <ProductDetail
        product={mockProductWithVariants}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    const mainImg = screen.getByAltText('iPhone 13') as HTMLImageElement;
    expect(mainImg.src).toContain('/ip13-blue.png');

    // Click on 'Đỏ' variant
    const redVariant = screen.getByText('Đỏ').closest('div')?.parentElement;
    if (redVariant) {
      fireEvent.click(redVariant);
    }

    // Main image should update to red variant image
    expect(mainImg.src).toContain('/ip13-red.png');
  });

  it('handles "Thêm vào giỏ hàng" and displays toast', () => {
    render(
      <ProductDetail
        product={mockProductWithVariants}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    const addToCartBtn = screen.getByText('Thêm vào giỏ hàng');
    fireEvent.click(addToCartBtn);

    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'iPhone 13 (Xanh dương)',
        image: '/ip13-blue.png'
      }),
      'var-1'
    );

    // Check toast
    expect(screen.getByText('Đã thêm iPhone 13 (Xanh dương) vào giỏ hàng!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Toast should disappear
    expect(screen.queryByText('Đã thêm iPhone 13 (Xanh dương) vào giỏ hàng!')).not.toBeInTheDocument();
  });

  it('handles "Mua Ngay" action', () => {
    render(
      <ProductDetail
        product={mockProductWithVariants}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    const buyNowBtn = screen.getByText('Mua Ngay');
    fireEvent.click(buyNowBtn);

    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'iPhone 13 (Xanh dương)',
        image: '/ip13-blue.png'
      }),
      'var-1'
    );
    expect(mockOnGoToCart).toHaveBeenCalled();
  });

  it('shows alert when product has no variants and trying to add to cart', () => {
    render(
      <ProductDetail
        product={mockProductWithoutVariants}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    const addToCartBtn = screen.getByText('Thêm vào giỏ hàng');
    fireEvent.click(addToCartBtn);

    expect(window.alert).toHaveBeenCalledWith('Sản phẩm này chưa có biến thể. Vui lòng liên hệ quản trị viên!');
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it('shows alert when product has no variants and trying to buy now', () => {
    render(
      <ProductDetail
        product={mockProductWithoutVariants}
        onBackToShop={mockOnBackToShop}
        onGoToCart={mockOnGoToCart}
      />
    );

    const buyNowBtn = screen.getByText('Mua Ngay');
    fireEvent.click(buyNowBtn);

    expect(window.alert).toHaveBeenCalledWith('Sản phẩm này chưa có biến thể. Vui lòng liên hệ quản trị viên!');
    expect(mockAddToCart).not.toHaveBeenCalled();
    expect(mockOnGoToCart).not.toHaveBeenCalled();
  });
});
