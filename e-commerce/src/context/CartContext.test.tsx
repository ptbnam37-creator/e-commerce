
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { render, screen, waitFor, renderHook } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { pb } from '../services/pocketbase';

// Mock PocketBase
export const mockUpdate = vi.fn().mockResolvedValue({});
export const mockDelete = vi.fn().mockResolvedValue({});

vi.mock('../services/pocketbase', () => {
  const mockCartList = [
    {
      id: 'cart-record-1',
      number: 2,
      expand: {
        product: {
          id: 'variant-1',
          color: 'Xanh dương',
          expand: {
            productId: {
              id: 'prod-1',
              name: 'iPhone 13',
              brand: 'Apple',
              price: 16900000,
              rating: 5,
              image: 'ip13-blue.png'
            }
          }
        }
      }
    }
  ];

  return {
    getFileUrl: vi.fn().mockReturnValue('/placeholder.png'),
    pb: {
      collection: vi.fn().mockImplementation((name) => {
        return {
          update: mockUpdate,
          delete: mockDelete,
          getFullList: vi.fn().mockImplementation(() => {
            if (name === 'cart') {
              return Promise.resolve(mockCartList);
            }
            if (name === 'product') {
              return Promise.resolve([
                {
                  id: 'prod-1',
                  name: 'iPhone 13',
                  brand: 'Apple',
                  price: 16900000,
                  rating: 5,
                  image: 'ip13-blue.png',
                  expand: {
                    'color_variants(productId)': [
                      { id: 'variant-1', productId: 'prod-1', color: 'Xanh dương', image: 'ip13-blue.png' }
                    ]
                  }
                }
              ]);
            }
            return Promise.resolve([{ id: "prod-1", name: "iPhone 13", brand: "Apple", price: 16900000, rating: 5, image: "ip13-blue.png", expand: { "color_variants(productId)": [{ id: "variant-1", productId: "prod-1", color: "Xanh dương", image: "ip13-blue.png" }] } }]);
          }),
          create: vi.fn(),

        };
      }),
      authStore: {
        isValid: false,
        model: null,
        onChange: vi.fn().mockReturnValue(() => {}),
      },
      files: {
        getFileUrl: vi.fn().mockReturnValue('/placeholder.png'),
      }
    },
    }
});

// A simple test component to consume the context
const TestComponent = () => {
  const { cart, products, updateQuantity, removeFromCart } = useCart();
  return (
    <div>
      <div data-testid="products-length">{products.length}</div>
      <div data-testid="cart-length">{cart.length}</div>
      <div data-testid="first-item-name">{cart.length > 0 ? cart[0].name : 'Empty'}</div>
      <div data-testid="first-item-qty">{cart.length > 0 ? cart[0].quantity : '0'}</div>
      <button data-testid="update-qty-btn" onClick={() => updateQuantity('cart-record-1', -5)}>Update Qty</button>
      <button data-testid="update-qty-btn-not-exist" onClick={() => updateQuantity('cart-record-not-exist', -5)}>Update Qty Not Exist</button>
      <button data-testid="remove-from-cart-btn" onClick={() => removeFromCart('cart-record-1')}>Remove</button>
    </div>
  );
};

describe('CartContext with PocketBase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // @ts-expect-error: mock readonly
    pb.authStore.isValid = false;
    // @ts-expect-error: mock readonly
    pb.authStore.model = null;
  });

  it('keeps cart empty when user is not logged in', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Should load products
    await waitFor(() => {
      expect(screen.getByTestId('products-length')).toHaveTextContent('1');
    });

    // Cart remains empty
    expect(screen.getByTestId('cart-length')).toHaveTextContent('0');
    expect(screen.getByTestId('first-item-name')).toHaveTextContent('Empty');
  });

  it('loads cart items from PocketBase when user is logged in', async () => {
    // Simulate logged in user
    // @ts-expect-error: mock readonly
    pb.authStore.isValid = true;
    // @ts-expect-error: mock readonly
    pb.authStore.model = { id: 'user-1' };

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Should load products and cart items
    await waitFor(() => {
      expect(screen.getByTestId('products-length')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-length')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('first-item-name')).toHaveTextContent('iPhone 13 (Xanh dương)');
    expect(screen.getByTestId('first-item-qty')).toHaveTextContent('2');
  });

  it('handles errors when removing from cart', async () => {
    // Simulate logged in user
    // @ts-expect-error: mock readonly
    pb.authStore.isValid = true;
    // @ts-expect-error: mock readonly
    pb.authStore.model = { id: 'user-1' };

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockError = new Error('Test delete error');
    mockDelete.mockRejectedValueOnce(mockError);

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('cart-length')).toHaveTextContent('1');
    });

    // Click remove
    screen.getByTestId('remove-from-cart-btn').click();

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to remove from cart on PocketBase:',
        mockError
      );
    });

    // Cart length should still be 1 because it reverted
    expect(screen.getByTestId('cart-length')).toHaveTextContent('1');

    consoleWarnSpy.mockRestore();
  });

  it('handles errors when loading products', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.mocked(pb.collection).mockImplementation((name) => {
      if (name === 'product') {
        return {
          getFullList: vi.fn().mockRejectedValue(new Error('Test fetch error'))
        } as unknown as ReturnType<typeof pb.collection>;
      }
      return {
        getFullList: vi.fn().mockResolvedValue([])
      } as unknown as ReturnType<typeof pb.collection>;
    });

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'PocketBase product/variants fetch failed.',
        expect.any(Error)
      );
    });

    consoleWarnSpy.mockRestore();
  });
});

describe('useCart', () => {
  it('throws an error if used outside of CartProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useCart())).toThrow('useCart must be used within a CartProvider');

    consoleError.mockRestore();
  });
});
