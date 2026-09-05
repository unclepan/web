"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Loader2,
  Users,
  Shield,
  ShieldCheck,
  Ban,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  UserCog,
  MailCheck,
  UsersRound,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { userApi } from "@/lib/api";
import type { UserListItem } from "@/lib/api/modules/user.types";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";
import { useLocale, format } from "@/i18n/useLocale";

type TabKey = "all" | "pending";

type ConfirmState =
  | { type: "setAdmin"; user: UserListItem }
  | { type: "toggleBlacklist"; user: UserListItem }
  | { type: "review"; user: UserListItem; status: "APPROVED" | "REJECTED" }
  | null;

export default function UserManagementPage() {
  const { t } = useLocale();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });
  const { user } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("all");
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const fetchUsers = useCallback(
    async (p: number = 1) => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(p),
          pageSize: "10",
        };
        if (tab === "pending") {
          params.adminApplyStatus = "PENDING";
        }
        const res = await userApi.list(params);
        setUsers(res.users);
        setTotal(res.total);
        setPage(p);
      } catch {
        toast.error(tRef.current((m) => m.workspace.loadUsersFailedToast));
      } finally {
        setLoading(false);
      }
    },
    [tab]
  );

  useEffect(() => {
    if (user?.role === "SYSTEM_ADMIN") {
      fetchUsers(1);
    }
  }, [user, tab, fetchUsers]);

  async function handleConfirm() {
    if (!confirmState) return;
    const { user } = confirmState;
    setActionLoading(true);
    try {
      if (confirmState.type === "setAdmin") {
        await userApi.setRole(user.id, "ADMIN");
        toast.success(format(t((m) => m.workspace.setAdminToast), { username: user.username }));
      } else if (confirmState.type === "toggleBlacklist") {
        await userApi.toggleBlacklist(user.id);
        toast.success(user.isBlacklisted ? t((m) => m.workspace.unblacklistedToast) : t((m) => m.workspace.blacklistedUserToast));
      } else if (confirmState.type === "review") {
        await userApi.reviewApply(user.id, confirmState.status);
        toast.success(
          confirmState.status === "APPROVED" ? t((m) => m.workspace.applyApprovedToast) : t((m) => m.workspace.applyRejectedToast)
        );
      }
      setConfirmState(null);
      fetchUsers(page);
    } catch {
      toast.error(t((m) => m.workspace.operationFailedToast));
    } finally {
      setActionLoading(false);
    }
  }

  const roleLabel: Record<string, string> = {
    REGULAR: t((m) => m.workspace.roleRegular),
    ADMIN: t((m) => m.workspace.roleAdmin),
    SYSTEM_ADMIN: t((m) => m.workspace.roleSystemAdmin),
  };

  function renderRoleBadge(role: string) {
    if (role === "SYSTEM_ADMIN") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-500/15 text-purple-600 dark:text-purple-300">
          <ShieldCheck className="size-3" />
          {roleLabel[role]}
        </span>
      );
    }
    if (role === "ADMIN") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-600 dark:text-blue-300">
          <Shield className="size-3" />
          {roleLabel[role]}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
        {roleLabel[role] ?? role}
      </span>
    );
  }

  function renderApplyStatusBadge(status: string) {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-300">
            {t((m) => m.workspace.applyStatusPending)}
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/15 text-green-600 dark:text-green-300">
            {t((m) => m.workspace.applyStatusApproved)}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-600 dark:text-red-300">
            {t((m) => m.workspace.applyStatusRejected)}
          </span>
        );
      default:
        return <span className="text-xs text-muted-foreground">—</span>;
    }
  }

  if (!user || user.role !== "SYSTEM_ADMIN") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / 10));

  const confirmDialog = (() => {
    if (!confirmState) return null;
    const { user } = confirmState;
    if (confirmState.type === "setAdmin") {
      return {
        title: t((m) => m.workspace.setAdminDialogTitle),
        description: format(t((m) => m.workspace.setAdminDialogDesc), { username: user.username }),
        confirmText: t((m) => m.workspace.confirmSetAdminBtn),
        destructive: false,
        icon: <UserCog className="size-4" />,
      };
    }
    if (confirmState.type === "toggleBlacklist") {
      return user.isBlacklisted
        ? {
            title: t((m) => m.workspace.unblacklistDialogTitle),
            description: format(t((m) => m.workspace.unblacklistDialogDesc), { username: user.username }),
            confirmText: t((m) => m.workspace.confirmUnblacklistBtn),
            destructive: false,
            icon: <RotateCcw className="size-4" />,
          }
        : {
            title: t((m) => m.workspace.blacklistDialogTitle),
            description: format(t((m) => m.workspace.blacklistDialogDesc), { username: user.username }),
            confirmText: t((m) => m.workspace.confirmBlacklistBtn),
            destructive: true,
            icon: <Ban className="size-4" />,
          };
    }
    return confirmState.status === "APPROVED"
      ? {
          title: t((m) => m.workspace.approveApplicationDialogTitle),
          description: format(t((m) => m.workspace.approveApplicationDialogDesc), { username: user.username }),
          confirmText: t((m) => m.workspace.approveBtn),
          destructive: false,
          icon: <CheckCircle2 className="size-4" />,
        }
      : {
          title: t((m) => m.workspace.rejectApplicationDialogTitle),
          description: format(t((m) => m.workspace.rejectApplicationDialogDesc), { username: user.username }),
          confirmText: t((m) => m.workspace.rejectBtn),
          destructive: true,
          icon: <XCircle className="size-4" />,
        };
  })();

  return (
    <div>
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
        data-aos="fade-up"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t((m) => m.workspace.userManagementTitle)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t((m) => m.workspace.userManagementDesc)}
          </p>
        </div>
      </div>

      <div className="mb-5" data-aos="fade-up" data-aos-delay="100">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <Users className="size-4" />
              {t((m) => m.workspace.allUsersTab)}
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1.5">
              <MailCheck className="size-4" />
              {t((m) => m.workspace.pendingApplicationsTab)}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center" data-aos="fade-up">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <UsersRound className="size-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {tab === "pending" ? t((m) => m.workspace.noPendingApplications) : t((m) => m.workspace.noUserData)}
          </p>
        </div>
      ) : (
        <>
          <div
            className="bg-card rounded-lg border border-border overflow-x-auto"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted border-border">
                  <TableHead className="py-3 pl-4 pr-2 text-xs uppercase tracking-wider text-muted-foreground min-w-[180px]">
                    {t((m) => m.workspace.colUser)}
                  </TableHead>
                  <TableHead className="px-2 py-3 hidden md:table-cell text-xs uppercase tracking-wider text-muted-foreground min-w-[200px]">
                    {t((m) => m.workspace.colEmail)}
                  </TableHead>
                  <TableHead className="px-2 py-3 text-xs uppercase tracking-wider text-muted-foreground min-w-[120px]">
                    {t((m) => m.workspace.colRole)}
                  </TableHead>
                  <TableHead className="px-2 py-3 hidden sm:table-cell text-xs uppercase tracking-wider text-muted-foreground min-w-[90px]">
                    {t((m) => m.workspace.colStatus)}
                  </TableHead>
                  <TableHead className="px-2 py-3 hidden lg:table-cell text-xs uppercase tracking-wider text-muted-foreground min-w-[100px]">
                    {t((m) => m.workspace.colApplyStatus)}
                  </TableHead>
                  <TableHead className="py-3 pl-2 pr-4 text-right text-xs uppercase tracking-wider text-muted-foreground min-w-[220px] sticky right-0 bg-muted">
                    {t((m) => m.workspace.colActions)}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="group">
                    <TableCell className="py-3 pl-4 pr-2 min-w-[180px]">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 text-sm font-medium">
                          {u.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {u.username}
                          </div>
                          <div className="text-xs text-muted-foreground md:hidden truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-3 hidden md:table-cell text-sm text-muted-foreground min-w-[200px]">
                      <span className="truncate block max-w-[240px]">{u.email}</span>
                    </TableCell>
                    <TableCell className="px-2 py-3 min-w-[120px]">
                      {renderRoleBadge(u.role)}
                    </TableCell>
                    <TableCell className="px-2 py-3 hidden sm:table-cell min-w-[90px]">
                      {u.isBlacklisted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-600 dark:text-red-300">
                          <Ban className="size-3" />
                          {t((m) => m.workspace.blacklistedStatus)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/15 text-green-600 dark:text-green-300">
                          {t((m) => m.workspace.normalStatus)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-3 hidden lg:table-cell min-w-[100px]">
                      {renderApplyStatusBadge(u.adminApplyStatus)}
                    </TableCell>
                    <TableCell className="py-3 pl-2 pr-4 text-right whitespace-nowrap min-w-[220px] sticky right-0 bg-card group-hover:bg-muted">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {u.adminApplyStatus === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 dark:text-green-300 hover:text-green-600 dark:hover:text-green-300 hover:bg-green-500/15"
                              onClick={() =>
                                setConfirmState({ type: "review", user: u, status: "APPROVED" })
                              }
                            >
                              <CheckCircle2 className="size-4" />
                              <span className="hidden sm:inline">{t((m) => m.workspace.approveBtn)}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 dark:text-red-300 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/15"
                              onClick={() =>
                                setConfirmState({ type: "review", user: u, status: "REJECTED" })
                              }
                            >
                              <XCircle className="size-4" />
                              <span className="hidden sm:inline">{t((m) => m.workspace.rejectBtn)}</span>
                            </Button>
                          </>
                        )}
                        {u.role === "REGULAR" && u.adminApplyStatus !== "PENDING" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmState({ type: "setAdmin", user: u })}
                          >
                            <UserCog className="size-4" />
                            <span className="hidden sm:inline">{t((m) => m.workspace.setAdminBtn)}</span>
                          </Button>
                        )}
                        {u.role !== "SYSTEM_ADMIN" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={
                              u.isBlacklisted
                                ? ""
                                : "text-red-600 dark:text-red-300 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/15"
                            }
                            onClick={() =>
                              setConfirmState({ type: "toggleBlacklist", user: u })
                            }
                          >
                            {u.isBlacklisted ? (
                              <>
                                <RotateCcw className="size-4" />
                                <span className="hidden sm:inline">{t((m) => m.workspace.unblacklistBtn)}</span>
                              </>
                            ) : (
                              <>
                                <Ban className="size-4" />
                                <span className="hidden sm:inline">{t((m) => m.workspace.blacklistBtn)}</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div
              className="mt-4 flex items-center justify-between text-sm text-muted-foreground"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <span>
                {format(t((m) => m.workspace.paginationInfo), { total, page, totalPages })}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(page - 1)}
                  disabled={page <= 1 || loading}
                >
                  <ChevronLeft className="size-4" />
                  {t((m) => m.workspace.prevPage)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(page + 1)}
                  disabled={page >= totalPages || loading}
                >
                  {t((m) => m.workspace.nextPage)}
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog
        open={!!confirmState}
        onOpenChange={(v) => !v && !actionLoading && setConfirmState(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {confirmDialog?.destructive && (
                <div className="size-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <AlertTriangle className="size-4 text-red-600 dark:text-red-300" />
                </div>
              )}
              <DialogTitle>{confirmDialog?.title}</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {confirmDialog?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmState(null)}
              disabled={actionLoading}
            >
              {t((m) => m.workspace.cancelBtn)}
            </Button>
            <Button
              variant={confirmDialog?.destructive ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                confirmDialog?.icon
              )}
              {confirmDialog?.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
