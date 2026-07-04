"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { StudentAvatar, StudentStatusBadge } from "@/components/students";
import { countStudents, listStudents, STUDENTS_PAGE_SIZE } from "@/lib/firebase/students";
import { useCanManageStudents } from "@/hooks/useCanManageStudents";
import { CLASS_LEVELS } from "@/lib/data/classLevels";
import { STUDENT_STATUSES, STUDENT_STATUS_LABELS, type Student, type StudentStatus, type SessionUser } from "@/types";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type Cursor = QueryDocumentSnapshot<DocumentData> | null;

interface StudentListClientProps {
  currentUser: SessionUser;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function StudentListClient({ currentUser }: StudentListClientProps) {
  const { canManage } = useCanManageStudents(currentUser.role);

  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("active");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [pageCursors, setPageCursors] = useState<Cursor[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPageCursors([null]);
    setPageIndex(0);
  }, [classFilter, statusFilter, search]);

  const fetchPage = useCallback(
    async (index: number, cursor: Cursor) => {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await listStudents({
          classLevel: classFilter,
          status: statusFilter,
          search,
          cursor,
          pageSize: STUDENTS_PAGE_SIZE,
        });
        setStudents(result.students);
        setHasMore(result.hasMore);
        if (result.lastDoc) {
          setPageCursors((prev) => {
            const next = [...prev];
            next[index + 1] = result.lastDoc;
            return next;
          });
        }
      } catch (err) {
        console.error("[StudentListClient] listStudents failed", err);
        setLoadError(
          "Couldn't load students. If this keeps happening, the required Firestore index may still be building — check the Firebase console."
        );
      } finally {
        setLoading(false);
      }
    },
    [classFilter, statusFilter, search]
  );

  useEffect(() => {
    fetchPage(pageIndex, pageCursors[pageIndex] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, classFilter, statusFilter, search]);

  useEffect(() => {
    countStudents({ classLevel: classFilter, status: statusFilter })
      .then(setTotalCount)
      .catch(() => setTotalCount(null));
  }, [classFilter, statusFilter]);

  const isSearching = search.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or admission no…"
            className="h-11 w-full rounded-md border border-ink-300/60 bg-white pl-9 pr-3 text-sm text-ink placeholder:text-ink-300 transition-colors focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={[{ value: "all", label: "All Classes" }, ...CLASS_LEVELS.map((c) => ({ value: c, label: c }))]}
            className="w-40"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StudentStatus | "all")}
            options={[
              { value: "all", label: "All Statuses" },
              ...STUDENT_STATUSES.map((s) => ({ value: s, label: STUDENT_STATUS_LABELS[s] })),
            ]}
            className="w-40"
          />
          {canManage && (
            <Link href="/dashboard/students/new">
              <Button>
                <UserPlus className="h-4 w-4" />
                Add Student
              </Button>
            </Link>
          )}
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
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-300/20 text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-6 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Admission No.</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Arm</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Admission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-300/10">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10">
                      <Spinner label="Loading students…" />
                    </td>
                  </tr>
                )}

                {!loading && students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-ink-500">
                      No students match these filters.
                    </td>
                  </tr>
                )}

                {!loading &&
                  students.map((s) => (
                    <tr key={s.id} className="hover:bg-ink/[0.02]">
                      <td className="px-6 py-3">
                        <Link href={`/dashboard/students/${s.id}`} className="flex items-center gap-3">
                          <StudentAvatar photoURL={s.passportPhotoURL} name={`${s.surname} ${s.otherNames}`} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {s.surname} {s.otherNames}
                            </p>
                            <p className="truncate text-xs text-ink-500">{s.gender}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-ink-500">{s.admissionNumber}</td>
                      <td className="px-4 py-3 text-ink-500">{s.class}</td>
                      <td className="px-4 py-3 text-ink-500">{s.arm}</td>
                      <td className="px-4 py-3">
                        <StudentStatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-ink-500">{dateFormatter.format(new Date(s.admissionDate))}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {!loadError && (
          <div className="flex items-center justify-between border-t border-ink-300/20 px-6 py-3">
            <p className="text-xs text-ink-500">
              {isSearching
                ? `Showing top ${students.length} match${students.length === 1 ? "" : "es"} for "${search}"`
                : totalCount !== null
                  ? `${totalCount} student${totalCount === 1 ? "" : "s"} total`
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
    </div>
  );
}
