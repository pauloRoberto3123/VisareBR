import api from './blogService';

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export const login = (credentials: { email: string; password: any }) => 
  api.post<LoginResponse>('/identity/login', credentials);

export const register = (userData: any) => 
  api.post('/identity/register', userData);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Initialize token from localStorage if exists
const savedToken = localStorage.getItem('token');
if (savedToken) {
  setAuthToken(savedToken);
}
