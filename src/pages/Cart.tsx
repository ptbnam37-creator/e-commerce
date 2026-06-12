import React, { useState, useEffect } from 'react';
import { useCart, CartItem } from '../context/CartContext.tsx';
import { configureStore } from '@reduxjs/toolkit';

interface CartAction {
  type: string;
  payload: number;
}

// Redux reducer handling the quantity increments/decrements
function counter(state = 2, action: CartAction) {
  if (action.type === 'increment') {
    // Divide by 1000 to convert the payload (e.g. 1000) to 1 unit
    return state + (action.payload / 1000);
  }
  if (action.type === 'decrement') {
    return state - (action.payload / 1000);
  }
  return state;
}

// Read initial total quantity from localStorage
const getInitialTotal = (): number => {
  const saved = localStorage.getItem('cart');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
      }
    } catch (e) {
      console.error('Failed to parse cart for Redux init:', e);
    }
  }
  return 2; // Default fallback matching initial state
};

// Global Redux store initialized dynamically
const store = configureStore({ reducer: counter, preloadedState: getInitialTotal() });

// Redux Action creators
function deposit(cost: number) {
  return {
    type: 'increment',
    payload: cost
  };
}

function withdraw(cost: number) {
  return {
    type: 'decrement',
    payload: cost
  };
}

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, subTotal, tax, total } = useCart();
  
  // React state subscribing to the Redux store state
  const [totalItems, setTotalItems] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTotalItems(store.getState());
    });
    return unsubscribe;
  }, []);

  // Sync Redux store state with the actual total items in the cart
  const actualTotal = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  useEffect(() => {
    if (actualTotal !== totalItems) {
      // Re-initialize or adjust store if cart content changes from details page or removals
      const difference = actualTotal - totalItems;
      if (difference !== 0) {
        store.dispatch(deposit(difference * 1000));
      }
    }
  }, [actualTotal, totalItems]);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' VND';
  };

  if (cart.length === 0) {
    return (
      <div className="empty-state">
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Hãy quay lại trang Shop để thêm sản phẩm vào giỏ hàng.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title-container" style={{ borderBottom: 'none', marginBottom: '0px' }}>
        <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 'bold' }}>Cart</h1>
        <span className="item-count" style={{ alignSelf: 'flex-end', marginBottom: '8px', fontSize: '14px' }}>
          {totalItems} {totalItems === 1 ? 'Item' : 'Items'} in bag
        </span>
      </div>

      <div className="cart-items-list">
        {cart.map((item : CartItem) => (
          <div key={item.cartId} className="cart-item-card">
            {/* Remove button at top right corner */}
            <button
              className="remove-btn"
              onClick={() => removeFromCart(item.cartId)}
              title="Remove item"
            >
              x
            </button>

            {/* Product image */}
            <div className="cart-item-image-wrapper">
              <img src={item.image} alt={item.name} className="cart-item-image" />
            </div>

            {/* Product details */}
            <div className="cart-item-details">
              <h2 className="cart-item-name">{item.name}</h2>
              <p className="cart-item-desc">{item.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span className="cart-item-price">{formatPrice(item.price)}</span>
                
                {/* Quantity Action Area: +  Qty  - */}
                <div className="cart-item-actions">
                  <button 
                    className="qty-btn" 
                    onClick={() => {
                      store.dispatch(deposit(1000));
                      updateQuantity(item.cartId, 1);
                    }}
                  >
                    +
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button 
                    className="qty-btn" 
                    onClick={() => {
                      if (item.quantity > 1) {
                        store.dispatch(withdraw(1000));
                        updateQuantity(item.cartId, -1);
                      }
                    }}
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary Totals */}
      <div className="cart-summary">
        <div className="summary-row">
          <span className="summary-label">SubTotal</span>
          <span>{formatPrice(subTotal)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="summary-row total">
          <span className="summary-label">Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default Cart;
