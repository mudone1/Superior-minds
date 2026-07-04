"use client";

import { useEffect, useState } from "react";
import { getSchoolSettings } from "@/lib/firebase/settings";
import { isAdminLevelRole, type UserRole } from "@/types";

/**
 * Mirrors the server-side check in requireApiStudentManager: admin-level
 * roles can always manage students; Administrative Staff can only if the
 * settings toggle is on. This is purely for showing/hiding buttons — the
 * API routes re-check permission independently, so this being briefly
 * stale (e.g. right after an admin flips the setting) never allows an
 * unauthorized write, just a UI affordance lag.
 */
export function useCanManageStudents(role: UserRole): { canManage: boolean; loading: boolean } {
  const [canManage, setCanManage] = useState(isAdminLevelRole(role));
  const [loading, setLoading] = useState(role === "administrative-staff");

  useEffect(() => {
    if (isAdminLevelRole(role)) {
      setCanManage(true);
      setLoading(false);
      return;
    }
    if (role !== "administrative-staff") {
      setCanManage(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getSchoolSettings()
      .then((settings) => {
        if (!cancelled) setCanManage(settings.allowStaffAddStudents);
      })
      .catch(() => {
        if (!cancelled) setCanManage(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  return { canManage, loading };
}
