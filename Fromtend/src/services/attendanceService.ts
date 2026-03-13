import api from './Api';
import type{ Attendance, AttendanceMarkData, AttendanceSummary } from '../Types/index';

class AttendanceService {
  private readonly baseUrl = '/attendance';

  async markAttendance(data: AttendanceMarkData): Promise<Attendance> {
    try {
      if (!data.date || !data.status) {
        throw new Error('Date and status are required');
      }
      const formattedData = {
        ...data,
        date: data.date.split('T')[0] // Remove time if present
      };

      const response = await api.post<Attendance>(`${this.baseUrl}/mark`, formattedData);
      return response;
    } catch (error) {
      console.error('Error in markAttendance service:', error);
      throw error;
    }
  }

  async getUserAttendance(month?: number, year?: number): Promise<Attendance[]> {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      
      const response = await api.get<Attendance[]>(`${this.baseUrl}/my-attendance?${params}`);
      return response;
    } catch (error) {
      console.error('Error in getUserAttendance service:', error);
      throw error;
    }
  }

  async getAllAttendance(filters?: { date?: string; userId?: string }): Promise<Attendance[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.date) {
        params.append('date', filters.date.split('T')[0]);
      }
      
      if (filters?.userId && filters.userId !== 'all') {
        params.append('userId', filters.userId);
      }
      
      const response = await api.get<Attendance[]>(`${this.baseUrl}/all?${params}`);
      return response;
    } catch (error) {
      console.error('Error in getAllAttendance service:', error);
      throw error;
    }
  }

  async getAttendanceSummary(userId: string | null, month: number, year: number): Promise<AttendanceSummary> {
    try {
      const params = new URLSearchParams({ 
        month: month.toString(), 
        year: year.toString() 
      });
      
      const url = userId 
        ? `${this.baseUrl}/summary/${userId}?${params}` 
        : `${this.baseUrl}/summary?${params}`;
        
      const response = await api.get<AttendanceSummary>(url);
      return response;
    } catch (error) {
      console.error('Error in getAttendanceSummary service:', error);
      throw error;
    }
  }
}

export default new AttendanceService();