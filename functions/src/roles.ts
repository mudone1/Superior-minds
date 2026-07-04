export const ROLES = [
  "super-admin",
  "administrator",
  "administrative-staff",
  "teacher",
  "parent",
] as const;

export type UserRole = (typeof ROLES)[number];

export function isValidRole(value: unknown): value is UserRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Roles permitted to create accounts and assign roles to others. */
export const ADMIN_LEVEL_ROLES: UserRole[] = ["super-admin", "administrator"];
