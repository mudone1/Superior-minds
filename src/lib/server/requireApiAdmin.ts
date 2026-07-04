import "server-only";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { isAdminLevelRole, type UserRole } from "@/types";
import { ApiError } from "./apiError";

export interface ApiCaller {
  uid: string;
  role: UserRole;
}

/**
 * Verifies the session cookie and confirms the caller's role — read from
 * their Firestore profile, the same source of truth `requireSession` uses
 * for page-level auth — is Administrator or Super Admin. Every user
 * management API route calls this first, before touching Auth or
 * Firestore on anyone's behalf.
 */
export async function requireApiAdminCaller(): Promise<ApiCaller> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    throw new ApiError(401, "Sign in required.");
  }

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  const snap = await adminDb.collection(USERS_COLLECTION).doc(decoded.uid).get();
  if (!snap.exists) {
    throw new ApiError(401, "Account not found.");
  }

  const role = snap.data()?.role as UserRole;
  if (!isAdminLevelRole(role)) {
    throw new ApiError(403, "Only Super Admin or Administrator accounts can manage users.");
  }

  return { uid: decoded.uid, role };
}
