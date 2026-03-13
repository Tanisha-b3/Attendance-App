export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveTableProps {
  leaves: LeaveRequest[];
  isAdmin?: boolean;
  onAction?: (id: string, status: LeaveStatus) => void | Promise<void>;
  onCancel?: (id: string) => void | Promise<void>;
}
export interface LeaveRequest {
  _id: string;

  user: {
    _id: string;
    name: string;
    email: string;
  } | string;

  leaveType: string;
  startDate: string;
  endDate: string;

  totalDays: number;

  status: LeaveStatus;

  appliedDate: string;
}

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { format } from "date-fns";
import {
  CheckCircle2, XCircle, Clock,
  Check, X, ChevronLeft, ChevronRight,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

/* ─── status badge ───────────────────────────────────────────── */
const StatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
  const map: Record<LeaveStatus, { icon: React.ReactNode; className: string }> = {
    Pending: {
      icon: <Clock className="h-3 w-3" />,
      className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    },
    Approved: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    },
    Rejected: {
      icon: <XCircle className="h-3 w-3" />,
      className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    },
  };
  const { icon, className } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>
      {icon}{status}
    </span>
  );
};

/* ─── type pill ──────────────────────────────────────────────── */
const TypePill: React.FC<{ type: string }> = ({ type }) => (
  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5
                   text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-400">
    {type}
  </span>
);

/* ─── page button ────────────────────────────────────────────── */
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
                text-xs font-medium transition
                disabled:pointer-events-none disabled:opacity-40
                ${active
                  ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                }`}
  >
    {children}
  </button>
);

/* ═══════════════════════════════════════════════════════════════
   TABLE
═══════════════════════════════════════════════════════════════ */
const LeaveTable: React.FC<LeaveTableProps> = ({
  leaves,
  isAdmin = false,
  onAction,
  onCancel,
}) => {
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (leaves.length === 0) return null;

  const totalPages = Math.ceil(leaves.length / pageSize);
  const start      = (page - 1) * pageSize;
  const paginated  = leaves.slice(start, start + pageSize);

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  /* first, last, current ±1, with ellipsis */
  const pageNumbers = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const nums: (number | "…")[] = [1];
    if (page > 3) nums.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) nums.push(i);
    if (page < totalPages - 2) nums.push("…");
    nums.push(totalPages);
    return nums;
  };

  return (
    <div className="flex flex-col">

      {/* ── Table ── */}
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 hover:bg-transparent dark:border-white/10">
              {isAdmin && <TableHead className="text-xs font-medium text-gray-400 dark:text-gray-500">Employee</TableHead>}
              <TableHead className="text-xs font-medium text-gray-400 dark:text-gray-500">Type</TableHead>
              <TableHead className="text-xs font-medium text-gray-400 dark:text-gray-500">Duration</TableHead>
              <TableHead className="text-xs font-medium text-gray-400 dark:text-gray-500">Days</TableHead>
              <TableHead className="text-xs font-medium text-gray-400 dark:text-gray-500">Status</TableHead>
              <TableHead className="text-xs font-medium text-gray-400 dark:text-gray-500">Applied</TableHead>
              {(isAdmin || onCancel) && <TableHead />}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((leave) => (
              <TableRow key={leave._id} className="border-gray-50 dark:border-white/5">

                {isAdmin && (
                  <TableCell>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {typeof leave.user !== "string" ? leave.user?.name : "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {typeof leave.user !== "string" ? leave.user?.email : ""}
                    </p>
                  </TableCell>
                )}

                <TableCell><TypePill type={leave.leaveType} /></TableCell>

                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(leave.startDate), "MMM d")}
                  {" – "}
                  {format(new Date(leave.endDate), "MMM d, yyyy")}
                </TableCell>

                <TableCell className="text-sm tabular-nums text-gray-600 dark:text-gray-400">
                  {leave.totalDays}d
                </TableCell>

                <TableCell><StatusBadge status={leave.status} /></TableCell>

                <TableCell className="text-sm text-gray-400">
                  {format(new Date(leave.appliedDate), "MMM d, yyyy")}
                </TableCell>

                {isAdmin && (
                  <TableCell>
                    {leave.status === "Pending" && onAction ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onAction(leave._id, "Approved")}
                          className="flex items-center gap-1 rounded-md border border-emerald-200
                                     bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700
                                     transition hover:bg-emerald-100
                                     dark:border-emerald-500/20 dark:bg-emerald-500/10
                                     dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => onAction(leave._id, "Rejected")}
                          className="flex items-center gap-1 rounded-md border border-red-200
                                     bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600
                                     transition hover:bg-red-100
                                     dark:border-red-500/20 dark:bg-red-500/10
                                     dark:text-red-400 dark:hover:bg-red-500/20"
                        >
                          <X className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </TableCell>
                )}

                {!isAdmin && onCancel && (
                  <TableCell>
                    {leave.status === "Pending" ? (
                      <button
                        onClick={() => onCancel(leave._id)}
                        className="rounded-md border border-gray-200 px-2.5 py-1 text-xs
                                   font-medium text-gray-500 transition hover:border-red-200
                                   hover:bg-red-50 hover:text-red-600
                                   dark:border-white/10 dark:text-gray-500
                                   dark:hover:border-red-500/20 dark:hover:bg-red-500/10
                                   dark:hover:text-red-400"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </TableCell>
                )}

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination footer ── */}
      {leaves.length > PAGE_SIZE_OPTIONS[0] && (
        <div className="flex flex-col items-center justify-between gap-3 border-t
                        border-gray-100 px-4 py-3 dark:border-white/10 sm:flex-row">

          {/* Count + rows-per-page */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400">
              {start + 1}–{Math.min(start + pageSize, leaves.length)}{" "}
              <span className="text-gray-300 dark:text-gray-600">of</span>{" "}
              {leaves.length}
            </p>

            <div className="flex items-center gap-0.5">
              {PAGE_SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handlePageSize(s)}
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

          {/* Page controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <PageBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </PageBtn>

              {pageNumbers().map((n, i) =>
                n === "…" ? (
                  <span key={`e${i}`} className="px-1 text-xs text-gray-300 dark:text-gray-600">…</span>
                ) : (
                  <PageBtn key={n} onClick={() => setPage(n as number)} active={page === n}>
                    {n}
                  </PageBtn>
                )
              )}

              <PageBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                <ChevronRight className="h-3.5 w-3.5" />
              </PageBtn>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default LeaveTable;