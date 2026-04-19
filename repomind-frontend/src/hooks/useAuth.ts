import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, signup as signupApi, getMe as getMeApi } from '../api/auth';
import { LoginRequest, SignupRequest } from '../api/types/auth_type';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const navigate = useNavigate();

  const fetchMe = async () => {
    try {
      const userData = await getMeApi();
      setUser(userData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginApi(data);
      localStorage.setItem('token', response.access_token);
      await fetchMe();
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    setLoading(true);
    setError(null);
    try {
      await signupApi(data);
      // Redirect to login or auto-login could happen here
      // For now, let's return true on success
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/auth');
  };

  return { login, signup, logout, fetchMe, user, loading, error, setError };
};
