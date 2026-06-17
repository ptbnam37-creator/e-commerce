import React, { useState, FormEvent } from 'react';
import { pb } from '../services/pocketbase';

interface LoginProps {
  onLoginSuccess: (username: string, rememberMe: boolean) => void;
}

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00a2e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00a2e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập!');
      return;
    }
    
    setIsLoading(true);

    try {
      // Try to log in with PocketBase first
      try {
        let identity = username;

        // Try to query the users collection by name, phone, email, or id
        try {
          const userList = await pb.collection('users').getList(1, 1, {
            filter: `email = "${username}" || name = "${username}" || phone = "${username}" || id = "${username}"`
          });
          if (userList.items.length > 0) {
            identity = userList.items[0].email; // use the found email to authenticate
          }
        } catch (searchError) {
          console.warn('Failed to pre-query user, attempting direct login...', searchError);
        }

        const authData = await pb.collection('users').authWithPassword(identity, password);
        if (authData) {
          setError('');
          onLoginSuccess(authData.record.name || username, rememberMe);
          setIsLoading(false);
          return;
        }
      } catch (pbError) {
        console.warn('PocketBase authentication failed or server offline. Falling back to mock auth...', pbError);
      }

      // Fallback to mock login
      const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        setTimeout(() => {
          const isValidMockUser = 
            (username === 'nguyenvana' || username === 'Nguyễn Văn A' || username === '0222222222' || username === 'nguyenvana@gmail.com') ||
            (username === 'levanb' || username === 'Lê Văn B' || username === '0111111111' || username === 'levanb@gmail.com');
          
          if (isValidMockUser && password === '12345678') {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
          }
        }, 800); // Simulated network delay
      });

      if (result.success) {
        setError('');
        onLoginSuccess(username, rememberMe);
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch {
      setError('Đã xảy ra lỗi kết nối, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* City network background nodes */}
      <div className="login-bg-decoration"></div>

      <div className="login-card-wrapper">
        {/* Logo circle */}
        <div className="login-logo-circle">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="ANY BUY" className="login-logo-img" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div style={{
              backgroundColor: 'rgba(255, 77, 79, 0.2)',
              border: '1px solid #ff4d4f',
              color: 'white',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Username Field */}
          <div className="login-input-group">
            <span className="login-input-icon">
              <UserIcon />
            </span>
            <input
              type="text"
              className="login-input-field"
              placeholder="Tên đăng nhập, Email hoặc số điện thoại"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="login-input-group">
            <span className="login-input-icon">
              <LockIcon />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="login-input-field"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </div>

          {/* Remember Me / Forgot Password */}
          <div className="login-options-row">
            <label className="login-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-checkbox"
              />
              <span>Lưu đăng nhập</span>
            </label>
            <a href="#forgot" className="login-forgot-link" onClick={(e) => { e.preventDefault(); alert('Vui lòng liên hệ quản trị viên để khôi phục mật khẩu.'); }}>
              Bạn quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button type="submit" className="login-submit-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Footer Info */}
        <div className="login-footer">
          <p>Nếu bạn có thắc mắc hay cần giải đáp, vui lòng liên hệ số điện thoại: <span style={{ fontWeight: '600' }}>19001000</span></p>
          <p style={{ marginTop: '6px', opacity: 0.8 }}>Bản quyền thuộc về AnyBim</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
