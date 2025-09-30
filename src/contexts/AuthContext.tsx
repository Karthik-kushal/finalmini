import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types/auth';
import { API_BASE_URL } from '../config';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('campus_connect_user');
    if (storedUser) {
      setAuthState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        isLoading: false,
      });
      // Also restore userId separately for event creation
      const userObj = JSON.parse(storedUser);
      if (userObj && userObj._id) {
        localStorage.setItem('userId', userObj._id);
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Login
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Login failed');
      }

      const user = await res.json();
      localStorage.setItem('campus_connect_user', JSON.stringify(user));
      // Save userId separately for event creation
      if (user._id) {
        localStorage.setItem('userId', user._id);
      }
      setAuthState({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Register
  const register = async (data: RegisterData): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Registration failed');
      }

      const user = await res.json();
      localStorage.setItem('campus_connect_user', JSON.stringify(user));
      // Save userId separately for event creation
      if (user._id) {
        localStorage.setItem('userId', user._id);
      }
      setAuthState({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('campus_connect_user');
    localStorage.removeItem('userId'); // Remove userId as well
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
