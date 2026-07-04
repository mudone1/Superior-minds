import type { UserRole } from "@/types";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon:
    | "layout-dashboard"
    | "users"
    | "graduation-cap"
    | "user-cog"
    | "book-open"
    | "clipboard-list"
    | "banknote"
    | "settings"
    | "shield-check"
    | "user-round";
}

/**
 * Phase 1 ships only the landing page for each role's dashboard, but the
 * nav is defined up front so later phases can add real routes without
 * reshaping the sidebar. Phase 2 wired up User Management; Phase 3 wires
 * up Students + the shared Settings page.
 */
export const DASHBOARD_NAV: Record<UserRole, DashboardNavItem[]> = {
  "super-admin": [
    { label: "Overview", href: "/dashboard/super-admin", icon: "layout-dashboard" },
    { label: "Schools & Campuses", href: "/dashboard/super-admin", icon: "graduation-cap" },
    { label: "User Management", href: "/dashboard/users", icon: "users" },
    { label: "Students", href: "/dashboard/students", icon: "graduation-cap" },
    { label: "System Settings", href: "/dashboard/settings", icon: "settings" },
  ],
  administrator: [
    { label: "Overview", href: "/dashboard/administrator", icon: "layout-dashboard" },
    { label: "User Management", href: "/dashboard/users", icon: "user-cog" },
    { label: "Students", href: "/dashboard/students", icon: "graduation-cap" },
    { label: "Settings", href: "/dashboard/settings", icon: "settings" },
    { label: "Finance", href: "/dashboard/administrator", icon: "banknote" },
  ],
  "administrative-staff": [
    { label: "Overview", href: "/dashboard/administrative-staff", icon: "layout-dashboard" },
    { label: "Students", href: "/dashboard/students", icon: "graduation-cap" },
    { label: "Admissions", href: "/dashboard/administrative-staff", icon: "clipboard-list" },
    { label: "Records", href: "/dashboard/administrative-staff", icon: "book-open" },
  ],
  teacher: [
    { label: "Overview", href: "/dashboard/teacher", icon: "layout-dashboard" },
    { label: "Students", href: "/dashboard/students", icon: "graduation-cap" },
    { label: "My Classes", href: "/dashboard/teacher", icon: "book-open" },
    { label: "Gradebook", href: "/dashboard/teacher", icon: "clipboard-list" },
  ],
  parent: [
    { label: "Overview", href: "/dashboard/parent", icon: "layout-dashboard" },
    { label: "My Children", href: "/dashboard/parent", icon: "user-round" },
    { label: "Fees & Payments", href: "/dashboard/parent", icon: "banknote" },
  ],
};
