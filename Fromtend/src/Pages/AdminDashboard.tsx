import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../components/ui/drawer";
import toast from "react-hot-toast";
import leaveService from "../services/leaveService";
import attendanceService from "../services/attendanceService";
import userService from "../services/UserService";
import { 
  Users, 
  Calendar, 
  Clock, 
  UserCheck, 
  UserX, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  RefreshCw,
  Mail,
  X,
  Bell,
} from "lucide-react";
import type { LeaveRequest, Attendance, User } from "../Types";

interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  presentToday: number;
  onLeaveToday: number;
  absentToday: number;
  leaveApproved: number;
  leaveRejected: number;
  totalDepartments: number;
  attendanceRate: number;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
};

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Pagination states
  const [leavePagination, setLeavePagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: isMobile ? 3 : 5,
    totalItems: 0,
  });
  const [attendancePagination, setAttendancePagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: isMobile ? 3 : 5,
    totalItems: 0,
  });
  const [usersPagination, setUsersPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: isMobile ? 3 : 5,
    totalItems: 0,
  });

  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    presentToday: 0,
    onLeaveToday: 0,
    absentToday: 0,
    leaveApproved: 0,
    leaveRejected: 0,
    totalDepartments: 0,
    attendanceRate: 0,
  });

  // Update items per page when screen size changes
  useEffect(() => {
    const itemsPerPage = isMobile ? 3 : 5;
    setLeavePagination(prev => ({ ...prev, itemsPerPage }));
    setAttendancePagination(prev => ({ ...prev, itemsPerPage }));
    setUsersPagination(prev => ({ ...prev, itemsPerPage }));
  }, [isMobile]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaveRequests, searchTerm, statusFilter]);

  useEffect(() => {
    filterAttendance();
  }, [attendance, searchTerm]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [usersRes, leavesRes, attendanceRes] = await Promise.all([
        userService.getAllUsers(),
        leaveService.getAllLeaves(),
        attendanceService.getAllAttendance(),
      ]);

      setUsers(usersRes);
      setLeaveRequests(leavesRes);
      setAttendance(attendanceRes);

      calculateStats(usersRes, leavesRes, attendanceRes);
      
      // Initialize pagination totals
      setLeavePagination(prev => ({ ...prev, totalItems: leavesRes.length }));
      setUsersPagination(prev => ({ ...prev, totalItems: usersRes.length }));
      setAttendancePagination(prev => ({ ...prev, totalItems: attendanceRes.length }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success("Dashboard updated");
  };

  const filterLeaves = () => {
    let filtered = [...leaveRequests];
    
    if (searchTerm) {
      filtered = filtered.filter(leave => {
        const userName = typeof leave.user !== "string" ? leave.user.name : "";
        return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.status?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }
    
    setFilteredLeaves(filtered);
    setLeavePagination(prev => ({ ...prev, totalItems: filtered.length, currentPage: 1 }));
  };

  const filterAttendance = () => {
    let filtered = [...attendance];
    
    if (searchTerm) {
      filtered = filtered.filter(record => {
        const userName = typeof record.user !== "string" ? record.user.name : "";
        return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.status?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    setFilteredAttendance(filtered);
    setAttendancePagination(prev => ({ ...prev, totalItems: filtered.length, currentPage: 1 }));
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
    setUsersPagination(prev => ({ ...prev, totalItems: filtered.length, currentPage: 1 }));
  };

  const calculateStats = (
    users: User[],
    leaves: LeaveRequest[],
    attendance: Attendance[]
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const departments = new Set(users.map(u => u.role).filter(Boolean));

    const presentToday = attendance.filter(
      (a) => a.date === today && a.status === "Present"
    ).length;

    const onLeaveToday = leaves.filter(
      (l) =>
        l.status === "Approved" &&
        new Date(l.startDate) <= new Date() &&
        new Date(l.endDate) >= new Date()
    ).length;

    const totalAttendance = attendance.filter(a => a.status === "Present").length;
    const attendanceRate = users.length > 0 
      ? Math.round((totalAttendance / (users.length * 30)) * 100) 
      : 0;

    setStats({
      totalEmployees: users.length,
      pendingLeaves: leaves.filter((l) => l.status === "Pending").length,
      presentToday,
      onLeaveToday,
      absentToday: users.length - presentToday - onLeaveToday,
      leaveApproved: leaves.filter((l) => l.status === "Approved").length,
      leaveRejected: leaves.filter((l) => l.status === "Rejected").length,
      totalDepartments: departments.size,
      attendanceRate,
    });
  };

  const handleLeaveAction = async (
    id: string,
    status: "Approved" | "Rejected"
  ) => {
    try {
      await leaveService.updateLeaveStatus(id, { status });
      toast.success(`Leave request ${status.toLowerCase()}`);
      
      setLeaveRequests((prev) =>
        prev.map((leave) =>
          leave._id === id ? { ...leave, status } : leave
        )
      );
      
      calculateStats(users, leaveRequests, attendance);
      setDetailsOpen(false);
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} leave request`);
    }
  };

  // Pagination helpers
  const getPaginatedData = <T,>(data: T[], pagination: PaginationState): T[] => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return data.slice(start, end);
  };

  const handlePageChange = (
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>,
    direction: "first" | "prev" | "next" | "last"
  ) => {
    setPagination((prev) => {
      let newPage = prev.currentPage;
      const totalPages = Math.ceil(prev.totalItems / prev.itemsPerPage);

      switch (direction) {
        case "first":
          newPage = 1;
          break;
        case "prev":
          newPage = Math.max(1, prev.currentPage - 1);
          break;
        case "next":
          newPage = Math.min(totalPages, prev.currentPage + 1);
          break;
        case "last":
          newPage = totalPages;
          break;
      }

      return { ...prev, currentPage: newPage };
    });
  };

  const handleItemsPerPageChange = (
    value: string,
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  ) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: parseInt(value),
      currentPage: 1,
    }));
  };

  // Pagination Controls Component
  const PaginationControls = ({ 
    pagination, 
    setPagination,
    compact = false
  }: { 
    pagination: PaginationState; 
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
    compact?: boolean;
  }) => {
    const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
    const startItem = pagination.totalItems > 0 
      ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1 
      : 0;
    const endItem = pagination.totalItems > 0 
      ? Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) 
      : 0;
    
    const hasNoContent = pagination.totalItems === 0;
    const isFirstPage = pagination.currentPage === 1 || hasNoContent;
    const isLastPage = pagination.currentPage === totalPages || hasNoContent || totalPages === 0;

    if (compact) {
      return (
        <div className="flex items-center justify-between px-2 py-3 border-t border-gray-200">
          <div className="text-xs text-gray-700">
            {hasNoContent ? '0-0 of 0' : `${startItem}-${endItem} of ${pagination.totalItems}`}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(setPagination, 'prev')}
              disabled={isFirstPage}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs text-gray-700 min-w-[40px] text-center">
              {hasNoContent ? '0/0' : `${pagination.currentPage}/${totalPages}`}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(setPagination, 'next')}
              disabled={isLastPage}
              className="h-7 w-7"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 border-t border-gray-200 gap-4">
        <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <p className="text-xs sm:text-sm text-gray-700">Rows per page</p>
            <Select
              value={pagination.itemsPerPage.toString()}
              onValueChange={(value) => value && handleItemsPerPageChange(value, setPagination)}
              disabled={hasNoContent}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs sm:text-sm text-gray-700">
            {hasNoContent ? '0-0 of 0' : `${startItem}-${endItem} of ${pagination.totalItems}`}
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(setPagination, 'first')}
            disabled={isFirstPage}
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(setPagination, 'prev')}
            disabled={isFirstPage}
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <span className="text-xs sm:text-sm text-gray-700 min-w-[60px] sm:min-w-[80px] text-center">
            {hasNoContent ? '0/0' : `${pagination.currentPage}/${totalPages}`}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(setPagination, 'next')}
            disabled={isLastPage}
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(setPagination, 'last')}
            disabled={isLastPage}
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Mobile-friendly detail view
  const EmployeeDetailView = ({ employee }: { employee: User; onClose: () => void }) => {
    const employeeAttendance = attendance.filter(
      (a) => typeof a.user !== "string" && a.user._id === employee._id
    );
    const presentCount = employeeAttendance.filter(a => a.status === "Present").length;
    const attendanceRate = employeeAttendance.length > 0 
      ? Math.round((presentCount / employeeAttendance.length) * 100) 
      : 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${employee.name}&background=0D9488&color=fff`} />
              <AvatarFallback>{employee.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{employee.name}</h3>
              <p className="text-sm text-gray-500">{employee.role || 'Employee'}</p>
            </div>
          </div>
          {/* <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button> */}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Leave Balance</p>
            <p className="font-medium text-sm">{employee.leaveBalance || 0} days</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Attendance Rate</p>
            <p className="font-medium text-sm">{attendanceRate}%</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Badge className={employee.isActive ? 'bg-green-500' : 'bg-gray-500'}>
              {employee.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>


      </div>
    );
  };

  const LeaveDetailView = ({ leave, onClose }: { leave: LeaveRequest; onClose: () => void }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${typeof leave.user !== "string" ? leave.user.name : leave.user}`} />
            <AvatarFallback>{typeof leave.user !== "string" ? leave.user.name?.charAt(0) : leave.user?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{typeof leave.user !== "string" ? leave.user.name : "Unknown"}</h3>
            <p className="text-xs text-gray-500">{typeof leave.user !== "string" ? leave.user.email : ""}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <Badge
            className={
              leave.status === "Approved"
                ? "bg-green-500 text-white"
                : leave.status === "Rejected"
                ? "bg-red-500 text-white"
                : "bg-yellow-500 text-white"
            }
          >
            {leave.status}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Type</span>
          <span className="text-sm font-medium">{leave.leaveType || 'Annual'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Duration</span>
          <span className="text-sm font-medium">
            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Days</span>
          <span className="text-sm font-medium">{leave.days || 1}</span>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500 mb-1">Reason</p>
        <p className="text-sm bg-gray-50 p-3 rounded-lg">{leave.reason}</p>
      </div>

      {leave.status === 'Pending' && (
        <div className="flex space-x-2 pt-2">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="sm"
            onClick={() => handleLeaveAction(leave._id, "Approved")}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            size="sm"
            onClick={() => handleLeaveAction(leave._id, "Rejected")}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      {/* Mobile Header */}
      <div className="sm:hidden flex items-center justify-between sticky top-0 bg-white z-10 py-3 px-1">
        <div>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage employees, leaves, and attendance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4">
        <StatCard
          title="Total Emp"
          value={stats.totalEmployees}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={stats.pendingLeaves}
          icon={AlertCircle}
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={stats.leaveApproved}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Present"
          value={stats.presentToday}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="On Leave"
          value={stats.onLeaveToday}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Absent"
          value={stats.absentToday}
          icon={UserX}
          color="red"
        />
      </div>

      {/* Search and Filter - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={isMobile ? "Search..." : "Search by name, email, department..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 sm:h-10 text-sm"
          />
        </div>
<Select
  value={statusFilter}
  onValueChange={(value) => setStatusFilter(value ?? "all")}
>
          <SelectTrigger className="w-full sm:w-[150px] h-9 sm:h-10">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="leaves" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
          <TabsTrigger value="leaves" className="text-xs sm:text-sm">Leaves</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm">Attendance</TabsTrigger>
          <TabsTrigger value="employees" className="text-xs sm:text-sm">Employees</TabsTrigger>
        </TabsList>

        {/* Leave Requests Tab */}
        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader className="px-4 py-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Leave Requests</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {isMobile ? (
                // Mobile leave cards view
                <div className="space-y-3">
                  {getPaginatedData(filteredLeaves, leavePagination).map((leave) => {
                    const userName = typeof leave.user !== "string" ? leave.user.name : "Unknown";
                    return (
                      <div key={leave._id} className="bg-white border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://ui-avatars.com/api/?name=${userName}`} />
                              <AvatarFallback>{userName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{userName}</p>
                              <p className="text-xs text-gray-500">{leave.leaveType || 'Annual'}</p>
                            </div>
                          </div>
                          <Badge
                            className={
                              leave.status === "Approved"
                                ? "bg-green-500 text-white"
                                : leave.status === "Rejected"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-white"
                            }
                          >
                            {leave.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          {leave.status === 'Pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-green-600"
                                onClick={() => handleLeaveAction(leave._id, "Approved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleLeaveAction(leave._id, "Rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Desktop leave table view
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Employee</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Duration</TableHead>
                        <TableHead className="text-xs">Reason</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(filteredLeaves, leavePagination).map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${typeof leave.user !== "string" ? leave.user.name : leave.user}`} />
                                <AvatarFallback>
                                  {typeof leave.user !== "string"
                                    ? leave.user.name?.charAt(0)
                                    : leave.user?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{typeof leave.user !== "string" ? leave.user.name : leave.user}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{leave.leaveType || 'Annual'}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{leave.reason}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                leave.status === "Approved"
                                  ? "bg-green-500 text-white"
                                  : leave.status === "Rejected"
                                  ? "bg-red-500 text-white"
                                  : "bg-yellow-500 text-white"
                              }
                            >
                              {leave.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  className="text-xs"
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {leave.status === 'Pending' && (
                                  <>
                                    <DropdownMenuItem 
                                      className="text-xs text-green-600"
                                      onClick={() => handleLeaveAction(leave._id, "Approved")}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-xs text-red-600"
                                      onClick={() => handleLeaveAction(leave._id, "Rejected")}
                                    >
                                      <XCircle className="h-3 w-3 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {filteredLeaves.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-500 text-sm">No leave requests found</p>
                </div>
              )}
            </CardContent>
            <PaginationControls
              pagination={leavePagination}
              setPagination={setLeavePagination}
              compact={isMobile}
            />
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader className="px-4 py-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {isMobile ? (
                // Mobile attendance cards
                <div className="space-y-3">
                  {getPaginatedData(filteredAttendance, attendancePagination).map((record) => { 
                    const userName = typeof record.user !== "string" ? record.user.name : record.user;
                    return (
                      <div key={record._id} className="bg-white border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://ui-avatars.com/api/?name=${userName}`} />
                              <AvatarFallback>{userName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{userName}</p>
                            </div>
                          </div>
                          <Badge
                            className={
                              record.status === 'Present' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-500 text-white'
                            }
                          >
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Desktop attendance table
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Employee</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(filteredAttendance, attendancePagination).map((record) => (
                        <TableRow key={record._id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${typeof record.user !== "string" ? record.user.name : record.user}`} />
                                <AvatarFallback>
                                  {typeof record.user !== "string"
                                    ? record.user.name?.charAt(0)
                                    : record.user?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {typeof record.user !== "string" ? record.user.name : record.user}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                record.status === 'Present' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-500 text-white'
                              }
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {filteredAttendance.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-500 text-sm">No attendance records found</p>
                </div>
              )}
            </CardContent>
            <PaginationControls
              pagination={attendancePagination}
              setPagination={setAttendancePagination}
              compact={isMobile}
            />
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees">
          <Card>
            <CardHeader className="px-4 py-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Employee Directory</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {isMobile ? (
                // Mobile employee cards
                <div className="space-y-3">
                  {getPaginatedData(filteredUsers, usersPagination).map((user) => (
                    <div 
                      key={user._id} 
                      className="bg-white border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedEmployee(user);
                        setDetailsOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=0D9488&color=fff`} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role || 'Employee'}</p>
                          </div>
                        </div>
                        <Badge className={user.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div>
                          <span className="font-medium">{user.leaveBalance || 0} days</span> leave
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop employee table
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Employee</TableHead>
                        <TableHead className="text-xs">Position</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Leave Balance</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedData(filteredUsers, usersPagination).map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=0D9488&color=fff`} />
                                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{user.role || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.isActive 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-500 text-white'
                              }
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{user.leaveBalance || 0} days</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  className="text-xs"
                                  onClick={() => {
                                    setSelectedEmployee(user);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-500 text-sm">No employees found</p>
                </div>
              )}
            </CardContent>
            <PaginationControls
              pagination={usersPagination}
              setPagination={setUsersPagination}
              compact={isMobile}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Drawer for Mobile / Dialog for Desktop */}
      {isMobile ? (
        <Drawer open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {selectedEmployee ? 'Employee Details' : selectedLeave ? 'Leave Details' : 'Details'}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">
              {selectedEmployee && (
                <EmployeeDetailView 
                  employee={selectedEmployee} 
                  onClose={() => setDetailsOpen(false)} 
                />
              )}
              {selectedLeave && (
                <LeaveDetailView 
                  leave={selectedLeave} 
                  onClose={() => setDetailsOpen(false)} 
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee ? 'Employee Details' : selectedLeave ? 'Leave Details' : 'Details'}
              </DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <EmployeeDetailView 
                employee={selectedEmployee} 
                onClose={() => setDetailsOpen(false)} 
              />
            )}
            {selectedLeave && (
              <LeaveDetailView 
                leave={selectedLeave} 
                onClose={() => setDetailsOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Stat Card Component - Responsive
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  compact?: boolean;
}> = ({ title, value, icon: Icon, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">{title}</p>
          <p className="text-base sm:text-xl font-light mt-0.5 sm:mt-1">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-1.5 sm:p-2 rounded-lg`}>
          <Icon className="h-3 w-3 sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;