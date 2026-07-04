"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  MoreVertical,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import {
  UserAvatar,
  RoleBadge,
  StatusBadge,
  UserFormModal,
  RoleAssignModal,
  ResetPasswordModal,
  DeleteUserModal,
} from "@/components/users";
import { countUsers, listUsers, USERS_PAGE_SIZE } from "@/lib/firebase/users";
import {
  ROLES,
  ROLE_LABELS,
  ACCOUNT_STATUSES,
  STATUS_LABELS,
  type AccountStatus,
  type AppUser,
  type SessionUser,
  type UserRole,
} from "@/types";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type Cursor = QueryDocumentSnapshot<DocumentData> | null;

interface UserManagementClientProps {
  currentUser: SessionUser;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso?: string | null): string {
  if (!iso) return "Never";
  return dateFormatter.format(new Date(iso));
}

export function UserManagementClient({ currentUser }: UserManagementClientProps) {
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // pageCursors[i] is the cursor used to *fetch* page i. Page 0 always
  // starts from null. Visiting page i+1 for the first time appends the
  // `lastDoc` returned by page i's query; going "Previous" just moves the
  // index back without re-deriving anything, so it's cheap either way.
  const [pageCursors, setPageCursors] = useState<Cursor[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [formModal, setFormModal] = useState<{ open: boolean; user: AppUser | null }>({
    open: false,
    user: null,
  });
  const [roleModalUser, setRoleModalUser] = useState<AppUser | null>(null);
  const [resetModalUser, setResetModalUser] = useState<AppUser | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<AppUser | null>(null);
  const [openMenuUid, setOpenMenuUid] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Debounce free-text search input.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 whenever filters or search change.
  useEffect(() => {
    setPageCursors([null]);
    setPageIndex(0);
  }, [roleFilter, statusFilter, search]);

  const fetchPage = useCallback(
    async (index: number, cursor: Cursor) => {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await listUsers({
          role: roleFilter,
          status: statusFilter,
          search,
          cursor,
          pageSize: USERS_PAGE_SIZE,
        });
        setUsers(result.users);
        setHasMore(result.hasMore);
        if (result.lastDoc) {
          setPageCursors((prev) => {
            const next = [...prev];
            next[index + 1] = result.lastDoc;
            return next;
          });
        }
      } catch (err) {
        console.error("[UserManagementClient] listUsers failed", err);
        setLoadError(
          "Couldn't load users. If this keeps happening, the required Firestore index may still be building — check the Firebase console."
        );
      } finally {
        setLoading(false);
      }
    },
    [roleFilter, statusFilter, search]
  );

  useEffect(() => {
    fetchPage(pageIndex, pageCursors[pageIndex] ?? null);
    // Only re-run when the page we're viewing or the query itself changes —
    // pageCursors updates as a *result* of this effect, so it's excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, roleFilter, statusFilter, search]);

  useEffect(() => {
    countUsers({ role: roleFilter, status: statusFilter })
      .then(setTotalCount)
      .catch(() => setTotalCount(null));
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuUid(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function refetchCurrentPage() {
    fetchPage(pageIndex, pageCursors[pageIndex] ?? null);
    countUsers({ role: roleFilter, status: statusFilter })
      .then(setTotalCount)
      .catch(() => setTotalCount(null));
  }

  const isSearching = search.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="h-11 w-full rounded-md border border-ink-300/60 bg-white pl-9 pr-3 text-sm text-ink placeholder:text-ink-300 transition-colors focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
            options={[{ value: "all", label: "All Roles" }, ...ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))]}
            className="w-40"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AccountStatus | "all")}
            options={[
              { value: "all", label: "All Statuses" },
              ...ACCOUNT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
            ]}
            className="w-40"
          />
          <Button onClick={() => setFormModal({ open: true, user: null })}>
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        {loadError && (
          <div className="p-6">
            <p className="text-sm text-rose">{loadError}</p>
          </div>
        )}

        {!loadError && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-300/20 text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Last Login</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-300/10">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10">
                      <Spinner label="Loading users…" />
                    </td>
                  </tr>
                )}

                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-ink-500">
                      No users match these filters.
                    </td>
                  </tr>
                )}

                {!loading &&
                  users.map((u) => (
                    <tr key={u.uid} className="hover:bg-ink/[0.02]">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar photoURL={u.photoURL} displayName={u.displayName} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{u.displayName}</p>
                            <p className="truncate text-xs text-ink-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-500">{u.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-4 py-3 text-ink-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3 text-ink-500">{formatDate(u.lastLoginAt)}</td>
                      <td className="px-4 py-3">
                        <div
                          className="relative flex justify-end"
                          ref={openMenuUid === u.uid ? menuRef : undefined}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenMenuUid(openMenuUid === u.uid ? null : u.uid)}
                            className="rounded-md p-1.5 text-ink-500 hover:bg-ink/5"
                            aria-label={`Actions for ${u.displayName}`}
                            aria-haspopup="menu"
                            aria-expanded={openMenuUid === u.uid}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenuUid === u.uid && (
                            <div
                              role="menu"
                              className="absolute right-0 top-9 z-10 w-44 rounded-md border border-ink-300/20 bg-white py-1 shadow-panel"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setFormModal({ open: true, user: u });
                                  setOpenMenuUid(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-ink/5"
                              >
                                <Pencil className="h-4 w-4" /> Edit
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setRoleModalUser(u);
                                  setOpenMenuUid(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-ink/5"
                              >
                                <ShieldCheck className="h-4 w-4" /> Assign Role
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setResetModalUser(u);
                                  setOpenMenuUid(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-ink/5"
                              >
                                <KeyRound className="h-4 w-4" /> Reset Password
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setDeleteModalUser(u);
                                  setOpenMenuUid(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!loadError && (
          <div className="flex items-center justify-between border-t border-ink-300/20 px-6 py-3">
            <p className="text-xs text-ink-500">
              {isSearching
                ? `Showing top ${users.length} match${users.length === 1 ? "" : "es"} for "${search}"`
                : totalCount !== null
                  ? `${totalCount} user${totalCount === 1 ? "" : "s"} total`
                  : ""}
            </p>
            {!isSearching && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageIndex === 0 || loading}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="px-1 text-xs text-ink-500">Page {pageIndex + 1}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore || loading}
                  onClick={() => setPageIndex((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <UserFormModal
        open={formModal.open}
        user={formModal.user}
        currentUserRole={currentUser.role}
        onClose={() => setFormModal({ open: false, user: null })}
        onSaved={refetchCurrentPage}
      />
      <RoleAssignModal
        open={Boolean(roleModalUser)}
        user={roleModalUser}
        currentUserRole={currentUser.role}
        onClose={() => setRoleModalUser(null)}
        onSaved={refetchCurrentPage}
      />
      <ResetPasswordModal
        open={Boolean(resetModalUser)}
        user={resetModalUser}
        onClose={() => setResetModalUser(null)}
      />
      <DeleteUserModal
        open={Boolean(deleteModalUser)}
        user={deleteModalUser}
        onClose={() => setDeleteModalUser(null)}
        onDeleted={refetchCurrentPage}
      />
    </div>
  );
}
