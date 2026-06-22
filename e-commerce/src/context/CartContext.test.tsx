import React from 'react';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { render, screen, waitFor, renderHook } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { pb } from '../services/pocketbase';

// Mock PocketBase
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
    pb: {
      collection: vi.fn().mockImplementation((name) => {
        return {
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
            return Promise.resolve([]);
          }),
        };
      }),
      authStore: {
        isValid: false,
        model: null,
        onChange: vi.fn().mockReturnValue(() => {}),
      },
      files: {
        getURL: vi.fn().mockReturnValue('/placeholder.png'),
      }
    },
    getFileUrl: vi.fn().mockReturnValue('/placeholder.png'),
  };
});

// A simple test component to consume the context
const TestComponent = () => {
  const { cart, products } = useCart();
  return (
    <div>
      <div data-testid="products-length">{products.length}</div>
      <div data-testid="cart-length">{cart.length}</div>
      <div data-testid="first-item-name">{cart.length > 0 ? cart[0].name : 'Empty'}</div>
      <div data-testid="first-item-qty">{cart.length > 0 ? cart[0].quantity : '0'}</div>
    </div>
  );
};

describe('CartContext with PocketBase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pb.authStore.isValid = false;
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
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-123' };

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
});

describe('useCart', () => {
  it('throws an error if used outside of CartProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useCart())).toThrow('useCart must be used within a CartProvider');

    consoleError.mockRestore();
  });
});
