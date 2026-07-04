"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { dashboardPathForRole } from "@/lib/roles";
import { ROUTES } from "@/lib/constants";

/** Redirects an authenticated user to their role-specific dashboard segment. */
export function useRoleRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(ROUTES.login);
      return;
    }
    router.replace(dashboardPathForRole(user.role));
  }, [user, loading, router]);
}
