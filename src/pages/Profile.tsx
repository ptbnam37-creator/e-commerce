import React, { useState, ChangeEvent, FormEvent } from 'react';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0987 654 321',
    address: '120 Yên Lãng, Đống Đa, Hà Nội'
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

          <button type="submit" className="save-profile-btn">
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
