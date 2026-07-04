"use client";

import type { AccountStatus, CreateUserInput, UpdateUserInput, UserRole } from "@/types";

/**
 * Despite the file's name (kept stable so nothing importing from here had
 * to change), these calls hit our own Next.js API routes under
 * /api/admin/users, not Firebase Cloud Functions. Cloud Functions and
 * Firebase Storage both require the paid Blaze plan; these routes run the
 * same Admin SDK logic through the app's own server instead, so account
 * management works fully on the free Spark plan.
 */
export class ManageUserError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ManageUserError";
  }
}

async function apiCall<TOutput>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: object
): Promise<TOutput> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ManageUserError(0, "Couldn't reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message: string = payload.error || "Something went wrong. Please try again.";
    throw new ManageUserError(res.status, message);
  }

  return res.json() as Promise<TOutput>;
}

export function createStaffAccount(input: CreateUserInput): Promise<{ uid: string }> {
  return apiCall("/api/admin/users", "POST", input);
}

export function updateStaffAccount(input: UpdateUserInput): Promise<{ ok: true }> {
  const { uid, ...rest } = input;
  return apiCall(`/api/admin/users/${uid}`, "PATCH", rest);
}

export function setUserRole(uid: string, role: UserRole): Promise<{ ok: true }> {
  return apiCall(`/api/admin/users/${uid}/role`, "POST", { role });
}

export function resetStaffPassword(uid: string): Promise<{ temporaryPassword: string }> {
  return apiCall(`/api/admin/users/${uid}/reset-password`, "POST");
}

export function deleteStaffAccount(uid: string): Promise<{ ok: true }> {
  return apiCall(`/api/admin/users/${uid}`, "DELETE");
}

/** Convenience wrapper for the common "suspend" / "reactivate" toggle, built on updateStaffAccount. */
export function setUserStatus(uid: string, status: AccountStatus): Promise<{ ok: true }> {
  return updateStaffAccount({ uid, status });
}
