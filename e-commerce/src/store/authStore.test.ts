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

  describe('getInitialAuthState', () => {
    it('returns true when isLoggedIn is "true" in localStorage', async () => {
      localStorage.setItem('isLoggedIn', 'true');
      const { getInitialAuthState } = await import('./authStore');
      expect(getInitialAuthState()).toBe(true);
    });

    it('returns true when isLoggedIn is "true" in sessionStorage', async () => {
      sessionStorage.setItem('isLoggedIn', 'true');
      const { getInitialAuthState } = await import('./authStore');
      expect(getInitialAuthState()).toBe(true);
    });

    it('returns false when isLoggedIn is not set in either storage', async () => {
      const { getInitialAuthState } = await import('./authStore');
      expect(getInitialAuthState()).toBe(false);
    });

    it('returns false when isLoggedIn is set to something other than "true"', async () => {
      localStorage.setItem('isLoggedIn', 'false');
      sessionStorage.setItem('isLoggedIn', '1');
      const { getInitialAuthState } = await import('./authStore');
      expect(getInitialAuthState()).toBe(false);
    });
  });

  describe('authReducer', () => {
    it('handles LOGIN with rememberMe = true', async () => {
      const { authReducer, LOGIN } = await import('./authStore');
      const action = { type: LOGIN, payload: { rememberMe: true, username: 'testuser' } };

      const newState = authReducer(false, action);

      expect(newState).toBe(true);
      expect(localStorage.getItem('isLoggedIn')).toBe('true');
      expect(localStorage.getItem('username')).toBe('testuser');
      expect(sessionStorage.getItem('isLoggedIn')).toBeNull();
    });

    it('handles LOGIN with rememberMe = false', async () => {
      const { authReducer, LOGIN } = await import('./authStore');
      const action = { type: LOGIN, payload: { rememberMe: false, username: 'testuser' } };

      const newState = authReducer(false, action);

      expect(newState).toBe(true);
      expect(sessionStorage.getItem('isLoggedIn')).toBe('true');
      expect(sessionStorage.getItem('username')).toBe('testuser');
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
    });

    it('handles LOGOUT', async () => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', 'testuser');
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('username', 'testuser');

      const { authReducer, LOGOUT } = await import('./authStore');
      const action = { type: LOGOUT };

      const newState = authReducer(true, action as any);

      expect(newState).toBe(false);
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(sessionStorage.getItem('isLoggedIn')).toBeNull();
      expect(sessionStorage.getItem('username')).toBeNull();
    });

    it('returns default state for unknown actions', async () => {
      const { authReducer } = await import('./authStore');
      const action = { type: 'UNKNOWN' };

      const newState = authReducer(false, action as any);
      const newStateTrue = authReducer(true, action as any);

      expect(newState).toBe(false);
      expect(newStateTrue).toBe(true);
    });
  });

  describe('actions', () => {
    it('loginAction with rememberMe = true uses localStorage', async () => {
      const sessionStorageSpy = vi.spyOn(sessionStorage, 'setItem');
      const { authStore, loginAction } = await import('./authStore');

      authStore.dispatch(loginAction('testuser', true));

      expect(authStore.getState().auth).toBe(true);
      expect(localStorage.getItem('isLoggedIn')).toBe('true');
      expect(localStorage.getItem('username')).toBe('testuser');
      expect(sessionStorage.getItem('isLoggedIn')).toBeNull();
      expect(sessionStorageSpy).not.toHaveBeenCalled();

      sessionStorageSpy.mockRestore();
    });

    it('loginAction with rememberMe = false uses sessionStorage', async () => {
      const localStorageSpy = vi.spyOn(localStorage, 'setItem');
      const { authStore, loginAction } = await import('./authStore');

      authStore.dispatch(loginAction('testuser', false));

      expect(authStore.getState().auth).toBe(true);
      expect(sessionStorage.getItem('isLoggedIn')).toBe('true');
      expect(sessionStorage.getItem('username')).toBe('testuser');
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
      expect(localStorageSpy).not.toHaveBeenCalled();

      localStorageSpy.mockRestore();
    });

    it('handles localStorage exceptions gracefully during login', async () => {
      // Mock directly on Storage.prototype since JSDOM uses it for localStorage
      const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { authStore, loginAction } = await import('./authStore');

      authStore.dispatch(loginAction('testuser', true));

      // auth should still be true even if storage fails
      expect(authStore.getState().auth).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save auth state to storage:', expect.any(Error));

      localStorageSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('handles sessionStorage exceptions gracefully during login', async () => {
      const sessionStorageSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { authStore, loginAction } = await import('./authStore');

      authStore.dispatch(loginAction('testuser', false));

      // auth should still be true even if storage fails
      expect(authStore.getState().auth).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save auth state to storage:', expect.any(Error));

      sessionStorageSpy.mockRestore();
      consoleSpy.mockRestore();
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

    it('returns current state for unknown action types', async () => {
      const { authStore } = await import('./authStore');
      const initialState = authStore.getState().auth;

      // Dispatch an action that is not handled by the authReducer
      authStore.dispatch({ type: 'UNKNOWN_ACTION' });

      // State should remain unchanged
      expect(authStore.getState().auth).toBe(initialState);
    });
  });
});
