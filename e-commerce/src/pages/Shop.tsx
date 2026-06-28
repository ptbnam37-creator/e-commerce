import { useState, useMemo, useRef, useEffect } from 'react';
import { getFileUrl } from '../services/pocketbase';
import { useCart, Product } from '../context/CartContext';
import { StarIcon } from '../components/icons/StarIcon';
import { Button } from 'antd';

const STARS = [1, 2, 3, 4, 5];

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

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none', marginLeft: 'auto', color: '#000' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PaginationArrow = ({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.3 : 1,
      color: '#8b9ab3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px',
      transition: 'opacity 0.2s'
    }}
  >
    {children}
  </button>
);

interface FilterDropdownProps {
  minPrice: number;
  setMinPrice: (val: number) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  minRating: number;
  setMinRating: (val: number) => void;
  maxRating: number;
  setMaxRating: (val: number) => void;
  priceFromOptions: { value: number; label: string }[];
  priceToOptions: { value: number; label: string }[];
  onReset: () => void;
}

const FilterDropdown = ({
  minPrice, setMinPrice, maxPrice, setMaxPrice,
  minRating, setMinRating, maxRating, setMaxRating,
  priceFromOptions, priceToOptions, onReset
}: FilterDropdownProps) => (
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
      borderBottom: '1px solid #c0c0c0',
      position: 'relative'
    }}>
      Filter
      <Button
        type="text"
        danger
        onClick={onReset}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '14px'
        }}
      >
        Reset
      </Button>
    </div>

    {/* Body */}
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Giá Section */}
      <div>
        <div style={{ fontSize: '16px', marginBottom: '8px', paddingLeft: '24px' }}>Giá</div>

        {/* Từ */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', paddingLeft: '8px' }}>
          <span style={{ width: '45px', fontSize: '15px' }}>Từ:</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <select
              value={minPrice}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinPrice(val);
                if (val > maxPrice) setMaxPrice(val);
              }}
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
              onChange={(e) => {
                const val = Number(e.target.value);
                setMaxPrice(val);
                if (val < minPrice) setMinPrice(val);
              }}
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
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinRating(val);
                if (val > maxRating) setMaxRating(val);
              }}
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
              {[0, ...STARS].map((stars) => (
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
              onChange={(e) => {
                const val = Number(e.target.value);
                setMaxRating(val);
                if (val < minRating) setMinRating(val);
              }}
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
);

interface ShopProps {
  onSelectProduct: (product: Product) => void;
}

const PRICE_REGEX = /\B(?=(\d{3})+(?!\d))/g;
const formatPrice = (price: number) => {
  return price.toString().replace(PRICE_REGEX, ' ') + ' VND';
};

const Shop = ({ onSelectProduct }: ShopProps) => {
  const { products } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(999999999);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxRating, setMaxRating] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(lowerSearchTerm);
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      const matchesRating = product.rating >= minRating && product.rating <= maxRating;
      return matchesSearch && matchesPrice && matchesRating;
    });
  }, [products, searchTerm, minPrice, maxPrice, minRating, maxRating]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, minPrice, maxPrice, minRating, maxRating]);

  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const calculateItemsPerPage = () => {
      const isMobile = window.innerWidth <= 1200;
      // Use a smaller offset on mobile and use Math.ceil to show more products
      const offset = isMobile ? 180 : 320;
      const availableHeight = window.innerHeight - offset; 
      // Approximate height of a single product card
      const cardHeight = 160; 
      
      let rows = Math.ceil(availableHeight / cardHeight);
      if (rows < 3 && isMobile) rows = 4; // Show at least 4 items on mobile to avoid empty space
      if (rows < 1 && !isMobile) rows = 1;

      const cols = isMobile ? 1 : 2;
      
      setItemsPerPage(rows * cols);
    };

    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);
    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, []);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleResetFilters = () => {
    setSearchTerm('');
    setMinPrice(0);
    setMaxPrice(999999999);
    setMinRating(0);
    setMaxRating(5);
  };

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
    <div style={{ position: 'relative', paddingBottom: '24px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
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

          {/* Dropdown Menu */}
          {showFilters && (
            <FilterDropdown
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              minRating={minRating}
              setMinRating={setMinRating}
              maxRating={maxRating}
              setMaxRating={setMaxRating}
              priceFromOptions={priceFromOptions}
              priceToOptions={priceToOptions}
              onReset={handleResetFilters}
            />
          )}
        </div>
      </div>

      {/* 2-Column Horizontal Grid */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state" style={{ marginBottom: '80px', flex: 1 }}>
          <h2>Không tìm thấy sản phẩm nào</h2>
          <p>Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          <div className="products-grid" style={{ marginBottom: '80px' }}>
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => onSelectProduct(product)}
                title="Click to view details"
              >
                <div className="product-image-container">
                  <img
                    src={
                      Array.isArray(product.image) && product.image.length > 0
                        ? getFileUrl(product, product.image[0])
                        : (product.image && typeof product.image === 'string' && product.image.startsWith('http')
                          ? product.image
                          : getFileUrl(product, product.image))
                    }
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/samsung_a31.png';
                    }}
                  />
                </div>

                <div className="product-info-column">
                  <h2 className="product-name">{product.name}</h2>
                  <div className="product-price">{formatPrice(product.price)}</div>

                  {/* Gold stars rating */}
                  <div className="product-rating" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '23px', color: '#444444', marginRight: '4px', paddingTop: '4px', lineHeight: '28px' }}>{product.rating}</span>
                    {STARS.map((star) => {
                      const fillPercent = Math.min(Math.max(product.rating - (star - 1), 0), 1);
                      return <StarIcon key={star} fillPercent={fillPercent} />;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredProducts.length > itemsPerPage && (
        <div className="pagination-container" style={{ 
          marginTop: 'auto',
          position: 'sticky', 
          zIndex: 100,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '16px', 
          color: '#8b9ab3', 
          fontSize: '18px', 
          fontWeight: '500',
          pointerEvents: 'none' // allow clicking through empty space
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            pointerEvents: 'auto', // re-enable clicks for the pagination itself
            padding: '8px 16px',
            borderRadius: '100px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)', // Add a subtle blur so it's readable over scrolling content
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
          }}>
            <PaginationArrow disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </PaginationArrow>

            <PaginationArrow disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </PaginationArrow>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                border: '1px solid #cbd2d9', 
                borderRadius: '4px', 
                padding: '4px 0',
                width: '64px',
                textAlign: 'center',
                color: '#475669',
                background: '#fff'
              }}>
                {currentPage}
              </div>
              <span>/</span>
              <span>{totalPages}</span>
            </div>

            <PaginationArrow disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </PaginationArrow>

            <PaginationArrow disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </PaginationArrow>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
