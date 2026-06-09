import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const StarIcon = ({ filled }) => (
  <svg className="star-icon" viewBox="0 0 24 24" style={{ fill: filled ? '#ffd214' : '#e0e0e0', width: '32px', height: '32px' }}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const ProductDetail = ({ product, onBackToShop }) => {
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState('');

  if (!product) {
    return (
      <div className="empty-state">
        <h2>Không tìm thấy sản phẩm</h2>
        <button className="empty-state-btn" onClick={onBackToShop}>Quay lại Cửa hàng</button>
      </div>
    );
  }

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' VND';
  };

  const handleAdd = () => {
    addToCart(product);
    setToastMessage(`Đã thêm ${product.name} vào giỏ hàng!`);
    setTimeout(() => setToastMessage(''), 2000);
  };

  return (
    <div style={{ position: 'relative', padding: '20px 0' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#00d2ff',
          color: '#0b1a30',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,210,255,0.3)',
          zIndex: 1000,
          fontWeight: '600'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Back Button */}
      <button 
        onClick={onBackToShop}
        style={{
          background: '#f0f0f0',
          border: '1px solid #dcdcdc',
          borderRadius: '4px',
          padding: '8px 16px',
          cursor: 'pointer',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ← Quay lại Cửa hàng
      </button>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '40px',
        alignItems: 'flex-start',
        border: '1px solid #e5e4e7',
        borderRadius: '12px',
        padding: '40px',
        backgroundColor: '#ffffff'
      }}>
        {/* Left Column: Image */}
        <div style={{
          flex: '1 1 300px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '350px',
          backgroundColor: '#fafafa',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onError={(e) => {
              e.target.src = '/samsung_a31.png';
            }}
          />
        </div>

        {/* Right Column: Info */}
        <div style={{ flex: '1.5 1 350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#000000', lineHeight: 1.2 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= product.rating} />
            ))}
          </div>

          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#000000' }}>
            {formatPrice(product.price)}
          </div>

          <p style={{ fontSize: '16px', color: '#5f5f5f', lineHeight: 1.6 }}>
            {product.description}
          </p>

          <button 
            className="checkout-btn" 
            onClick={handleAdd}
            style={{ 
              alignSelf: 'flex-start',
              padding: '14px 40px',
              fontSize: '16px',
              backgroundColor: 'var(--primary)',
              borderRadius: '6px',
              marginTop: '10px'
            }}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
