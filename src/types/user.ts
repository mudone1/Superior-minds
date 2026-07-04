/**
 * Every account in Superior Minds Academy is assigned exactly one role.
 * The role determines which dashboard the user lands on after login and
 * which Firestore documents they may read or write (enforced again in
 * firestore.rules — never trust the client alone).
 */
export const ROLES = [
  "super-admin",
  "administrator",
  "administrative-staff",
  "teacher",
  "parent",
] as const;

export type UserRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  "super-admin": "Super Admin",
  administrator: "Administrator",
  "administrative-staff": "Administrative Staff",
  teacher: "Teacher",
  parent: "Parent",
};

/** Where each role lands immediately after authenticating. */
export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  "super-admin": "/dashboard/super-admin",
  administrator: "/dashboard/administrator",
  "administrative-staff": "/dashboard/administrative-staff",
  teacher: "/dashboard/teacher",
  parent: "/dashboard/parent",
};

export type AccountStatus = "active" | "suspended" | "pending";

export const ACCOUNT_STATUSES: AccountStatus[] = ["active", "suspended", "pending"];

export const STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};

/** Roles permitted to manage accounts: add, edit, delete, reset passwords, assign roles. */
export const ADMIN_LEVEL_ROLES: UserRole[] = ["super-admin", "administrator"];

export function isAdminLevelRole(role: UserRole): boolean {
  return (ADMIN_LEVEL_ROLES as UserRole[]).includes(role);
}

/** Every role except Parent — used to guard the internal student directory and other staff-only screens. */
export const STAFF_ROLES: UserRole[] = [
  "super-admin",
  "administrator",
  "administrative-staff",
  "teacher",
];

export function isStaffRole(role: UserRole): boolean {
  return (STAFF_ROLES as UserRole[]).includes(role);
}

/**
 * Shape of a document in the top-level `users` Firestore collection,
 * keyed by the Firebase Auth uid.
 */
export interface AppUser {
  uid: string;
  email: string;
  /** Lowercased mirror of `email`, maintained server-side, used for prefix search. */
  emailLower: string;
  displayName: string;
  /** Lowercased mirror of `displayName`, maintained server-side, used for prefix search. */
  displayNameLower: string;
  role: UserRole;
  status: AccountStatus;
  photoURL?: string | null;
  phone?: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  /** uid of the admin/super-admin who provisioned this account. */
  createdBy?: string | null;
  /** ISO timestamp of the most recent successful sign-in, or null if never. */
  lastLoginAt?: string | null;
}

/** Payload the "Add User" form sends to the createStaffAccount callable. */
export interface CreateUserInput {
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  temporaryPassword: string;
}

/** Payload the "Edit User" form sends to the updateStaffAccount callable. Email and role are changed via their own dedicated flows, not here. */
export interface UpdateUserInput {
  uid: string;
  displayName?: string;
  phone?: string | null;
  status?: AccountStatus;
  photoURL?: string | null;
}

/** Minimal identity used by the client-side auth context. */
export interface SessionUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: AccountStatus;
  photoURL?: string | null;
}
