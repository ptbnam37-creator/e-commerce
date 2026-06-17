import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.resetModules();
  });

  describe('initialization', () => {
    it('initializes auth to true if isLoggedIn is in localStorage', async () => {
      localStorage.setItem('isLoggedIn', 'true');
      const { authStore } = await import('./authStore');
      expect(authStore.getState().auth).toBe(true);
    });

    it('initializes auth to true if isLoggedIn is in sessionStorage', async () => {
      sessionStorage.setItem('isLoggedIn', 'true');
      const { authStore } = await import('./authStore');
      expect(authStore.getState().auth).toBe(true);
    });

    it('initializes auth to false if not logged in', async () => {
      const { authStore } = await import('./authStore');
      expect(authStore.getState().auth).toBe(false);
    });

    it('initializes profile from localStorage when valid JSON is present', async () => {
      const mockProfile = {
        name: 'Test Name',
        email: 'test@example.com',
        phone: '123456789',
        address: 'Test Address',
      };
      localStorage.setItem('profileData', JSON.stringify(mockProfile));
      const { authStore } = await import('./authStore');
      expect(authStore.getState().profile).toEqual(mockProfile);
    });

    it('falls back to default profile when localStorage has invalid JSON', async () => {
      localStorage.setItem('profileData', 'invalid-json');
      const { authStore } = await import('./authStore');
      expect(authStore.getState().profile).toEqual({
        name: 'Lê Văn B',
        email: 'levanb@gmail.com',
        phone: '0987 654 321',
        address: '120 Yên Lãng, Đống Đa, Hà Nội',
      });
    });
  });

  describe('actions', () => {
    it('loginAction with rememberMe = true uses localStorage', async () => {
      const { authStore, loginAction } = await import('./authStore');

      authStore.dispatch(loginAction('testuser', true));

      expect(authStore.getState().auth).toBe(true);
      expect(localStorage.getItem('isLoggedIn')).toBe('true');
      expect(localStorage.getItem('username')).toBe('testuser');
      expect(sessionStorage.getItem('isLoggedIn')).toBeNull();
    });

    it('loginAction with rememberMe = false uses sessionStorage', async () => {
      const { authStore, loginAction } = await import('./authStore');

      authStore.dispatch(loginAction('testuser', false));

      expect(authStore.getState().auth).toBe(true);
      expect(sessionStorage.getItem('isLoggedIn')).toBe('true');
      expect(sessionStorage.getItem('username')).toBe('testuser');
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
    });

    it('logoutAction clears both storages and sets auth to false', async () => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', 'testuser');
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('username', 'testuser');

      const { authStore, logoutAction } = await import('./authStore');

      // initially true due to localStorage mock setup
      expect(authStore.getState().auth).toBe(true);

      authStore.dispatch(logoutAction());

      expect(authStore.getState().auth).toBe(false);
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(sessionStorage.getItem('isLoggedIn')).toBeNull();
      expect(sessionStorage.getItem('username')).toBeNull();
    });

    it('updateProfile action updates state and localStorage', async () => {
      const { authStore, updateProfile } = await import('./authStore');

      const newProfileData = {
        name: 'New Name',
        email: 'new@example.com',
        phone: '987654321',
        address: 'New Address',
      };

      authStore.dispatch(updateProfile(newProfileData));

      expect(authStore.getState().profile).toEqual(newProfileData);
      expect(localStorage.getItem('profileData')).toBe(JSON.stringify(newProfileData));
    });
  });
});
