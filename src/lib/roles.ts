import { ROLE_DASHBOARD_PATH, ROLE_LABELS, ROLES, type UserRole } from "@/types";

export { ROLES, ROLE_LABELS, ROLE_DASHBOARD_PATH };
export type { UserRole };

export function isValidRole(value: string): value is UserRole {
  return (ROLES as readonly string[]).includes(value);
}

export function dashboardPathForRole(role: UserRole): string {
  return ROLE_DASHBOARD_PATH[role];
}

/**
 * Central place describing which roles may access which dashboard segment.
 * `/dashboard/[segment]/page.tsx` layouts check against this table so a
 * teacher can never render the super-admin screen just by typing the URL.
 */
export const DASHBOARD_SEGMENT_ROLE: Record<string, UserRole> = {
  "super-admin": "super-admin",
  administrator: "administrator",
  "administrative-staff": "administrative-staff",
  teacher: "teacher",
  parent: "parent",
};
