import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Shop from './Shop';
import { useCart } from '../context/CartContext';

// Mock useCart hook
vi.mock('../context/CartContext', () => {
  return {
    useCart: vi.fn(),
  };
});

// Mock pocketbase
vi.mock('../services/pocketbase', () => {
  return {
    getFileUrl: vi.fn((_record, filename) => filename),
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
      image: ['/ip13-green.png'], // Test array image branch
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
      isLoadingProducts: false,
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

  it('shows loading state', () => {
    vi.mocked(useCart).mockReturnValue({
      products: [],
      isLoadingProducts: true,
      cart: [],
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    });

    render(<Shop onSelectProduct={mockOnSelectProduct} />);
    expect(screen.getByText('Đang tải sản phẩm...')).toBeInTheDocument();
  });

  it('filters products based on search input', async () => {
    vi.mocked(useCart).mockReturnValue({
      products: mockProducts,
      isLoadingProducts: false,
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
    
    fireEvent.change(searchInput, { target: { value: 'iPhone' } });
    await waitFor(() => {
      expect(screen.getByText('iPhone 13 128GB')).toBeInTheDocument();
      expect(screen.queryByText('Oppo Reno 11F')).not.toBeInTheDocument();
    });
  });

  it('renders empty state when no products match the search term', async () => {
    vi.mocked(useCart).mockReturnValue({
      products: mockProducts,
      isLoadingProducts: false,
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

    fireEvent.change(searchInput, { target: { value: 'NonExistentProduct' } });

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy sản phẩm nào')).toBeInTheDocument();
    });
  });

  it('filters products based on min and max price', () => {
    vi.mocked(useCart).mockReturnValue({
      products: mockProducts,
      isLoadingProducts: false,
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
    fireEvent.click(screen.getByTitle('Filters'));

    const selects = screen.getAllByRole('combobox');
    const minPriceSelect = selects[0];
    const maxPriceSelect = selects[1];

    fireEvent.change(maxPriceSelect, { target: { value: '10000000' } });
    expect(screen.queryByText('iPhone 13 128GB')).not.toBeInTheDocument();
    expect(screen.getByText('Oppo Reno 11F')).toBeInTheDocument();

    fireEvent.change(minPriceSelect, { target: { value: '10000000' } });
    fireEvent.change(maxPriceSelect, { target: { value: '999999999' } });
    expect(screen.getByText('iPhone 13 128GB')).toBeInTheDocument();
    
    // Changing min > max sets max = min
    fireEvent.change(maxPriceSelect, { target: { value: '5000000' } });
    fireEvent.change(minPriceSelect, { target: { value: '10000000' } });
    expect(maxPriceSelect).toHaveValue('10000000');
  });

  it('resets filters when clicking Reset', () => {
    vi.mocked(useCart).mockReturnValue({
      products: mockProducts,
      isLoadingProducts: false,
      cart: [],
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    });

    render(<Shop onSelectProduct={mockOnSelectProduct} />);
    fireEvent.click(screen.getByTitle('Filters'));

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: '10000000' } }); // max price
    expect(screen.queryByText('iPhone 13 128GB')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByText('iPhone 13 128GB')).toBeInTheDocument();
  });

  it('closes filter dropdown on outside click', () => {
    vi.mocked(useCart).mockReturnValue({
      products: mockProducts,
      isLoadingProducts: false,
      cart: [],
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    });

    render(
      <div>
        <div data-testid="outside">Outside</div>
        <Shop onSelectProduct={mockOnSelectProduct} />
      </div>
    );

    fireEvent.click(screen.getByTitle('Filters'));
    expect(screen.getByText('Filter')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('Filter')).not.toBeInTheDocument();
  });

  it('handles image fallback onError', () => {
    vi.mocked(useCart).mockReturnValue({
      products: mockProducts,
      isLoadingProducts: false,
      cart: [],
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    });

    render(<Shop onSelectProduct={mockOnSelectProduct} />);
    
    const images = screen.getAllByRole('img');
    fireEvent.error(images[0]); // simulate error
    expect(images[0]).toHaveAttribute('src', '/samsung_a31.png');
  });

  it('handles pagination correctly', () => {
    // Generate 20 products
    const manyProducts = Array.from({ length: 20 }, (_, i) => ({
      id: `p-${i}`,
      name: `Product ${i + 1}`,
      brand: 'Brand',
      rating: 5,
      description: 'Desc',
      price: 1000,
      image: `img-${i}.png`,
      colors: [],
    }));

    vi.mocked(useCart).mockReturnValue({
      products: manyProducts,
      isLoadingProducts: false,
      cart: [],
      addToCart: vi.fn(),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      subTotal: 0,
      tax: 0,
      total: 0,
    });

    // Default window inner width is large enough so it displays multiple per page
    // Let's force a resize to re-calculate items per page
    act(() => {
      window.innerWidth = 800;
      window.innerHeight = 800; // should calculate itemsPerPage = 4 on mobile, let's see.
      window.dispatchEvent(new Event('resize'));
    });

    render(<Shop onSelectProduct={mockOnSelectProduct} />);

    // Should render Product 1, but not Product 20
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.queryByText('Product 20')).not.toBeInTheDocument();

    // Click next page
    const nextBtns = screen.getAllByRole('button').filter(b => !b.hasAttribute('title'));
    // Usually buttons: filter, first, prev, next, last
    const nextBtn = nextBtns[2]; 
    fireEvent.click(nextBtn);

    expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    
    // Click last page
    const lastBtn = nextBtns[3];
    fireEvent.click(lastBtn);

    expect(screen.getByText('Product 20')).toBeInTheDocument();

    // Click first page
    const firstBtn = nextBtns[0];
    fireEvent.click(firstBtn);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });
});
