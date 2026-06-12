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

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Điện thoại Samsung Galaxy A31',
    brand: 'Samsung',
    rating: 5,
    description: 'Galaxy A31 là mẫu smartphone tầm trung mới ra mắt đầu năm 2020 của Samsung. Thiết bị gây ấn tượng mạnh với ngoại hình thời trang, cụm 4 camera đa chức năng, vân tay dưới màn hình và viên pin khủng lên đến 5000 mAh.',
    price: 6940000,
    image: '/samsung_a31.png',
    colors: [
      { name: 'Xanh Dương', image: '/samsung_a31_blue.png' },
      { name: 'Đen', image: '/samsung_a31_black.png' },
      { name: 'Trắng', image: '/samsung_a31.png' }
    ]
  },
  {
    id: 2,
    name: 'Điện thoại Samsung Galaxy S21 FE',
    brand: 'Samsung',
    rating: 4,
    description: 'Sở hữu thiết kế trẻ trung năng động, màn hình Dynamic AMOLED 2X sắc nét, tần số quét 120Hz mượt mà cùng hiệu năng mạnh mẽ từ con chip Exynos 2100 cao cấp.',
    price: 12490000,
    image: '/samsung-s21-fe.png',
    colors: [
      { name: 'Tím', image: '/samsung-s21-fe.png' },
      { name: 'Đen', image: '/samsung-s21-fe-black.png' },
      { name: 'Xanh Lá', image: '/samsung-s21-fe-green.png' },
      { name: 'Trắng', image: '/samsung-s21-fe-white.png' }
    ]
  },
  {
    id: 3,
    name: 'Điện thoại iPhone 13 128GB',
    brand: 'Apple',
    rating: 5,
    description: 'iPhone 13 sở hữu thiết kế sang trọng, camera chéo độc đáo, hiệu năng siêu việt từ Apple A15 Bionic cùng thời lượng pin cải tiến vượt trội đáp ứng trọn vẹn nhu cầu.',
    price: 16990000,
    image: '/ip13-green.png',
    colors: [
      { name: 'Xanh Lá', image: '/ip13-green.png' },
      { name: 'Đen', image: '/ip13-black.png' },
      { name: 'Trắng', image: '/ip13-white.png' },
      { name: 'Xanh Dương', image: '/ip13-blue.png' },
      { name: 'Hồng', image: '/ip13-pink.png' },
      { name: 'Đỏ', image: '/ip13-red.png' },
    ]
  },
  {
    id: 4,
    name: 'Điện thoại OPPO Reno11 F 5G',
    brand: 'OPPO',
    rating: 4,
    description: 'OPPO Reno11 F 5G nổi bật với camera chân dung siêu nét, sạc nhanh SuperVOOC 67W, màn hình AMOLED 120Hz viền siêu mỏng cùng mặt lưng chuyển màu lung linh.',
    price: 8990000,
    image: '/oppo_reno11f.png',
    colors: [
      { name: 'Xanh Đen', image: '/oppo-reno-11f-dark-green.png' },
      { name: 'Xanh', image: '/oppo_reno11f.png' }
    ]
  },
  {
    id: 5,
    name: 'Điện thoại iPhone 15 Pro 128GB',
    brand: 'Apple',
    rating: 5,
    description: 'iPhone 15 Pro với khung vỏ Titan chuẩn vũ trụ siêu bền nhẹ, nút Action mới, chip A17 Pro tối tân mang đến trải nghiệm đồ họa chơi game đỉnh cao cùng camera 48MP.',
    price: 24990000,
    image: '/iphone15-pro-nau_1_.png',
    colors: [
      { name: 'Titan Tự Nhiên', image: '/iphone15-pro-nau_1_.png' },
      { name: 'Titan Đen', image: '/iphone15-pro-den_1.png' },
      { name: 'Titan Trắng', image: '/iphone15-pro-trang_1__1.png' },
      { name: 'Titan Xanh', image: '/iphone15-pro-xanh_1_.png' }
    ]
  },
  {
    id: 6,
    name: 'Điện thoại Xiaomi Redmi Note 13',
    brand: 'Xiaomi',
    rating: 3,
    description: 'Redmi Note 13 mang lại hiệu năng ổn định, màn hình AMOLED 120Hz mượt mà, camera 108MP siêu phân giải cùng viên pin 5000 mAh đi kèm sạc nhanh 33W.',
    price: 4590000,
    image: '/redmi-note13-black.png',
    colors: [
      { name: 'Đen', image: '/redmi-note13-black.png' },
      { name: 'Xanh Lá', image: '/redmi-note13-green.png' },
      { name: 'Vàng', image: '/redmi-note13-yellow.png' }
    ]
  }
];

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Initialize from localStorage or default to two Galaxy A31s
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    return [
      { ...initialProducts[0], quantity: 1, cartId: 'initial-1' },
      { ...initialProducts[0], quantity: 1, cartId: 'initial-2' }
    ];
  });

  // Load products from PocketBase database
  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const records = await pb.collection('products').getFullList<any>({
          sort: '-created',
        });
        
        if (records && records.length > 0) {
          const mapped: Product[] = records.map((record) => {
            let imageUrl = record.image;
            if (record.image && !record.image.startsWith('http') && !record.image.startsWith('/')) {
              imageUrl = pb.files.getUrl(record, record.image);
            } else if (!record.image) {
              imageUrl = '/samsung_a31.png';
            }

            let colorsArr = [];
            if (Array.isArray(record.colors)) {
              colorsArr = record.colors;
            } else if (typeof record.colors === 'string') {
              try {
                colorsArr = JSON.parse(record.colors);
              } catch {
                colorsArr = [];
              }
            }

            return {
              id: record.productId || record.id,
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
        console.warn('PocketBase products fetch failed or collection not found. Using local initialProducts fallback.', err);
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