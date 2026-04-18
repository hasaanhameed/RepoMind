import api from '../lib/axios';
import { SignupRequest, LoginRequest, AuthResponse } from '@/api/types/auth_type';

export const signup = async (data: SignupRequest) => {
  const response = await api.post('/user/signup', data);
  return response.data;
};

export const login = async (data: LoginRequest) => {
  const response = await api.post<AuthResponse>('/user/login', data);
  return response.data;
};
