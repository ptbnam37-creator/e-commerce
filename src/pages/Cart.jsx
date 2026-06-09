import React from 'react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, subTotal, tax, total } = useCart();

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' VND';
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        {cart.map((item) => (
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
                  <button className="qty-btn" onClick={() => updateQuantity(item.cartId, 1)}>+</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.cartId, -1)}>-</button>
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
