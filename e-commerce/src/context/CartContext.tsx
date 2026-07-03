import { createContext } from 'react';

export interface ProductColor {
  id: string;
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
  variantId?: string;
}

export interface CartContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string) => Promise<void>;
  updateQuantity: (cartId: string, delta: number) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  subTotal: number;
  tax: number;
  total: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
