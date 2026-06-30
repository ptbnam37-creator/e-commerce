
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cart from './Cart';
import { useCart } from '../context/CartContext.tsx';

// Mock the useCart hook
vi.mock('../context/CartContext.tsx', () => {
  return {
    useCart: vi.fn(),
  };
});

describe('Cart Component', () => {
  const mockUpdateQuantity = vi.fn();
  const mockRemoveFromCart = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders empty state when cart is empty', () => {
    vi.mocked(useCart).mockReturnValue({
      products: [],
      cart: [],
      addToCart: vi.fn(),
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      subTotal: 0,
      tax: 0,
      total: 0,
    });

    render(<Cart />);

    expect(screen.getByText('Giỏ hàng của bạn đang trống')).toBeInTheDocument();
    expect(screen.getByText('Hãy quay lại trang Shop để thêm sản phẩm vào giỏ hàng.')).toBeInTheDocument();
  });

  it('renders cart items and summary correctly', () => {
    const mockCartItems = [
      {
        id: 'prod-1',
        cartId: 'cart-1',
        name: 'iPhone 13 (Xanh dương)',
        brand: 'Apple',
        rating: 5,
        description: 'Màu xanh dương đẹp mắt',
        price: 16000000,
        image: '/ip13-blue.png',
        colors: [],
        quantity: 2,
        variantId: 'variant-1',
      },
    ];

    vi.mocked(useCart).mockReturnValue({
      products: [],
      cart: mockCartItems,
      addToCart: vi.fn(),
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      subTotal: 32000000,
      tax: 3200000,
      total: 35200000,
    });

    render(<Cart />);

    // Check item details
    expect(screen.getByText('iPhone 13 (Xanh dương)')).toBeInTheDocument();
    expect(screen.getByText('Màu xanh dương đẹp mắt')).toBeInTheDocument();
    expect(screen.getByText('16 000 000 VND')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check totals
    expect(screen.getByText('32 000 000 VND')).toBeInTheDocument(); // Subtotal
    expect(screen.getByText('3 200 000 VND')).toBeInTheDocument(); // Tax
    expect(screen.getByText('35 200 000 VND')).toBeInTheDocument(); // Total
  });

  it('handles actions like quantity updates and removal', () => {
    const mockCartItems = [
      {
        id: 'prod-1',
        cartId: 'cart-1',
        name: 'iPhone 13',
        brand: 'Apple',
        rating: 5,
        description: 'Description',
        price: 16000000,
        image: '/ip13-blue.png',
        colors: [],
        quantity: 1,
        variantId: 'variant-1',
      },
    ];

    vi.mocked(useCart).mockReturnValue({
      products: [],
      cart: mockCartItems,
      addToCart: vi.fn(),
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      subTotal: 16000000,
      tax: 1600000,
      total: 17600000,
    });

    render(<Cart />);

    // Click increment button (+)
    const incrementBtn = screen.getByText('+');
    fireEvent.click(incrementBtn);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('cart-1', 1);

    // Click remove button (title="Xóa sản phẩm")
    const removeBtn = screen.getByTitle('Xóa sản phẩm');
    fireEvent.click(removeBtn);
    
    // Verify modal appears
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    
    // Cancel deletion
    const cancelBtn = screen.getByText('Huỷ');
    fireEvent.click(cancelBtn);
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    expect(mockRemoveFromCart).not.toHaveBeenCalled();

    // Re-open modal and confirm deletion
    fireEvent.click(removeBtn);
    const confirmBtn = screen.getByText('Xoá');
    fireEvent.click(confirmBtn);
    
    expect(mockRemoveFromCart).toHaveBeenCalledWith('cart-1');
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    const mockCartItems = [
      {
        id: 'prod-large-num',
        cartId: 'cart-2',
        name: 'Super Expensive Item',
        brand: 'Luxury',
        rating: 5,
        description: 'Very expensive',
        price: 1234567890,
        image: '/expensive.png',
        colors: [],
        quantity: 1,
        variantId: 'variant-2',
      },
    ];

    vi.mocked(useCart).mockReturnValue({
      products: [],
      cart: mockCartItems,
      addToCart: vi.fn(),
      updateQuantity: mockUpdateQuantity,
      removeFromCart: mockRemoveFromCart,
      subTotal: 1234567890,
      tax: 123456789,
      total: 1358024679,
    });

    render(<Cart />);

    // Format expected prices based on the formatPrice function inside Cart.tsx:
    // 1234567890 -> "1 234 567 890 VND"
    // 123456789 -> "123 456 789 VND"
    // 1358024679 -> "1 358 024 679 VND"

    // Both the item price and the subtotal will be '1 234 567 890 VND'
    const elements = screen.getAllByText('1 234 567 890 VND');
    expect(elements).toHaveLength(2);
    expect(elements[0]).toBeInTheDocument();
    expect(elements[1]).toBeInTheDocument();

    // Check totals
    expect(screen.getByText('123 456 789 VND')).toBeInTheDocument(); // Tax
    expect(screen.getByText('1 358 024 679 VND')).toBeInTheDocument(); // Total
  });
});
