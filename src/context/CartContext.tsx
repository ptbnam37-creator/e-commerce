import React, { createContext, useContext, useState, ReactNode } from 'react';
import { pb } from '../services/pocketbase';

export interface ProductColor {
  name: string;
  image: string;
}

export interface Product {
  id: number | string;
  name: string;
  brand: string;
  rating: number;
  description: string;
  price: number;
  image: string;
  colors: ProductColor[];
}

export interface CartItem extends Product {
  quantity: number;
  cartId: string;
}

interface CartContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  removeFromCart: (cartId: string) => void;
  subTotal: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Initialize from localStorage or default to empty array
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    return [];
  });

  // Load products from PocketBase database
  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const [productRecords, variantRecords] = await Promise.all([
          pb.collection('product').getFullList<any>({ sort: '-created' }),
          pb.collection('color_variants').getFullList<any>({ sort: 'created' })
        ]);
        
        if (productRecords && productRecords.length > 0) {
          const mapped: Product[] = productRecords.map((record) => {
            let imageUrl = record.image;
            if (record.image && !record.image.startsWith('http') && !record.image.startsWith('/')) {
              imageUrl = pb.files.getUrl(record, record.image);
            } else if (!record.image) {
              imageUrl = '/samsung_a31.png';
            }

            // Find matching color variants from the color_variants relation
            const productVariants = variantRecords.filter(v => v.productId === record.id);
            const colorsArr = productVariants.map(v => {
              let varImageUrl = '';
              if (v.image) {
                varImageUrl = pb.files.getUrl(v, v.image);
              }
              return {
                name: v.color,
                image: varImageUrl || imageUrl
              };
            });

            return {
              id: record.id,
              name: record.name,
              brand: record.brand,
              rating: Number(record.rating || 5),
              description: record.description || '',
              price: Number(record.price || 0),
              image: imageUrl,
              colors: colorsArr
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.warn('PocketBase product/variants fetch failed.', err);
      }
    };

    loadProducts();
  }, []);

  // Persist cart changes to localStorage
  React.useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.name === product.name);
      if (existing) {
        return prev.map((item) =>
          (item.id === product.id && item.name === product.name) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, cartId: Date.now() + Math.random().toString() }];
    });
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subTotal * 0.1);
  const total = subTotal + tax;

  return (
    <CartContext.Provider
      value={{
        products,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        subTotal,
        tax,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};