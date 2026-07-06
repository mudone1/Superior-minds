import "server-only";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import type { UserRole } from "@/types";
import { ApiError } from "./apiError";

export interface ApiSessionCaller {
  uid: string;
  role: UserRole;
}

/**
 * Verifies the session cookie without restricting by role — for API
 * routes any signed-in account may call (registering a push token,
 * marking a notification read). Mirrors `requireApiAdminCaller`'s
 * pattern but without the admin-level check.
 */
export async function requireApiSession(): Promise<ApiSessionCaller> {
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

  return { uid: decoded.uid, role: snap.data()?.role as UserRole };
}
