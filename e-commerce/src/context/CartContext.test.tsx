import { describe, beforeEach, it, expect, vi } from 'vitest';
import { render, screen, waitFor, renderHook, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { pb } from '../services/pocketbase';

export const mockUpdate = vi.fn().mockResolvedValue({});
export const mockDelete = vi.fn().mockResolvedValue({});
export const mockCreate = vi.fn().mockResolvedValue({ id: 'new-cart-id' });

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
          create: mockCreate,
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
                  image: ['ip13-blue.png'],
                  expand: {
                    'color_variants(productId)': [
                      { id: 'variant-1', productId: 'prod-1', color: 'Xanh dương', image: ['ip13-blue.png'] },
                      { id: 'variant-2', productId: 'prod-1', color: 'Đen', image: 'ip13-black.png' }
                    ]
                  }
                },
                {
                  id: 'prod-2',
                  name: 'No image prod',
                  brand: 'Samsung',
                  price: 100,
                  image: ''
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
        getFileUrl: vi.fn().mockReturnValue('/placeholder.png'),
      }
    },
  };
});

const TestComponent = () => {
  const { cart, products, updateQuantity, removeFromCart, addToCart } = useCart();
  return (
    <div>
      <div data-testid="products-length">{products.length}</div>
      <div data-testid="cart-length">{cart.length}</div>
      <div data-testid="first-item-name">{cart.length > 0 ? cart[0].name : 'Empty'}</div>
      <div data-testid="first-item-qty">{cart.length > 0 ? cart[0].quantity : '0'}</div>
      
      <button data-testid="add-new-btn" onClick={() => addToCart(products[0], 'variant-2')}>Add New Variant</button>
      <button data-testid="add-existing-btn" onClick={() => addToCart(products[0], 'variant-1')}>Add Existing Variant</button>
      <button data-testid="add-no-variant-btn" onClick={() => addToCart(products[0])}>Add No Variant</button>
      
      <button data-testid="update-qty-btn" onClick={() => updateQuantity('cart-record-1', 1)}>Update Qty</button>
      <button data-testid="update-qty-btn-neg" onClick={() => updateQuantity('cart-record-1', -10)}>Update Qty Neg</button>
      <button data-testid="update-qty-not-exist" onClick={() => updateQuantity('missing-id', 1)}>Update Qty Missing</button>
      
      <button data-testid="remove-from-cart-btn" onClick={() => removeFromCart('cart-record-1')}>Remove</button>
    </div>
  );
};

describe('CartContext with PocketBase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pb.authStore.isValid = false;
    pb.authStore.model = null;
    mockCreate.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
  });

  it('keeps cart empty when user is not logged in', async () => {
    render(<CartProvider><TestComponent /></CartProvider>);
    await waitFor(() => expect(screen.getByTestId('products-length')).toHaveTextContent('2'));
    expect(screen.getByTestId('cart-length')).toHaveTextContent('0');
  });

  it('loads cart items from PocketBase when user is logged in', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-1' };
    render(<CartProvider><TestComponent /></CartProvider>);
    
    await waitFor(() => {
      expect(screen.getByTestId('products-length')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-length')).toHaveTextContent('1');
    });
    expect(screen.getByTestId('first-item-name')).toHaveTextContent('iPhone 13 (Xanh dương)');
    expect(screen.getByTestId('first-item-qty')).toHaveTextContent('2');
  });

  it('addToCart alerts if not logged in', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<CartProvider><TestComponent /></CartProvider>);
    await waitFor(() => expect(screen.getByTestId('products-length')).toHaveTextContent('2'));
    
    fireEvent.click(screen.getByTestId('add-new-btn'));
    expect(alertSpy).toHaveBeenCalledWith('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
    alertSpy.mockRestore();
  });

  it('addToCart handles existing variant', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-1' };
    render(<CartProvider><TestComponent /></CartProvider>);
    
    await waitFor(() => expect(screen.getByTestId('cart-length')).toHaveTextContent('1'));
    fireEvent.click(screen.getByTestId('add-existing-btn'));
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(screen.getByTestId('first-item-qty')).toHaveTextContent('3');
    });
  });

  it('addToCart handles new variant', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-1' };
    render(<CartProvider><TestComponent /></CartProvider>);
    
    await waitFor(() => expect(screen.getByTestId('cart-length')).toHaveTextContent('1'));
    fireEvent.click(screen.getByTestId('add-new-btn'));
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
      expect(screen.getByTestId('cart-length')).toHaveTextContent('2');
    });
  });

  it('addToCart warns if variantId is missing', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-1' };
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<CartProvider><TestComponent /></CartProvider>);
    
    await waitFor(() => expect(screen.getByTestId('cart-length')).toHaveTextContent('1'));
    fireEvent.click(screen.getByTestId('add-no-variant-btn'));
    
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Missing variantId for product:'), expect.any(String));
    warnSpy.mockRestore();
  });

  it('addToCart handles create error gracefully', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-1' };

    let rejectPromise: (reason?: any) => void;
    const delayedRejection = new Promise((_, reject) => {
      rejectPromise = reject;
    });
    mockCreate.mockReturnValueOnce(delayedRejection);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(<CartProvider><TestComponent /></CartProvider>);
    await waitFor(() => expect(screen.getByTestId('cart-length')).toHaveTextContent('1'));

    fireEvent.click(screen.getByTestId('add-new-btn'));
    
    // Verify optimistic update
    await waitFor(() => expect(screen.getByTestId('cart-length')).toHaveTextContent('2'));

    // Reject the promise to simulate error
    rejectPromise!(new Error('Test create err'));

    // Verify UI reverts on failure
    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith('Failed to add to cart on PocketBase:', expect.any(Error));
      expect(screen.getByTestId('cart-length')).toHaveTextContent('1');
    });
    warnSpy.mockRestore();
  });

  it('updateQuantity works properly', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-1' };
    render(<CartProvider><TestComponent /></CartProvider>);
    
    await waitFor(() => expect(screen.getByTestId('cart-length')).toHaveTextContent('1'));
    fireEvent.click(screen.getByTestId('update-qty-btn'));
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('cart-record-1', { number: 3 });
      expect(screen.getByTestId('first-item-qty')).toHaveTextContent('3');
    });
  });

  it('updateQuantity ignores negative result', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-1' };
    render(<CartProvider><TestComponent /></CartProvider>);
    
    await waitFor(() => expect(screen.getByTestId('cart-length')).toHaveTextContent('1'));
    fireEvent.click(screen.getByTestId('update-qty-btn-neg'));
    
    // Qty shouldn't change
    await waitFor(() => expect(screen.getByTestId('first-item-qty')).toHaveTextContent('2'));
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('updateQuantity ignores missing item', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-1' };
    render(<CartProvider><TestComponent /></CartProvider>);
    
    await waitFor(() => expect(screen.getByTestId('cart-length')).toHaveTextContent('1'));
    fireEvent.click(screen.getByTestId('update-qty-not-exist'));
    
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('updateQuantity handles error gracefully', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-1' };
    mockUpdate.mockRejectedValueOnce(new Error('Update err'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(<CartProvider><TestComponent /></CartProvider>);
    
    await waitFor(() => expect(screen.getByTestId('cart-length')).toHaveTextContent('1'));
    fireEvent.click(screen.getByTestId('update-qty-btn'));
    
    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith('Failed to update quantity on PocketBase:', expect.any(Error));
      expect(screen.getByTestId('first-item-qty')).toHaveTextContent('2');
    });
    warnSpy.mockRestore();
  });

  it('handles errors when removing from cart', async () => {
    pb.authStore.isValid = true;
    pb.authStore.model = { id: 'user-1' };
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockDelete.mockRejectedValueOnce(new Error('Test delete err'));

    render(<CartProvider><TestComponent /></CartProvider>);
    await waitFor(() => expect(screen.getByTestId('cart-length')).toHaveTextContent('1'));
    
    fireEvent.click(screen.getByTestId('remove-from-cart-btn'));
    
    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to remove from cart on PocketBase:', expect.any(Error));
      expect(screen.getByTestId('cart-length')).toHaveTextContent('1');
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
