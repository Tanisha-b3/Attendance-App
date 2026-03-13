import api from './Api';
import type{ LeaveRequest, LeaveApplicationData, LeaveBalance, LeaveStatus } from '../Types/index';

class LeaveService {
  private readonly baseUrl = '/leaves';

  async applyLeave(leaveData: LeaveApplicationData): Promise<LeaveRequest> {
    return await api.post<LeaveRequest>(`${this.baseUrl}/apply`, leaveData);
  }

  async getUserLeaves(): Promise<LeaveRequest[]> {
    return await api.get<LeaveRequest[]>(`${this.baseUrl}/my-leaves`);
  }

  async getAllLeaves(): Promise<LeaveRequest[]> {
    return await api.get<LeaveRequest[]>(`${this.baseUrl}/all`);
  }

  async updateLeaveStatus(id: string, statusData: { status: LeaveStatus; comments?: string }): Promise<LeaveRequest> {
    return await api.put<LeaveRequest>(`${this.baseUrl}/${id}/status`, statusData);
  }

  async cancelLeave(id: string): Promise<{ message: string }> {
    return await api.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  async getLeaveBalance(): Promise<LeaveBalance> {
    return await api.get<LeaveBalance>(`${this.baseUrl}/balance`);
  }
}

export default new LeaveService();