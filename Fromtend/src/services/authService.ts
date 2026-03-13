import api from './Api';
import type{ User, LoginCredentials, RegisterData } from '../Types/index';

class AuthService {
  private readonly baseUrl = '/auth';

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('AuthService: Sending login request to:', `${this.baseUrl}/login`);
      console.log('AuthService: Credentials:', { email: credentials.email });
      
      const response = await api.post<User>(`${this.baseUrl}/login`, credentials);
      
      console.log('AuthService: Raw response:', response);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<User> {
    const response = await api.post<User>(`${this.baseUrl}/register`, userData);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
    }
    return response;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  async getProfile(): Promise<User> {
    return await api.get<User>(`${this.baseUrl}/profile`);
  }
}

export default new AuthService();