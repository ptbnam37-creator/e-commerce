import React, { useMemo } from 'react';
import { useCart, CartItem } from '../context/CartContext.tsx';

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, subTotal, tax, total } = useCart();

  // Calculate total items directly from the cart state
  const totalItems = useMemo(() => cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0), [cart]);

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
          {totalItems} sản phẩm trong giỏ hàng
        </span>
      </div>

      <div className="cart-items-list">
        {cart.map((item: CartItem) => (
          <div key={item.cartId} className="cart-item-card">
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
                    onClick={() => updateQuantity(item.cartId, 1)}
                  >
                    +
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateQuantity(item.cartId, -1);
                      }
                    }}
                  >
                    -
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.cartId)}
                    title="Xóa sản phẩm"
                  >
                    <TrashIcon />
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
