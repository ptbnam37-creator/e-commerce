import React, { useState, Suspense, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Product } from './context/CartContext';
import { CartProvider } from './context/CartProvider';
import { useCart } from './hooks/useCart';
import { loginAction, logoutAction } from './store/authStore';
import { useSelector, useDispatch } from 'react-redux';
import { pb, getFileUrl } from './services/pocketbase';
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

// Wrapper to pass the product from route parameters to the ProductDetail component
function ProductDetailWrapper() {
  const { productId } = useParams<{ productId: string }>();
  const { products } = useCart();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="empty-state">
        <p>Không tìm thấy sản phẩm.</p>
        <button 
          onClick={() => navigate('/shop')} 
          style={{ 
            marginTop: '16px', 
            padding: '8px 16px', 
            background: '#0070c0', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  return (
    <ProductDetail 
      product={product} 
      onBackToShop={() => navigate('/shop')} 
      onGoToCart={() => navigate('/cart')}
    />
  );
}

function NavigationContent({ onLogout }: NavigationContentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  
  const { cart } = useCart();
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Helper to determine the active nav button based on url path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/product/') || path === '/shop') {
      return 'Shop';
    }
    if (path === '/cart') {
      return 'Cart';
    }
    if (path === '/profile') {
      return 'My Profile';
    }
    return 'Shop';
  };

  const activeTab = getActiveTab();

  const handleSelectProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-left">
          {/* Logo redirects to Shop page */}
          <div className="logo-container" onClick={() => navigate('/shop')} style={{ cursor: 'pointer' }}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="ANY BUY" className="logo-img" />
            <h1 className="app-title">Mobile Shopping</h1>
          </div>
        </div>
        <div className="header-right">
          {/* Profile Avatar redirects to My Profile page */}
          <img 
            src={(pb.authStore.isValid && pb.authStore.model?.avatar) ? getFileUrl(pb.authStore.model, pb.authStore.model.avatar) : `${import.meta.env.BASE_URL}avatar.png`} 
            alt="User Profile" 
            className="user-avatar" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/profile')}
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
              className={`nav-item ${activeTab === 'Shop' ? 'active' : ''}`}
              onClick={() => navigate('/shop')}
            >
              <ShopIcon />
              <span>Shop</span>
            </button>
            
            <button
              className={`nav-item ${activeTab === 'Cart' ? 'active' : ''}`}
              onClick={() => navigate('/cart')}
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
              onClick={() => navigate('/profile')}
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
            <Routes>
              <Route path="/" element={<Navigate to="/shop" replace />} />
              <Route path="/shop" element={<Shop onSelectProduct={handleSelectProduct} />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile onLogout={onLogout} />} />
              <Route path="/product/:productId" element={<ProductDetailWrapper />} />
              <Route path="*" element={<Navigate to="/shop" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const isLoggedIn = useSelector((state: { auth: boolean }) => state.auth);
  const dispatch = useDispatch();

  const handleLoginSuccess = (username: string, rememberMe: boolean) => {
    dispatch(loginAction({ username, rememberMe }));
  };

  const handleLogout = () => {
    dispatch(logoutAction());
  };

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
        <Login onLoginSuccess={handleLoginSuccess} />
      </Suspense>
    );
  }

  return (
    <CartProvider>
      <NavigationContent onLogout={handleLogout} />
    </CartProvider>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
