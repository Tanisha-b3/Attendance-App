import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import toast from "react-hot-toast";
import userService from "../services/UserService";
import type { User } from "../Types";
import { format } from "date-fns";
import {
  Search,
  UserCircle,
  Mail,
  CalendarDays,
  Wallet,
  Loader2,
  Users,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const PAGE_SIZES = [6, 12, 24] as const;

/* ─────────────────────────────────────────────────────────────
   ROLE PILL
───────────────────────────────────────────────────────────── */
const RolePill: React.FC<{ role: string }> = ({ role }) => (
  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5
                   text-xs font-medium capitalize text-gray-600
                   dark:bg-white/10 dark:text-gray-400">
    {role}
  </span>
);

/* ─────────────────────────────────────────────────────────────
   EMPLOYEE CARD
───────────────────────────────────────────────────────────── */
const EmployeeCard: React.FC<{
  employee: User;
  onEdit: (u: User) => void;
}> = ({ employee, onEdit }) => {
  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* deterministic hue from name */
  const hue = [...employee.name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div className="group relative flex flex-col rounded-xl border border-gray-100 bg-white
                    p-5 transition-all hover:border-gray-200 hover:shadow-sm
                    dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20">

      {/* Edit button */}
      <button
        onClick={() => onEdit(employee)}
        className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg
                   border border-gray-100 bg-gray-50 text-gray-400 opacity-0 transition
                   hover:border-gray-200 hover:text-gray-700
                   group-hover:opacity-100
                   dark:border-white/10 dark:bg-white/5 dark:hover:text-white"
        title="Edit leave balance"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>

      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                     text-sm font-semibold text-white"
          style={{ backgroundColor: `hsl(${hue} 60% 52%)` }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {employee.name}
          </p>
          <RolePill role={employee.role} />
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-gray-50 dark:border-white/5" />

      {/* Details */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>
            Joined{" "}
            <span className="text-gray-600 dark:text-gray-300">
              {format(new Date(employee.dateOfJoining), "MMM d, yyyy")}
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Wallet className="h-3.5 w-3.5 shrink-0" />
            <span>Leave balance</span>
          </div>
          <span className="text-sm font-semibold tabular-nums text-gray-800 dark:text-white">
            {employee.leaveBalance}
            <span className="ml-0.5 text-xs font-normal text-gray-400"> days</span>
          </span>
        </div>

        {/* Balance bar */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(100, (employee.leaveBalance / 30) * 100)}%` }}
          />
        </div>
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
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border
                    border-gray-100 bg-white px-5 py-3 dark:border-white/10 dark:bg-white/5
                    sm:flex-row">
      <div className="flex items-center gap-3">
        <p className="text-xs text-gray-400">
          {start + 1}–{Math.min(start + pageSize, total)}{" "}
          <span className="text-gray-300 dark:text-gray-600">of</span> {total}
        </p>
        <div className="flex items-center gap-0.5">
          {PAGE_SIZES.map((s) => (
            <button key={s} onClick={() => { onPageSize(s); onPage(1); }}
              className={`h-6 rounded px-2 text-xs font-medium transition
                ${pageSize === s
                  ? "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
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

/* ═════════════════════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════════════════════ */
const Employees: React.FC = () => {
  const [users, setUsers]                   = useState<User[]>([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState("");
  const [page, setPage]                     = useState(1);
  const [pageSize, setPageSize]             = useState(6);

  /* edit dialog */
  const [editUser, setEditUser]             = useState<User | null>(null);
  const [leaveBalance, setLeaveBalance]     = useState(0);
  const [saving, setSaving]                 = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  /* ── filtered + paginated ── */
  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return q
      ? users.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        )
      : users;
  }, [users, searchTerm]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  /* ── edit ── */
  const openEdit = (u: User) => {
    setEditUser(u);
    setLeaveBalance(u.leaveBalance);
  };

  const handleSave = async () => {
    if (!editUser) return;
    try {
      setSaving(true);
      await userService.updateLeaveBalance(editUser._id, leaveBalance);
      toast.success("Leave balance updated");
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error("Failed to update leave balance");
    } finally {
      setSaving(false);
    }
  };

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
    <>
      <div className="space-y-5 pb-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Admin</p>
            <h1 className="mt-0.5 text-xl font-semibold text-gray-900 dark:text-white">
              Employees
            </h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-dashed
                          border-gray-200 px-3 py-1.5 dark:border-white/10">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {users.length} total
            </span>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, email or role…"
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm
                       text-gray-800 placeholder-gray-400 outline-none transition
                       focus:border-gray-400 focus:ring-0
                       dark:border-white/10 dark:bg-white/5 dark:text-white
                       dark:placeholder-gray-600 dark:focus:border-white/20"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Minus className="h-3.5 w-3.5 rotate-90" />
            </button>
          )}
        </div>

        {/* ── Results summary ── */}
        {searchTerm && (
          <p className="text-xs text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for{" "}
            <span className="font-medium text-gray-600 dark:text-gray-300">"{searchTerm}"</span>
          </p>
        )}

        {/* ── Grid ── */}
        {paginated.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((emp) => (
              <EmployeeCard key={emp._id} employee={emp} onEdit={openEdit} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border
                          border-gray-100 bg-white py-16 text-gray-400
                          dark:border-white/10 dark:bg-white/5">
            <UserCircle className="h-8 w-8 opacity-25" />
            <p className="text-sm">No employees found</p>
          </div>
        )}

        {/* ── Pagination ── */}
        <PaginationBar
          total={filtered.length}
          page={page}
          pageSize={pageSize}
          onPage={setPage}
          onPageSize={setPageSize}
        />

      </div>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="w-[95vw] rounded-xl sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Edit leave balance
            </DialogTitle>
          </DialogHeader>

          {editUser && (
            <div className="space-y-5 pt-1">
              {/* Employee preview */}
              <div className="flex items-center gap-3 rounded-lg border border-gray-100
                              bg-gray-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                             text-xs font-semibold text-white"
                  style={{
                    backgroundColor: `hsl(${[...editUser.name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360} 60% 52%)`,
                  }}
                >
                  {editUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-white">
                    {editUser.name}
                  </p>
                  <p className="truncate text-xs text-gray-400">{editUser.email}</p>
                </div>
              </div>

              {/* Stepper */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Leave balance (days)
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLeaveBalance((v) => Math.max(0, v - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border
                               border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50
                               dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <input
                    type="number"
                    min={0}
                    value={leaveBalance}
                    onChange={(e) => setLeaveBalance(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white text-center
                               text-sm font-semibold tabular-nums text-gray-900 outline-none
                               transition focus:border-gray-400
                               dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />

                  <button
                    onClick={() => setLeaveBalance((v) => v + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border
                               border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50
                               dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Delta hint */}
                {leaveBalance !== editUser.leaveBalance && (
                  <p className={`mt-1.5 text-xs ${leaveBalance > editUser.leaveBalance ? "text-emerald-600" : "text-red-500"}`}>
                    {leaveBalance > editUser.leaveBalance ? "+" : ""}
                    {leaveBalance - editUser.leaveBalance} days from current ({editUser.leaveBalance})
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditUser(null)}
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-sm
                             font-medium text-gray-600 transition hover:bg-gray-50
                             dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || leaveBalance === editUser.leaveBalance}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg
                             bg-gray-900 py-2 text-sm font-medium text-white transition
                             hover:bg-gray-700 disabled:opacity-50
                             dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Employees;