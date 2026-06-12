import { configureStore } from '@reduxjs/toolkit';

export const LOGIN = 'auth/login';
export const LOGOUT = 'auth/logout';

interface LoginAction {
  type: typeof LOGIN;
  payload: { rememberMe: boolean; username: string };
}

interface LogoutAction {
  type: typeof LOGOUT;
}

type AuthAction = LoginAction | LogoutAction;

function authReducer(state = false, action: AuthAction): boolean {
  switch (action.type) {
    case LOGIN:
      if (action.payload.rememberMe) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', action.payload.username);
      } else {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', action.payload.username);
      }
      return true;
    case LOGOUT:
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('username');
      return false;
    default:
      return state;
  }
}

const getInitialAuthState = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true';
};

export const authStore = configureStore({
  reducer: authReducer,
  preloadedState: getInitialAuthState(),
});

export const loginAction = (username: string, rememberMe: boolean) => ({
  type: LOGIN,
  payload: { username, rememberMe },
});

export const logoutAction = () => ({
  type: LOGOUT,
});
