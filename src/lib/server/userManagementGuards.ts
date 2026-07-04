import "server-only";
import { ADMIN_LEVEL_ROLES, type UserRole } from "@/types";
import { ApiError } from "./apiError";
import type { ApiCaller } from "./requireApiAdmin";

/**
 * Administrator-level accounts (Administrator, Super Admin) can only be
 * created, edited, role-changed, password-reset, or deleted by a Super
 * Admin. A plain Administrator managing another Administrator — or
 * themselves — would be a privilege-escalation path, so it's blocked
 * here centrally.
 */
export function assertCanManageTarget(caller: ApiCaller, targetRole: UserRole): void {
  const targetIsAdminLevel = (ADMIN_LEVEL_ROLES as UserRole[]).includes(targetRole);
  if (targetIsAdminLevel && caller.role !== "super-admin") {
    throw new ApiError(403, "Only Super Admin can manage Administrator or Super Admin accounts.");
  }
}

/** Random, human-typeable temporary password: 12 chars drawn from an unambiguous alphabet. */
export function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)] ?? "";
  }
  return out;
}
