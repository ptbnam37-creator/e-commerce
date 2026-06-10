import React from 'react';
import { useCart, CartItem } from '../context/CartContext';

import { createStore } from 'redux';

interface IncrementAction {
  type: 'increment';
  payload: { cartId: string };
}

interface DecrementAction {
  type: 'decrement';
  payload: { cartId: string };
}

interface RemoveAction {
  type: 'remove';
  payload: { cartId: string };
}

interface SetInitialCartAction {
  type: 'set_initial_cart';
  payload: { cart: CartItem[] };
}

type CartAction = IncrementAction | DecrementAction | RemoveAction | SetInitialCartAction;

function cartReducer(state: CartItem[] = [], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'set_initial_cart':
      return action.payload.cart;
    case 'increment':
      return state.map(item =>
        item.cartId === action.payload.cartId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    case 'decrement':
      return state.map(item =>
        item.cartId === action.payload.cartId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    case 'remove':
      return state.filter(item => item.cartId !== action.payload.cartId);
    default:
      return state;
  }
}

const store = createStore(cartReducer);

// Action Creators
function increment(cartId: string): IncrementAction {
  return {
    type: 'increment',
    payload: { cartId }
  };
}

function decrement(cartId: string): DecrementAction {
  return {
    type: 'decrement',
    payload: { cartId }
  };
}

function remove(cartId: string): RemoveAction {
  return {
    type: 'remove',
    payload: { cartId }
  };
}

function setInitialCart(cart: CartItem[]): SetInitialCartAction {
  return {
    type: 'set_initial_cart',
    payload: { cart }
  };
}

const Cart = () => {
  const { cart: contextCart, updateQuantity, removeFromCart } = useCart();

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' VND';
  };

  const [cartState, setCartState] = React.useState<CartItem[]>([]);

  // Initialize Redux store with Context cart on mount
  React.useEffect(() => {
    store.dispatch(setInitialCart(contextCart));
    setCartState(contextCart);
  }, []);

  // Subscribe to Redux store updates
  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setCartState(store.getState());
    });
    return unsubscribe;
  }, []);

  // Compute values from Redux store cartState
  const totalItems = cartState.reduce((sum, item) => sum + item.quantity, 0);
  const subTotal = cartState.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subTotal * 0.1);
  const total = subTotal + tax;

  if (cartState.length === 0) {
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
        {cartState.map((item) => (
          <div key={item.cartId} className="cart-item-card">
            {/* Remove button at top right corner */}
            <button
              className="remove-btn"
              onClick={() => {
                store.dispatch(remove(item.cartId));
                removeFromCart(item.cartId);
              }}
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
                      store.dispatch(increment(item.cartId));
                      updateQuantity(item.cartId, 1);
                    }}
                  >
                    +
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => {
                      store.dispatch(decrement(item.cartId));
                      updateQuantity(item.cartId, -1);
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
