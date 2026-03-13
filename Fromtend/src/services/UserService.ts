import api from './Api';
import type{ User } from '../Types/index';

class UserService {
  private readonly baseUrl = '/users';

  async getAllUsers(): Promise<User[]> {
    return await api.get<User[]>(this.baseUrl);
  }

  async getUserById(id: string): Promise<User> {
    return await api.get<User>(`${this.baseUrl}/${id}`);
  }

  async updateLeaveBalance(id: string, leaveBalance: number): Promise<{ message: string; user: User }> {
    return await api.put<{ message: string; user: User }>(
      `${this.baseUrl}/${id}/leave-balance`, 
      { leaveBalance }
    );
  }
}

export default new UserService();