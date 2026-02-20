import Cookies from 'js-cookie';
import api from './api';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'staff';
}

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data;
  
  Cookies.set('token', token, { expires: 7 });
  
  return user;
};

export const logout = () => {
  Cookies.remove('token');
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!Cookies.get('token');
};
