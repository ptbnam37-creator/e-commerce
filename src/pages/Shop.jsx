import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const SearchIcon = () => (
  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FunnelIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg className="star-icon" viewBox="0 0 24 24" style={{ fill: filled ? '#ffd214' : '#e0e0e0' }}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none', marginLeft: 'auto', color: '#000' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const Shop = ({ onSelectProduct }) => {
  const { products } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const filterDropdownRef = useRef(null);

  // Custom filter values from the mockup
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(999999999);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' VND';
  };

  const handleCardClick = (product) => {
    onSelectProduct(product);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      const matchesRating = product.rating >= minRating && product.rating <= maxRating;
      return matchesSearch && matchesPrice && matchesRating;
    });
  }, [products, searchTerm, minPrice, maxPrice, minRating, maxRating]);

  // Price select options
  const priceFromOptions = [
    { value: 0, label: '0 VNĐ' },
    { value: 5000000, label: '5 000 000 VNĐ' },
    { value: 10000000, label: '10 000 000 VNĐ' },
    { value: 15000000, label: '15 000 000 VNĐ' },
    { value: 20000000, label: '20 000 000 VNĐ' },
    { value: 30000000, label: '30 000 000 VNĐ' }
  ];

  const priceToOptions = [
    { value: 5000000, label: '5 000 000 VNĐ' },
    { value: 10000000, label: '10 000 000 VNĐ' },
    { value: 15000000, label: '15 000 000 VNĐ' },
    { value: 20000000, label: '20 000 000 VNĐ' },
    { value: 30000000, label: '30 000 000 VNĐ' },
    { value: 999999999, label: 'Không giới hạn' }
  ];

  return (
    <div style={{ position: 'relative' }}>
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

      {/* Header bar: Shop title left, Search & Filter right */}
      <div className="page-title-container" style={{ borderBottom: 'none', marginBottom: '24px', alignItems: 'center' }}>
        <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 'bold' }}>Shop</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }} ref={filterDropdownRef}>
          {/* Small search box */}
          <div className="search-box-wrapper" style={{ minWidth: '180px', maxWidth: '220px' }}>
            <SearchIcon />
            <input
              type="text"
              className="search-input"
              style={{ padding: '8px 12px 8px 34px' }}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Funnel Filter button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? 'rgba(0, 210, 255, 0.15)' : '#f0f0f0',
              border: showFilters ? '1px solid var(--secondary)' : '1px solid #dcdcdc',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showFilters ? 'var(--secondary)' : '#333',
              transition: 'all 0.2s'
            }}
            title="Filters"
          >
            <FunnelIcon />
          </button>

          {/* EXACT Dropdown Menu matching filter screenshot layout */}
          {showFilters && (
            <div style={{
              position: 'absolute',
              top: '45px',
              right: '0',
              backgroundColor: 'white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              border: '1px solid #c0c0c0',
              borderRadius: '2px',
              zIndex: 100,
              minWidth: '280px',
              color: '#000000',
              fontFamily: 'sans-serif'
            }}>
              {/* Header: "Filter" */}
              <div style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                padding: '12px 0',
                borderBottom: '1px solid #c0c0c0'
              }}>
                Filter
              </div>

              {/* Body */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Giá Section */}
                <div>
                  <div style={{ fontSize: '16px', marginBottom: '8px', paddingLeft: '24px' }}>Giá</div>
                  
                  {/* Từ */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', paddingLeft: '8px' }}>
                    <span style={{ width: '45px', fontSize: '15px' }}>Từ:</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', borderBottom: 'none' }}>
                      <select 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        style={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          fontSize: '15px',
                          textAlign: 'right',
                          textAlignLast: 'right',
                          paddingRight: '20px',
                          background: 'transparent',
                          cursor: 'pointer',
                          appearance: 'none',
                          fontWeight: '500'
                        }}
                      >
                        {priceFromOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown />
                    </div>
                  </div>

                  {/* Đến */}
                  <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                    <span style={{ width: '45px', fontSize: '15px' }}>Đến:</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <select 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        style={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          fontSize: '15px',
                          textAlign: 'right',
                          textAlignLast: 'right',
                          paddingRight: '20px',
                          background: 'transparent',
                          cursor: 'pointer',
                          appearance: 'none',
                          fontWeight: '500'
                        }}
                      >
                        {priceToOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown />
                    </div>
                  </div>
                </div>

                {/* Đánh giá Section */}
                <div style={{ marginTop: '4px' }}>
                  <div style={{ fontSize: '16px', marginBottom: '8px', paddingLeft: '24px' }}>Đánh giá</div>
                  
                  {/* Từ */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', paddingLeft: '8px' }}>
                    <span style={{ width: '45px', fontSize: '15px' }}>Từ:</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <select 
                        value={minRating} 
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        style={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          fontSize: '15px',
                          textAlign: 'right',
                          textAlignLast: 'right',
                          paddingRight: '20px',
                          background: 'transparent',
                          cursor: 'pointer',
                          appearance: 'none',
                          fontWeight: '500'
                        }}
                      >
                        {[0, 1, 2, 3, 4, 5].map((stars) => (
                          <option key={stars} value={stars}>{stars} Sao</option>
                        ))}
                      </select>
                      <ChevronDown />
                    </div>
                  </div>

                  {/* Đến */}
                  <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                    <span style={{ width: '45px', fontSize: '15px' }}>Đến:</span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <select 
                        value={maxRating} 
                        onChange={(e) => setMaxRating(Number(e.target.value))}
                        style={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          fontSize: '15px',
                          textAlign: 'right',
                          textAlignLast: 'right',
                          paddingRight: '20px',
                          background: 'transparent',
                          cursor: 'pointer',
                          appearance: 'none',
                          fontWeight: '500'
                        }}
                      >
                        {[0, 1, 2, 3, 4, 5].map((stars) => (
                          <option key={stars} value={stars}>{stars} Sao</option>
                        ))}
                      </select>
                      <ChevronDown />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Horizontal Grid */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h2>Không tìm thấy sản phẩm nào</h2>
          <p>Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => handleCardClick(product)}
              title="Click to add to cart"
            >
              <div className="product-image-container">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = '/samsung_a31.png'; // fallback
                  }}
                />
              </div>
              
              <div className="product-info-column">
                <h2 className="product-name">{product.name}</h2>
                <div className="product-price">{formatPrice(product.price)}</div>
                
                {/* Gold stars rating matching product.rating */}
                <div className="product-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= product.rating} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
