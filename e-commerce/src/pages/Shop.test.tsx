
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

// Mock PocketBase
vi.mock('../services/pocketbase', () => {
  return {
    getFileUrl: vi.fn((record, filename) => filename),
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

    // Type case-insensitive search
    fireEvent.change(searchInput, { target: { value: 'oppo' } });

    expect(screen.queryByText('iPhone 13 128GB')).not.toBeInTheDocument();
    expect(screen.getByText('Oppo Reno 11F')).toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getByText('iPhone 13 128GB')).toBeInTheDocument();
    expect(screen.getByText('Oppo Reno 11F')).toBeInTheDocument();
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

  it('renders empty state when no products match the search term', () => {
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

    // Type a term that matches no products
    fireEvent.change(searchInput, { target: { value: 'NonExistentProduct' } });

    expect(screen.queryByText('iPhone 13 128GB')).not.toBeInTheDocument();
    expect(screen.queryByText('Oppo Reno 11F')).not.toBeInTheDocument();
    expect(screen.getByText('Không tìm thấy sản phẩm nào')).toBeInTheDocument();
    expect(screen.getByText('Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.')).toBeInTheDocument();
  });

  it('filters products based on min and max price', () => {
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

    // Open filter
    const filterBtn = screen.getByTitle('Filters');
    fireEvent.click(filterBtn);

    const selects = screen.getAllByRole('combobox');
    // Mappings based on DOM structure
    // index 0: minPrice
    // index 1: maxPrice
    // index 2: minRating
    // index 3: maxRating
    const minPriceSelect = selects[0];
    const maxPriceSelect = selects[1];

    // Test max price
    fireEvent.change(maxPriceSelect, { target: { value: '10000000' } });

    expect(screen.queryByText('iPhone 13 128GB')).not.toBeInTheDocument();
    expect(screen.getByText('Oppo Reno 11F')).toBeInTheDocument();

    // Test min price
    fireEvent.change(minPriceSelect, { target: { value: '10000000' } });
    fireEvent.change(maxPriceSelect, { target: { value: '999999999' } });

    expect(screen.getByText('iPhone 13 128GB')).toBeInTheDocument();
    expect(screen.queryByText('Oppo Reno 11F')).not.toBeInTheDocument();

    // Changing max below min sets min
    fireEvent.change(maxPriceSelect, { target: { value: '5000000' } });
    expect(minPriceSelect).toHaveValue('5000000');
  });

  it('filters products based on min and max rating', () => {
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

    // Open filter
    const filterBtn = screen.getByTitle('Filters');
    fireEvent.click(filterBtn);

    const selects = screen.getAllByRole('combobox');
    const minRatingSelect = selects[2];
    const maxRatingSelect = selects[3];

    // Test max rating
    fireEvent.change(maxRatingSelect, { target: { value: '4' } });

    expect(screen.queryByText('iPhone 13 128GB')).not.toBeInTheDocument();
    expect(screen.getByText('Oppo Reno 11F')).toBeInTheDocument();

    // Test min rating
    fireEvent.change(minRatingSelect, { target: { value: '5' } });
    fireEvent.change(maxRatingSelect, { target: { value: '5' } });

    expect(screen.getByText('iPhone 13 128GB')).toBeInTheDocument();
    expect(screen.queryByText('Oppo Reno 11F')).not.toBeInTheDocument();

    // Changing max below min sets min
    fireEvent.change(maxRatingSelect, { target: { value: '4' } });
    expect(minRatingSelect).toHaveValue('4');

    // Test changing min sets max if min > max
    fireEvent.change(maxRatingSelect, { target: { value: '1' } });
    fireEvent.change(minRatingSelect, { target: { value: '3' } });
    expect(maxRatingSelect).toHaveValue('3');
  });
});
