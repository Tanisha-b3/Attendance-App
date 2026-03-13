import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import leaveService from "../services/leaveService";
import LeaveForm from "./leaveForm";
import LeaveTable from "./leaveTable";
import type { LeaveRequest, LeaveApplicationData } from "../Types";
import {
  Plus,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Wallet,
} from "lucide-react";

/* ─── stat card ──────────────────────────────────────────────── */
const StatCard: React.FC<{
  label: string;
  count: number;
  icon: React.ReactNode;
  iconBg: string;
}> = ({ label, count, icon, iconBg }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4
                  dark:border-white/10 dark:bg-white/5">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
      {icon}
    </div>
    <div>
      <p className="text-xl font-semibold tabular-nums text-gray-900 dark:text-white">{count}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  </div>
);

/* ─── empty state ────────────────────────────────────────────── */
const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-14 text-gray-400">
    <FileText className="h-8 w-8 opacity-25" />
    <p className="text-sm">No {label} requests</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const Leaves: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const [leaves, setLeaves]               = useState<LeaveRequest[]>([]);
  const [loading, setLoading]             = useState(true);
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = isAdmin
        ? await leaveService.getAllLeaves()
        : await leaveService.getUserLeaves();
      setLeaves(data);
    } catch {
      toast.error("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (data: LeaveApplicationData) => {
    try {
      await leaveService.applyLeave(data);
      toast.success("Leave request submitted");
      setShowLeaveForm(false);
      fetchLeaves();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to submit leave request");
    }
  };

  const handleCancelLeave = async (id: string) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try {
      await leaveService.cancelLeave(id);
      toast.success("Leave request cancelled");
      fetchLeaves();
    } catch {
      toast.error("Failed to cancel leave request");
    }
  };

  const handleAdminAction = async (id: string, status: "Approved" | "Rejected"|
    "Pending"
  ) => {
    try {
      await leaveService.updateLeaveStatus(id, { status });
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchLeaves();
    } catch {
      toast.error(`Failed to ${status.toLowerCase()} leave request`);
    }
  };

  /* ── derived ── */
  const pendingLeaves  = leaves.filter((l) => l.status === "Pending");
  const approvedLeaves = leaves.filter((l) => l.status === "Approved");
  const rejectedLeaves = leaves.filter((l) => l.status === "Rejected");

  const tableProps = (list: LeaveRequest[], includeActions = true) => ({
    leaves: list,
    isAdmin,
    ...(includeActions && !isAdmin ? { onCancel: handleCancelLeave } : {}),
    ...(includeActions &&  isAdmin ? { onAction: handleAdminAction } : {}),
  });

  const tabs = [
    { value: "all",      label: "All",      list: leaves,         actions: true  },
    { value: "pending",  label: "Pending",  list: pendingLeaves,  actions: true  },
    { value: "approved", label: "Approved", list: approvedLeaves, actions: false },
    { value: "rejected", label: "Rejected", list: rejectedLeaves, actions: false },
  ];

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isAdmin ? "Admin" : "My account"}
            </p>
            <h1 className="mt-0.5 text-xl font-semibold text-gray-900 dark:text-white">
              Leave management
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!isAdmin && user?.leaveBalance !== undefined && (
              <div className="flex items-center gap-1.5 rounded-lg border border-dashed
                              border-gray-200 px-3 py-1.5 dark:border-white/10">
                <Wallet className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {user.leaveBalance} days left
                </span>
              </div>
            )}

            {!isAdmin && (
              <button
                onClick={() => setShowLeaveForm(true)}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5
                           text-xs font-medium text-white transition
                           hover:bg-gray-700 active:scale-[0.98]
                           dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Apply for leave
              </button>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total"
            count={leaves.length}
            icon={<FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
            iconBg="bg-gray-50 dark:bg-white/10"
          />
          <StatCard
            label="Pending"
            count={pendingLeaves.length}
            icon={<Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            iconBg="bg-amber-50 dark:bg-amber-500/15"
          />
          <StatCard
            label="Approved"
            count={approvedLeaves.length}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            iconBg="bg-emerald-50 dark:bg-emerald-500/15"
          />
          <StatCard
            label="Rejected"
            count={rejectedLeaves.length}
            icon={<XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />}
            iconBg="bg-red-50 dark:bg-red-500/15"
          />
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="all">
          <TabsList className="flex h-9 w-full gap-0.5 rounded-lg border border-gray-100
                               bg-gray-50 p-1 dark:border-white/10 dark:bg-white/5">
            {tabs.map(({ value, label, list }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md
                           text-xs font-medium text-gray-500 transition-all
                           data-[state=active]:bg-white data-[state=active]:text-gray-900
                           data-[state=active]:shadow-sm
                           dark:text-gray-500
                           dark:data-[state=active]:bg-white/10
                           dark:data-[state=active]:text-white"
              >
                {label}
                <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px]
                                 tabular-nums leading-none text-gray-500
                                 dark:bg-white/10 dark:text-gray-400">
                  {list.length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-3">
            {tabs.map(({ value, list, actions }) => (
              <TabsContent key={value} value={value} className="mt-0">
                <div className="rounded-xl border border-gray-100 bg-white
                                dark:border-white/10 dark:bg-white/5">
                  {list.length === 0 ? (
                    <EmptyState label={value === "all" ? "leave" : value} />
                  ) : (
                    <div className="overflow-x-auto">
                      <LeaveTable {...tableProps(list, actions)} />
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>

      </div>

      {/* ── Dialog ── */}
      <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
        <DialogContent className="w-[95vw] rounded-xl sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Apply for leave</DialogTitle>
          </DialogHeader>
          <LeaveForm
            onSubmit={handleApplyLeave}
            onCancel={() => setShowLeaveForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Leaves;