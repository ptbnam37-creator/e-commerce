import React, { useState, useRef } from 'react';
import { useCart, Product } from '../context/CartContext';

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg className="star-icon" viewBox="0 0 24 24" style={{ fill: filled ? '#ffd214' : '#e0e0e0', width: '28px', height: '28px' }}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const CartIconHeader = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#000" strokeWidth="2" style={{ cursor: 'pointer' }}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

interface ProductDetailProps {
  product: Product | null;
  onBackToShop: () => void;
  onGoToCart: () => void;
}

const ProductDetail = ({ product, onBackToShop, onGoToCart }: ProductDetailProps) => {
  const { addToCart, cart } = useCart();
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef<number | null>(null);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || '');

  if (!product) {
    return (
      <div className="empty-state">
        <h2>Không tìm thấy sản phẩm</h2>
        <button className="empty-state-btn" onClick={onBackToShop}>Quay lại Cửa hàng</button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' VND';
  };

  const hasVariants = !!(product.colors && product.colors.length > 0);
  const colors = product.colors || [];

  // Determine main image based on color selection
  const mainImage = hasVariants
    ? (colors.find(c => c.name === selectedColor)?.image || product.image)
    : product.image;

  const handleAdd = () => {
    const chosenColorObj = colors.find(c => c.name === selectedColor);
    const variantId = chosenColorObj?.id;
    const finalName = hasVariants ? `${product.name} (${selectedColor})` : product.name;
    
    addToCart({
      ...product,
      name: finalName,
      image: mainImage
    }, variantId);

    if (toastTimeoutRef.current !== null) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(`Đã thêm ${finalName} vào giỏ hàng!`);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(''), 2000);
  };

  const handleBuyNow = () => {
    const chosenColorObj = colors.find(c => c.name === selectedColor);
    const variantId = chosenColorObj?.id;
    const finalName = hasVariants ? `${product.name} (${selectedColor})` : product.name;
    
    addToCart({
      ...product,
      name: finalName,
      image: mainImage
    }, variantId);
    
    onGoToCart();
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
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
          fontWeight: '600',
          animation: 'slideIn 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Top Breadcrumb & Mini Cart Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #dcdcdc',
        paddingBottom: '16px',
        marginBottom: '32px'
      }}>
        {/* Breadcrumbs path */}
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#333333' }}>
          <span 
            onClick={onBackToShop} 
            style={{ cursor: 'pointer' }}
          >
            Shop
          </span>
          <span style={{ margin: '0 8px', color: '#666' }}>/</span>
          <span style={{ color: '#000000', fontWeight: 'bold' }}>Product</span>
        </div>

        {/* Small shopping cart icon with badge */}
        <div onClick={onGoToCart} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <CartIconHeader />
          {totalItems > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#e040fb',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {totalItems}
            </span>
          )}
        </div>
      </div>

      {/* Main product presentation grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '48px',
        alignItems: 'flex-start',
        backgroundColor: '#ffffff'
      }}>
        
        {/* Left Side: Product Image & Color Thumbnails */}
        <div style={{
          flex: '1 1 320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          {/* Main Large product image */}
          <div style={{
            width: '100%',
            height: '380px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px'
          }}>
            <img 
              src={mainImage} 
              alt={product.name} 
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transition: 'all 0.3s ease'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/samsung_a31.png';
              }}
            />
          </div>

          {/* Color variant thumbnails - Only render if product has color variants */}
          {hasVariants && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {colors.map((c) => (
                <div 
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  style={{
                    border: selectedColor === c.name ? '1.5px solid #00c0ff' : '1px solid #dcdcdc',
                    borderRadius: '4px',
                    padding: '6px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    width: '68px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={c.image} 
                      alt={c.name} 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/samsung_a31.png';
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', color: '#666', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details info */}
        <div style={{
          flex: '1.2 1 350px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          paddingTop: '10px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0', color: '#000000' }}>
            {product.name}
          </h2>

          <p style={{ fontSize: '15px', color: '#333333', lineHeight: 1.6, margin: 0 }}>
            {product.description}
          </p>

          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#000000' }}>
            {formatPrice(product.price)}
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= product.rating} />
            ))}
          </div>

          {/* Action buttons row */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
            <button 
              onClick={handleBuyNow}
              style={{
                flex: 1,
                height: '52px',
                backgroundColor: '#00c0ff',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Mua Ngay
            </button>
            <button 
              onClick={handleAdd}
              style={{
                flex: 1,
                height: '52px',
                backgroundColor: '#00e600',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
