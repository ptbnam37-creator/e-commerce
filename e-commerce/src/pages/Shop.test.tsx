import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Shop from './Shop';
import { useCart } from '../context/CartContext';

// Mock useCart hook
vi.mock('../context/CartContext', () => {
  return {
    useCart: vi.fn(),
  };
});

describe('Shop Component', () => {
  const mockOnSelectProduct = vi.fn();
  const mockProducts = [
    {
      id: 'prod-1',
      name: 'iPhone 13 128GB',
      brand: 'Apple',
      rating: 5,
      description: 'Clean iPhone',
      price: 16990000,
      image: '/ip13-green.png',
      colors: [],
    },
    {
      id: 'prod-2',
      name: 'Oppo Reno 11F',
      brand: 'Oppo',
      rating: 4,
      description: 'Oppo phone',
      price: 8990000,
      image: '/oppo_reno11f.png',
      colors: [],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    mockOnSelectProduct.mockClear();
  });

  it('renders search bar and list of products', () => {
    vi.mocked(useCart).mockReturnValue({
      products: mockProducts,
      cart: [],
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    });

    render(<Shop onSelectProduct={mockOnSelectProduct} />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('iPhone 13 128GB')).toBeInTheDocument();
    expect(screen.getByText('Oppo Reno 11F')).toBeInTheDocument();
    expect(screen.getByText('16 990 000 VND')).toBeInTheDocument();
    expect(screen.getByText('8 990 000 VND')).toBeInTheDocument();
  });

  it('filters products based on search input', () => {
    vi.mocked(useCart).mockReturnValue({
      products: mockProducts,
      cart: [],
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    });

    render(<Shop onSelectProduct={mockOnSelectProduct} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    
    // Type 'iPhone'
    fireEvent.change(searchInput, { target: { value: 'iPhone' } });

    expect(screen.getByText('iPhone 13 128GB')).toBeInTheDocument();
    expect(screen.queryByText('Oppo Reno 11F')).not.toBeInTheDocument();
  });

  it('triggers onSelectProduct callback when clicking a product card', () => {
    vi.mocked(useCart).mockReturnValue({
      products: mockProducts,
      cart: [],
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    });

    render(<Shop onSelectProduct={mockOnSelectProduct} />);

    const productCard = screen.getByText('iPhone 13 128GB').closest('.product-card')!;
    fireEvent.click(productCard);

    expect(mockOnSelectProduct).toHaveBeenCalledWith(mockProducts[0]);
  });
});
