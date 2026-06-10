import React, { useState, Suspense } from 'react';
import { CartProvider, useCart, Product } from './context/CartContext';
import './App.css';

// Lazy load page components
const Shop = React.lazy(() => import('./pages/Shop'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Login = React.lazy(() => import('./pages/Login'));

// SVG Icons
const ShopIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CartIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface NavigationContentProps {
  onLogout: () => void;
}

function NavigationContent({ onLogout }: NavigationContentProps) {
  const [activeTab, setActiveTab] = useState<string>('Cart'); // Default active tab is Cart
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleTabSwitch = (tabName: string) => {
    setSelectedProduct(null); // Clear selected product when navigating away
    setActiveTab(tabName);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const renderContent = () => {
    if (selectedProduct) {
      return (
        <ProductDetail 
          key={selectedProduct.id}
          product={selectedProduct} 
          onBackToShop={() => setSelectedProduct(null)} 
          onGoToCart={() => handleTabSwitch('Cart')}
        />
      );
    }

    switch (activeTab) {
      case 'Shop':
        return <Shop onSelectProduct={handleSelectProduct} />;
      case 'Cart':
        return <Cart />;
      case 'My Profile':
        return <Profile onLogout={onLogout} />;
      default:
        return <Cart />;
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-left">
          {/* Logo redirects to Shop page */}
          <div className="logo-container" onClick={() => handleTabSwitch('Shop')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="ANY BUY" className="logo-img" />
            <h1 className="app-title">Mobile Shopping</h1>
          </div>
        </div>
        <div className="header-right">
          {/* Profile Avatar redirects to My Profile page */}
          <img 
            src="/avatar.png" 
            alt="User Profile" 
            className="user-avatar" 
            onClick={() => handleTabSwitch('My Profile')}
          />
        </div>
      </header>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-menu-header">
            <span>Menu</span>
            <div className="hamburger-icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'Shop' && !selectedProduct ? 'active' : ''}`}
              onClick={() => handleTabSwitch('Shop')}
            >
              <ShopIcon />
              <span>Shop</span>
            </button>
            
            <button
              className={`nav-item ${activeTab === 'Cart' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('Cart')}
              style={{ position: 'relative' }}
            >
              <CartIcon />
              <span>Cart</span>
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute',
                  right: isSidebarCollapsed ? '15px' : '20px',
                  top: isSidebarCollapsed ? '10px' : 'auto',
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}>
                  {totalItems}
                </span>
              )}
            </button>
            
            <button
              className={`nav-item ${activeTab === 'My Profile' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('My Profile')}
            >
              <ProfileIcon />
              <span>My Profile</span>
            </button>
          </nav>
        </aside>

        {/* Dynamic Content Area with React Lazy Loading (Suspense) */}
        <main className="content-area">
          <Suspense fallback={
            <div className="empty-state">
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #00d2ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <p>Đang tải nội dung...</p>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  if (!isLoggedIn) {
    return (
      <Suspense fallback={
        <div style={{
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #00b4ec 0%, #0070c0 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
          fontSize: '18px'
        }}>
          Đang tải trang đăng nhập...
        </div>
      }>
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      </Suspense>
    );
  }

  return (
    <CartProvider>
      <NavigationContent onLogout={() => setIsLoggedIn(false)} />
    </CartProvider>
  );
}

export default App;
