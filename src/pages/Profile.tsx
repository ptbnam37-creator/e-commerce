import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, updateProfile } from '../store/authStore';

interface ProfileProps {
  onLogout: () => void;
}

const Profile = ({ onLogout }: ProfileProps) => {
  const dispatch = useDispatch();
  const storedProfile = useSelector((state: RootState) => state.profile);

  const [profile, setProfile] = useState(storedProfile);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(updateProfile(profile));
    alert('Thông tin cá nhân đã được cập nhật thành công!');
  };

  return (
    <div>
      <div className="page-title-container">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-container">
        <div className="profile-header-edit">
          <img src="/avatar.png" alt="Avatar" className="profile-avatar-large" />
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{profile.name}</h2>
          <p style={{ color: '#666' }}>Thành viên Vàng</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Họ và Tên</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ nhận hàng</label>
            <input
              type="text"
              id="address"
              name="address"
              value={profile.address}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <button type="submit" className="save-profile-btn" style={{ flex: 1, marginTop: 0 }}>
              Lưu thay đổi
            </button>
            <button 
              type="button" 
              className="save-profile-btn" 
              onClick={onLogout}
              style={{ 
                flex: 1, 
                marginTop: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #dcdcdc',
                color: '#333333'
              }}
            >
              Đăng xuất
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
