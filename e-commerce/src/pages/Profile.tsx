import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, updateProfile } from '../store/authStore';
import { pb, getFileUrl } from '../services/pocketbase';

interface ProfileProps {
  onLogout: () => void;
}

const Profile = ({ onLogout }: ProfileProps) => {
  const dispatch = useDispatch();
  const storedProfile = useSelector((state: RootState) => state.profile);

  // Initialize with PocketBase data if logged in via PocketBase, else fallback
  const isPbLoggedIn = pb.authStore.isValid && pb.authStore.model;

  const [profile, setProfile] = useState({
    name: isPbLoggedIn ? (pb.authStore.model?.name || '') : storedProfile.name,
    email: isPbLoggedIn ? (pb.authStore.model?.email || '') : storedProfile.email,
    phone: isPbLoggedIn ? (pb.authStore.model?.phone || '') : storedProfile.phone,
    address: isPbLoggedIn ? (pb.authStore.model?.address || '') : storedProfile.address,
  });

  const [avatarUrl, setAvatarUrl] = useState(`${import.meta.env.BASE_URL}avatar.png`);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPbLoggedIn && pb.authStore.model?.avatar) {
      setAvatarUrl(getFileUrl(pb.authStore.model, pb.authStore.model.avatar));
    } else {
      setAvatarUrl(`${import.meta.env.BASE_URL}avatar.png`);
    }
  }, [isPbLoggedIn]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimeoutRef.current !== null) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastType(type);
    setToastMessage(message);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(''), 2000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPbLoggedIn && pb.authStore.model) {
      try {
        await pb.collection('users').update(pb.authStore.model.id, {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address
        });
        // Refresh auth store to update local model
        await pb.collection('users').authRefresh();
        showToast('Thông tin cá nhân đã được cập nhật thành công lên PocketBase!', 'success');
      } catch (err) {
        console.warn('Failed to update profile in PocketBase:', err);
        setNotification({message: 'Có lỗi xảy ra khi lưu thông tin lên PocketBase.', type: 'error'});
      }
    } else {
      dispatch(updateProfile(profile));
      showToast('Thông tin cá nhân đã được cập nhật thành công!', 'success');
    }
  };

  const rankMap: Record<string, string> = {
    'Normal': 'Thành viên thường',
    'VIP': 'Thành viên VIP',
    'Gold': 'Thành viên vàng',
    'Platinum': 'Thành viên bạch kim',
    'Diamond': 'Thành viên kim cương'
  };

  const currentRank = isPbLoggedIn
    ? (rankMap[pb.authStore.model?.rank] || pb.authStore.model?.rank || 'Thành viên thường')
    : 'Thành viên thường';

  return (
    <div>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toastType === 'success' ? '#00d2ff' : '#ff4d4f',
          color: toastType === 'success' ? '#0b1a30' : '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: `0 4px 16px ${toastType === 'success' ? 'rgba(0,210,255,0.3)' : 'rgba(255,77,79,0.3)'}`,
          zIndex: 1000,
          fontWeight: '600',
          animation: 'slideIn 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}
      <div className="page-title-container">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-container">
        <div className="profile-header-edit">
          <img src={avatarUrl} alt="Avatar" className="profile-avatar-large" />
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{profile.name}</h2>
          <p style={{ color: '#666' }}>{currentRank}</p>
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
              type="text"
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
