import React, { createContext, useState, useContext, useEffect, } from 'react';
import type{ReactNode} from 'react';
import authService from '../services/authService';
import type{ User, RegisterData } from '../Types/index';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const user = await authService.login({ email, password });
      setUser(user);
      toast.success('Login successful!');
      return user;
    } catch (error: any) {
      console.error('Login error in context:', error);
      
      // Extract error message
      const message = error?.response?.data?.message || 
                     error?.message || 
                     'Login failed';
      
      toast.error(message);
      throw error; // Re-throw so the component can handle it
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      const user = await authService.register(userData);
      setUser(user);
      toast.success('Registration successful!');
      return user;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};