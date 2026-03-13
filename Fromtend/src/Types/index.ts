// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
  dateOfJoining: string;
  leaveBalance: number;
  token?: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'employee' | 'admin';
  dateOfJoining: string;
}

// Leave Types
export type LeaveType = 'Casual' | 'Sick' | 'Paid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  _id: string;
  user: string | User;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveStatus;
  reason?: string;
  appliedDate: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  days:number;
}

export interface LeaveApplicationData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LeaveBalance {
  leaveBalance: number;
}

export interface LeaveTableProps {
  leaves: LeaveRequest[];
  isAdmin?: boolean;
  onAction?: (id: string, status: LeaveStatus) => void | Promise<void>;
  onCancel?: (id: string) => void | Promise<void>;
}
// Attendance Types
export type AttendanceStatus = 'Present' | 'Absent';

export interface Attendance {
  _id: string;
  user: string | User;
  date: string;
  status: AttendanceStatus;
  markedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceMarkData {
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceSummary {
  month: number;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendance: Attendance[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Component Props Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'employee' | 'admin';
}


export interface LeaveFormProps {
  onSubmit: (data: LeaveApplicationData) => void;
  onCancel: () => void;
  initialData?: Partial<LeaveApplicationData>;
}

export interface AttendanceTableProps {
  attendance: Attendance[];
  showUser?: boolean;
}