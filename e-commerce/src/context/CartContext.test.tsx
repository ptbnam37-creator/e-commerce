import React from 'react';
import { render, screen } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

// A simple test component to consume the context
const TestComponent = () => {
  const { cart } = useCart();
  return (
    <div>
      <div data-testid="cart-length">{cart.length}</div>
      <div data-testid="first-item-name">{cart.length > 0 ? cart[0].name : 'Empty'}</div>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear console mocks
    vi.restoreAllMocks();
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    // Mock localStorage to return invalid JSON
    localStorage.setItem('cart', '{ invalid json');

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Verify console.error was called
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to parse cart from localStorage:',
      expect.any(SyntaxError)
    );

    // Verify fallback to empty cart
    expect(screen.getByTestId('cart-length')).toHaveTextContent('0');
    expect(screen.getByTestId('first-item-name')).toHaveTextContent('Empty');
  });

  it('loads valid cart from localStorage', () => {
    const validCart = [
      {
        id: 3,
        name: 'Điện thoại iPhone 13 128GB',
        brand: 'Apple',
        rating: 5,
        description: 'test',
        price: 16990000,
        image: '/ip13-green.png',
        colors: [],
        quantity: 1,
        cartId: 'test-cart-id'
      }
    ];
    localStorage.setItem('cart', JSON.stringify(validCart));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-length')).toHaveTextContent('1');
    expect(screen.getByTestId('first-item-name')).toHaveTextContent('Điện thoại iPhone 13 128GB');
  });
});
