import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

export const getInitialAuthState = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    loginAction(_state, action: PayloadAction<{ rememberMe: boolean; username: string }>) {
      try {
        if (action.payload.rememberMe) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', action.payload.username);
        } else {
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('username', action.payload.username);
        }
      } catch (error) {
        console.warn('Failed to save auth state to storage:', error);
      }
      return true;
    },
    logoutAction() {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('username');
      return false;
    }
  }
});

export const { loginAction, logoutAction } = authSlice.actions;
export const authReducer = authSlice.reducer;

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const getInitialProfileState = (): ProfileData => {
  const saved = localStorage.getItem('profileData');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return {
    name: 'Lê Văn B',
    email: 'levanb@gmail.com',
    phone: '0987 654 321',
    address: '120 Yên Lãng, Đống Đa, Hà Nội'
  };
};

const profileSlice = createSlice({
  name: 'profile',
  initialState: getInitialProfileState(),
  reducers: {
    updateProfile(state, action: PayloadAction<ProfileData>) {
      const newState = { ...state, ...action.payload };
      localStorage.setItem('profileData', JSON.stringify(newState));
      return newState;
    }
  }
});

export const { updateProfile } = profileSlice.actions;

export const authStore = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileSlice.reducer
  },
  preloadedState: {
    auth: getInitialAuthState(),
    profile: getInitialProfileState()
  },
});

export type RootState = ReturnType<typeof authStore.getState>;

