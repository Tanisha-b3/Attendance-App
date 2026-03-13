import React, { useState, useEffect, useCallback } from "react";
import { Calendar } from "../components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import attendanceService from "../services/attendanceService";
import userService from "../services/UserService";
import type { Attendance as AttendanceType, User } from "../Types";
import {
  format,
  isBefore,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarDays,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const PAGE_SIZES = [5, 10, 20] as const;

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const present = status === "Present";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium
        ${present
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
        }`}
    >
      {present ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {status}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
}> = ({ label, value, icon, iconBg, sub }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white">{value}</p>
      <p className="truncate text-xs text-gray-400">{label}</p>
      {sub && <p className="text-[10px] text-gray-300 dark:text-gray-600">{sub}</p>}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   HEATMAP
───────────────────────────────────────────────────────────── */
const Heatmap: React.FC<{ attendance: AttendanceType[]; month: Date }> = ({ attendance, month }) => {
  const days      = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const today     = new Date();
  const firstDay  = days[0].getDay(); // 0=Sun offset for grid alignment

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {format(month, "MMMM yyyy")}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Present
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" /> Absent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gray-100 dark:bg-white/10" /> —
          </span>
        </div>
      </div>

      {/* Day-of-week labels */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="flex h-[18px] items-center justify-center text-[9px] font-medium text-gray-300 dark:text-gray-600">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-[18px] w-full" />
        ))}
        {days.map((day) => {
          const rec     = attendance.find((a) => a.date === format(day, "yyyy-MM-dd"));
          const isToday = isSameDay(day, today);
          const bg      = rec?.status === "Present"
            ? "bg-emerald-500 dark:bg-emerald-500"
            : rec?.status === "Absent"
            ? "bg-red-400 dark:bg-red-500"
            : "bg-gray-100 dark:bg-white/10";
          return (
            <div
              key={day.toISOString()}
              title={`${format(day, "MMM d")}${rec ? ` · ${rec.status}` : " · No record"}`}
              className={`h-[18px] w-full cursor-default rounded-[3px] transition-transform hover:scale-110
                          ${bg} ${isToday ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────────────────────── */
const PageBtn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, active, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex h-7 min-w-[28px] items-center justify-center rounded-md border px-2
                text-xs font-medium transition disabled:pointer-events-none disabled:opacity-40
      ${active
        ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
      }`}
  >
    {children}
  </button>
);

const PaginationBar: React.FC<{
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}> = ({ total, page, pageSize, onPage, onPageSize }) => {
  const totalPages = Math.ceil(total / pageSize);
  const start      = (page - 1) * pageSize;
  if (total <= PAGE_SIZES[0]) return null;

  const nums = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const arr: (number | "…")[] = [1];
    if (page > 3) arr.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i);
    if (page < totalPages - 2) arr.push("…");
    arr.push(totalPages);
    return arr;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100
                    px-5 py-3 dark:border-white/10 sm:flex-row">
      <div className="flex items-center gap-3">
        <p className="text-xs text-gray-400">
          {start + 1}–{Math.min(start + pageSize, total)}{" "}
          <span className="text-gray-300 dark:text-gray-600">of</span> {total}
        </p>
        <div className="flex items-center gap-0.5">
          {PAGE_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => { onPageSize(s); onPage(1); }}
              className={`h-6 rounded px-2 text-xs font-medium transition
                ${pageSize === s
                  ? "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
            >
              {s}
            </button>
          ))}
          <span className="ml-1 text-xs text-gray-300 dark:text-gray-600">/ page</span>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <PageBtn onClick={() => onPage(page - 1)} disabled={page === 1}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </PageBtn>
          {nums().map((n, i) =>
            n === "…"
              ? <span key={`e${i}`} className="px-1 text-xs text-gray-300 dark:text-gray-600">…</span>
              : <PageBtn key={n} onClick={() => onPage(n as number)} active={page === n}>{n}</PageBtn>
          )}
          <PageBtn onClick={() => onPage(page + 1)} disabled={page === totalPages}>
            <ChevronRight className="h-3.5 w-3.5" />
          </PageBtn>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MARK BUTTONS  (reused in banner + records panel)
───────────────────────────────────────────────────────────── */
const MarkButtons: React.FC<{
  onMark: (s: "Present" | "Absent") => void;
  loading: boolean;
  variant?: "banner" | "panel";
}> = ({ onMark, loading, variant = "panel" }) => {
  const base =
    "flex items-center gap-1.5 rounded-lg text-xs font-medium transition disabled:opacity-60";

  if (variant === "banner") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => onMark("Present")}
          disabled={loading}
          className={`${base} border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700
                      hover:bg-emerald-100
                      dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400
                      dark:hover:bg-emerald-500/20`}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Present
        </button>
        <button
          onClick={() => onMark("Absent")}
          disabled={loading}
          className={`${base} border border-red-200 bg-red-50 px-3 py-1.5 text-red-600
                      hover:bg-red-100
                      dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400
                      dark:hover:bg-red-500/20`}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          Absent
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-2 px-5 pb-5 pt-1">
      <button
        onClick={() => onMark("Present")}
        disabled={loading}
        className={`${base} bg-gray-900 px-4 py-2 text-white hover:bg-gray-700
                    dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100`}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Mark present
      </button>
      <button
        onClick={() => onMark("Absent")}
        disabled={loading}
        className={`${base} border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50
                    dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/10`}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
        Mark absent
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */
const EmptyRecords: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-2 py-14 text-gray-400">
    <CalendarDays className="h-8 w-8 opacity-25" />
    <p className="text-sm">No records for this date</p>
  </div>
);

/* ═════════════════════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════════════════════ */
const Attendance: React.FC = () => {
  const { isAdmin } = useAuth();

  const [attendance, setAttendance]               = useState<AttendanceType[]>([]);
  const [users, setUsers]                         = useState<User[]>([]);
  const [selectedDate, setSelectedDate]           = useState<Date>(new Date());
  const [selectedUser, setSelectedUser]           = useState<string>("");
  const [loading, setLoading]                     = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [page, setPage]                           = useState(1);
  const [pageSize, setPageSize]                   = useState(10);

  const selectedUserData = users.find((u) => u._id === selectedUser);

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const [att, usr] = await Promise.all([
          attendanceService.getAllAttendance({
            date: format(selectedDate, "yyyy-MM-dd"),
            userId: selectedUser || undefined,
          }),
          userService.getAllUsers(),
        ]);
        setAttendance(att);
        setUsers(usr);
      } else {
        const data = await attendanceService.getUserAttendance(
          selectedDate.getMonth() + 1,
          selectedDate.getFullYear()
        );
        setAttendance(data);
      }
      setPage(1);
    } catch {
      toast.error("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedUser, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── mark attendance ── */
  const handleMark = async (status: "Present" | "Absent") => {
    const date = format(selectedDate, "yyyy-MM-dd");
    if (attendance.find((a) => a.date === date)) {
      toast.error("Attendance already marked for this date");
      return;
    }
    try {
      setMarkingAttendance(true);
      await attendanceService.markAttendance({ date, status });
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to mark attendance");
    } finally {
      setMarkingAttendance(false);
    }
  };

  /* ── derived ── */
  const todayStr        = format(new Date(), "yyyy-MM-dd");
  const selectedStr     = format(selectedDate, "yyyy-MM-dd");
  const todayAtt        = attendance.find((a) => a.date === todayStr);
  const selectedDateAtt = attendance.find((a) => a.date === selectedStr);
  const isFuture        = isBefore(startOfDay(new Date()), startOfDay(selectedDate));
  const canMark         = !isAdmin && !isFuture && !selectedDateAtt && selectedStr <= todayStr;

  const presentCount  = attendance.filter((a) => a.status === "Present").length;
  const absentCount   = attendance.filter((a) => a.status === "Absent").length;
  const rate          = attendance.length > 0
    ? Math.round((presentCount / attendance.length) * 100) : 0;

  const paginated = attendance.slice((page - 1) * pageSize, page * pageSize);

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isAdmin ? "Admin" : "My account"}
          </p>
          <h1 className="mt-0.5 text-xl font-semibold text-gray-900 dark:text-white">
            Attendance
          </h1>
        </div>

        {/* Month badge */}
        <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-200
                        px-3 py-1.5 dark:border-white/10">
          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {format(selectedDate, "MMMM yyyy")}
          </span>
        </div>
      </div>

      {/* ── Today reminder (employee) ── */}
      {!isAdmin && !todayAtt && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl
                        border border-amber-200 bg-amber-50 px-5 py-3.5
                        dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Not marked today
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {format(new Date(), "EEEE, MMMM d")}
              </p>
            </div>
          </div>
          <MarkButtons onMark={handleMark} loading={markingAttendance} variant="banner" />
        </div>
      )}

      {/* ── Stat cards (employee only) ── */}
      {!isAdmin && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Present" value={presentCount}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            iconBg="bg-emerald-50 dark:bg-emerald-500/15"
          />
          <StatCard
            label="Absent" value={absentCount}
            icon={<XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />}
            iconBg="bg-red-50 dark:bg-red-500/15"
          />
          <StatCard
            label="Recorded" value={attendance.length}
            icon={<CalendarDays className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
            iconBg="bg-blue-50 dark:bg-blue-500/15"
          />
          <StatCard
            label="Rate" value={`${rate}%`}
            icon={<TrendingUp className="h-4 w-4 text-violet-500 dark:text-violet-400" />}
            iconBg="bg-violet-50 dark:bg-violet-500/15"
            sub={`${presentCount} of ${attendance.length} days`}
          />
        </div>
      )}

      {/* ── Heatmap (employee only) ── */}
      {!isAdmin && (
        <div className="rounded-xl border border-gray-100 bg-white p-5
                        dark:border-white/10 dark:bg-white/5">
          <Heatmap attendance={attendance} month={selectedDate} />
        </div>
      )}

      {/* ── Calendar + Records grid ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Calendar panel */}
        <div className="rounded-xl border border-gray-100 bg-white p-5
                        dark:border-white/10 dark:bg-white/5">
          <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
            Select date
          </p>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className="rounded-lg border-0 p-0"
            />
          </div>
        </div>

        {/* Records panel */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100
                        bg-white dark:border-white/10 dark:bg-white/5 md:col-span-2">

          {/* Panel header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100
                          px-5 py-4 dark:border-white/10">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
              {isAdmin && selectedUserData && (
                <p className="mt-0.5 text-xs text-gray-400">
                  Filtered · {selectedUserData.name}
                </p>
              )}
              {isAdmin && !selectedUser && attendance.length > 0 && (
                <p className="mt-0.5 text-xs text-gray-400">
                  {attendance.length} employee{attendance.length !== 1 ? "s" : ""} recorded
                </p>
              )}
            </div>

            {isAdmin && (
              <Select
  value={selectedUser}
  onValueChange={(value) => setSelectedUser(value || "")}
>
                <SelectTrigger className="h-8 w-44 rounded-lg text-xs">
                  <SelectValue>
                    {selectedUser
                      ? users.find((u) => u._id === selectedUser)?.name
                      : "All employees"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="">
                    <span className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" /> All employees
                    </span>
                  </SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      <span className="flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5 text-gray-400" />
                        {u.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Rows */}
          {attendance.length > 0 ? (
            <>
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {paginated.map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center px-5 py-3 transition-colors
                               hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    {isAdmin ? (
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800 dark:text-white">
                          {typeof record.user !== "string" ? record.user?.name : "Unknown"}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {typeof record.user !== "string" ? record.user?.email : ""}
                        </p>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(record.date ?? record.markedAt), "EEEE, MMM d")}
                        </p>
                      </div>
                    )}

                    <div className="ml-4 flex shrink-0 items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {format(new Date(record.markedAt), "h:mm a")}
                      </div>
                      <StatusBadge status={record.status} />
                    </div>
                  </div>
                ))}
              </div>

              <PaginationBar
                total={attendance.length}
                page={page}
                pageSize={pageSize}
                onPage={setPage}
                onPageSize={setPageSize}
              />
            </>
          ) : (
            <EmptyRecords />
          )}

          {/* Already marked chip (employee) */}
          {selectedDateAtt && !isAdmin && (
            <div className="mx-5 mb-4 flex items-center justify-center gap-2 rounded-lg
                            bg-gray-50 py-2.5 dark:bg-white/5">
              <StatusBadge status={selectedDateAtt.status} />
              <span className="text-xs text-gray-400">recorded for this day</span>
            </div>
          )}

          {/* Mark buttons for unmarked past/today (employee) */}
          {canMark && (
            <MarkButtons onMark={handleMark} loading={markingAttendance} variant="panel" />
          )}

        </div>
      </div>

    </div>
  );
};

export default Attendance;
