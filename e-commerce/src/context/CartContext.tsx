import React, { createContext, useContext, useState, ReactNode } from 'react';
import { pb, getFileUrl } from '../services/pocketbase';

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

interface CartContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string) => Promise<void>;
  updateQuantity: (cartId: string, delta: number) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  subTotal: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Function to load cart from PocketBase
  const loadCartFromPB = async () => {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      setCart([]);
      return;
    }
    try {
      const records = await pb.collection('cart').getFullList<any>({
        filter: `user = "${pb.authStore.model.id}"`,
        expand: 'product,product.productId',
        sort: 'id'
      });

      const items: CartItem[] = records.map((record) => {
        const variant = record.expand?.product;
        const prod = variant?.expand?.productId;
        if (!variant || !prod) return null;

        let imageUrl = prod.image;
        if (Array.isArray(prod.image) && prod.image.length > 0) {
          imageUrl = getFileUrl(prod, prod.image[0]);
        } else if (typeof prod.image === 'string' && prod.image !== '') {
          imageUrl = getFileUrl(prod, prod.image);
        } else {
          imageUrl = '/samsung_a31.png';
        }

        if (variant.image) {
          imageUrl = getFileUrl(variant, variant.image);
        }

        return {
          id: prod.id,
          name: `${prod.name} (${variant.color})`,
          brand: prod.brand,
          rating: Number(prod.rating || 5),
          description: prod.description || '',
          price: Number(prod.price || 0),
          image: imageUrl,
          colors: [], // not needed in cart item
          quantity: Number(record.number || 1),
          cartId: record.id,
          variantId: variant.id
        };
      }).filter(Boolean) as CartItem[];

      setCart(items);
    } catch (err) {
      console.warn('Failed to load cart from PocketBase:', err);
    }
  };

  // Load products from PocketBase database
  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const productRecords = await pb.collection('product').getFullList<any>({
          expand: 'color_variants(productId)',
          sort: 'id'
        });

        if (productRecords && productRecords.length > 0) {
          const mapped: Product[] = productRecords.map((record) => {
            let imageUrl = '';
            let imageFilename = '';

            if (Array.isArray(record.image) && record.image.length > 0) {
              imageFilename = record.image[0];
            } else if (typeof record.image === 'string' && record.image !== '') {
              imageFilename = record.image;
            }

            if (imageFilename) {
              if (imageFilename.startsWith('http') || imageFilename.startsWith('/')) {
                imageUrl = imageFilename;
              } else {
                imageUrl = getFileUrl(record, imageFilename);
              }
            } else {
              imageUrl = '/samsung_a31.png';
            }

            // Find matching color variants from the expanded relation
            const productVariants = record.expand?.['color_variants(productId)'] || [];
            const colorsArr = productVariants.map((v: any) => {
              let varImageUrl = '';
              let varImageFilename = '';

              if (Array.isArray(v.image) && v.image.length > 0) {
                varImageFilename = v.image[0];
              } else if (typeof v.image === 'string' && v.image !== '') {
                varImageFilename = v.image;
              }

              if (varImageFilename) {
                if (varImageFilename.startsWith('http') || varImageFilename.startsWith('/')) {
                  varImageUrl = varImageFilename;
                } else {
                  varImageUrl = getFileUrl(v, varImageFilename);
                }
              }

              return {
                id: v.id,
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

  // Listen to auth changes to load/clear cart
  React.useEffect(() => {
    loadCartFromPB();
    const unsubscribe = pb.authStore.onChange(() => {
      loadCartFromPB();
    });
    return () => unsubscribe();
  }, []);

  const pendingAdditions = React.useRef<Set<string>>(new Set());

  const addToCart = async (product: Product, variantId?: string) => {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      return;
    }

    if (!variantId) {
      console.warn('Missing variantId for product:', product.name);
      return;
    }

    if (pendingAdditions.current.has(variantId)) {
      // Prevent duplicate additions while the first request is pending
      return;
    }

    pendingAdditions.current.add(variantId);

    try {
      const existing = cart.find((item) => item.variantId === variantId);

      if (existing) {
        const newQty = existing.quantity + 1;
        
        // Optimistic update
        setCart((prev) =>
          prev.map((item) =>
            item.cartId === existing.cartId ? { ...item, quantity: newQty } : item
          )
        );

        try {
          await pb.collection('cart').update(existing.cartId, {
            number: newQty
          });
        } catch (err) {
          console.warn('Failed to add to cart on PocketBase:', err);
          // Revert UI on failure
          setCart((prev) =>
            prev.map((item) =>
              item.cartId === existing.cartId ? { ...item, quantity: existing.quantity } : item
            )
          );
        }
      } else {
        // Wait for server to get the new cartId
        const createdRecord = await pb.collection('cart').create({
          user: pb.authStore.model.id,
          product: variantId,
          number: 1
        });

        // Reconstruct local CartItem
        const newCartItem: CartItem = {
          ...product,
          quantity: 1,
          cartId: createdRecord.id,
          variantId: variantId
        };

        setCart((prev) => [...prev, newCartItem]);
      }
    } catch (err) {
      console.warn('Failed to process add to cart:', err);
    } finally {
      pendingAdditions.current.delete(variantId);
    }
  };

  const updateQuantity = async (cartId: string, delta: number) => {
    if (!pb.authStore.isValid) return;

    const existing = cart.find((item) => item.cartId === cartId);
    if (!existing) return;

    const newQty = existing.quantity + delta;
    if (newQty <= 0) return;

    // Optimistic UI Update
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQty } : item
      )
    );

    try {
      await pb.collection('cart').update(cartId, {
        number: newQty
      });
    } catch (err) {
      console.warn('Failed to update quantity on PocketBase:', err);
      // Revert UI on failure
      setCart((prev) =>
        prev.map((item) =>
          item.cartId === cartId ? { ...item, quantity: existing.quantity } : item
        )
      );
    }
  };

  const removeFromCart = async (cartId: string) => {
    if (!pb.authStore.isValid) return;

    const removedItem = cart.find(item => item.cartId === cartId);
    if (!removedItem) return;

    // Optimistic UI Update
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));

    try {
      await pb.collection('cart').delete(cartId);
    } catch (err) {
      console.warn('Failed to remove from cart on PocketBase:', err);
      // Revert UI on failure
      setCart((prev) => [...prev, removedItem]);
    }
  };

  const subTotal = React.useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);
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