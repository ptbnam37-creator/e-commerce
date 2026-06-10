import React, { useState, FormEvent } from 'react';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập!');
      return;
    }
    
    // Validate default credentials
    if (username === 'nguyenvana' && password === '12345678') {
      setError('');
      onLoginSuccess(username);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  return (
    <div className="login-page-container">
      {/* City network background nodes */}
      <div className="login-bg-decoration"></div>

      <div className="login-card-wrapper">
        {/* Logo circle */}
        <div className="login-logo-circle">
          <img src="/logo.png" alt="ANY BUY" className="login-logo-img" />
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
              placeholder="Tên đăng nhập"
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
          <button type="submit" className="login-submit-btn">
            Đăng nhập
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
