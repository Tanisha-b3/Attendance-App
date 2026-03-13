import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import toast from "react-hot-toast";
import leaveService from "../services/leaveService";
import attendanceService from "../services/attendanceService";
import { useAuth } from "../context/AuthContext";
import LeaveForm from "../leaves/leaveForm";
import LeaveTable from "../leaves/leaveTable";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
  Loader2,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import type { LeaveRequest, Attendance, LeaveApplicationData } from "../Types";

/* ─── Stat card ──────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, iconBg, sub }) => (
  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4
                  dark:border-white/10 dark:bg-white/5">
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="truncate text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

/* ─── Heatmap ────────────────────────────────────────────────── */
const Heatmap: React.FC<{ attendance: Attendance[] }> = ({ attendance }) => {
  const now = new Date();
  const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });

  return (
    <div className="flex flex-wrap gap-1">
      {days.map((day) => {
        const rec = attendance.find((a) => a.date === format(day, "yyyy-MM-dd"));
        const today = isSameDay(day, now);
        const bg = rec?.status === "Present"
          ? "bg-emerald-500"
          : rec?.status === "Absent"
          ? "bg-red-400"
          : "bg-gray-100 dark:bg-white/10";
        return (
          <div
            key={day.toISOString()}
            title={`${format(day, "MMM d")}${rec ? ` · ${rec.status}` : ""}`}
            className={`h-[18px] w-[18px] rounded-[3px] transition-transform hover:scale-110 ${bg}
                        ${today ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
          />
        );
      })}
    </div>
  );
};

/* ─── Status pill ────────────────────────────────────────────── */
const StatusPill: React.FC<{ status?: string }> = ({ status }) => {
  if (!status) return null;
  const present = status === "Present";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
      ${present
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
        : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
      }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${present ? "bg-emerald-500" : "bg-red-500"}`} />
      {status}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<number>(user?.leaveBalance ?? 20);
  const [loading, setLoading] = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [leavesRes, attendanceRes, balanceRes] = await Promise.all([
        leaveService.getUserLeaves(),
        attendanceService.getUserAttendance(),
        leaveService.getLeaveBalance(),
      ]);
      console.log("Dashboard data:", { leavesRes, attendanceRes, balanceRes });
      setLeaveRequests(leavesRes);
      setAttendance(attendanceRes);
      setLeaveBalance(balanceRes.leaveBalance);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (): Promise<void> => {
    const today = new Date().toISOString().split("T")[0];
    if (attendance.find((a) => a.date === today)) {
      toast.error("Already marked today");
      return;
    }
    try {
      setMarkingAttendance(true);
      await attendanceService.markAttendance({ date: today, status: "Present" });
      toast.success("Attendance marked");
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to mark attendance");
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleLeaveSubmit = async (data: LeaveApplicationData): Promise<void> => {
    try {
      await leaveService.applyLeave(data);
      toast.success("Leave submitted");
      setShowLeaveForm(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to submit leave");
    }
  };

 /* ── derived ── */
const todayStr = new Date().toISOString().split("T")[0];

const todayAttendance = (attendance ?? []).find((a) => a.date === todayStr);

const pendingLeaves = (leaveRequests ?? []).filter(
  (l) => l.status === "Pending"
).length;

const totalPresent = (attendance ?? []).filter(
  (a) => a.status === "Present"
).length;

const approvedLeaves = (leaveRequests ?? []).filter(
  (l) => l.status === "Approved"
).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5 pb-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
            <h1 className="mt-0.5 text-xl font-semibold text-gray-900 dark:text-white">
              Welcome back, {user?.name}
            </h1>
          </div>

          {todayAttendance ? (
            <StatusPill status={todayAttendance.status} />
          ) : (
            <Button
              onClick={handleMarkAttendance}
              disabled={markingAttendance}
              size="sm"
              className="rounded-lg bg-gray-900 text-white hover:bg-gray-700
                         dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              {markingAttendance
                ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                : <Clock className="mr-1.5 h-3.5 w-3.5" />}
              Mark attendance
            </Button>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Leave balance"
            value={leaveBalance}
            sub="days remaining"
            icon={<CalendarIcon className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-50 dark:bg-blue-500/15"
          />
          <StatCard
            label="Pending"
            value={pendingLeaves}
            icon={<AlertCircle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />}
            iconBg="bg-amber-50 dark:bg-amber-500/15"
          />
          <StatCard
            label="Days present"
            value={totalPresent}
            icon={<TrendingUp className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />}
            iconBg="bg-emerald-50 dark:bg-emerald-500/15"
          />
          <StatCard
            label="Approved leaves"
            value={approvedLeaves}
            icon={<CheckCircle2 className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />}
            iconBg="bg-violet-50 dark:bg-violet-500/15"
          />
        </div>

        {/* ── Heatmap ── */}
        <div className="rounded-xl border border-gray-100 bg-white p-5
                        dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {format(new Date(), "MMMM yyyy")}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-emerald-500" />
                Present
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-red-400" />
                Absent
              </span>
            </div>
          </div>
          <Heatmap attendance={attendance} />
        </div>

        {/* ── Calendar + Day detail ── */}
        

        {/* ── Leave requests ── */}
        <div className="rounded-xl border border-gray-100 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between border-b border-gray-100
                          px-5 py-3.5 dark:border-white/10">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">Leave requests</p>
              <p className="text-xs text-gray-400">5 most recent</p>
            </div>
            <button
              onClick={() => setShowLeaveForm(true)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white
                         px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50
                         dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Apply
            </button>
          </div>

          <div className="p-5">
            {leaveRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
                <CalendarIcon className="h-6 w-6 opacity-30" />
                <p className="text-sm">No leave requests yet</p>
              </div>
            ) : (
              <LeaveTable leaves={leaveRequests.slice(0, 5)} />
            )}
          </div>
        </div>

      </div>

      {/* ── Dialog ── */}
      <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Apply for leave</DialogTitle>
          </DialogHeader>
          <LeaveForm
            onSubmit={handleLeaveSubmit}
            onCancel={() => setShowLeaveForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeeDashboard;
