import "server-only";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { SETTINGS_DOC_PATH } from "@/lib/firebase/settings";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { isAdminLevelRole, isStaffRole, type UserRole } from "@/types";
import { ApiError } from "./apiError";

export interface ApiCaller {
  uid: string;
  role: UserRole;
}

/**
 * Confirms the caller is signed in, holds a staff role, and — for
 * mutating requests — is either admin-level (always permitted) or
 * Administrative Staff with the "allow staff to add students" setting
 * currently on. Read-only viewing of the directory only requires
 * `isStaffRole`, checked separately at the page level.
 */
export async function requireApiStudentManager(): Promise<ApiCaller> {
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
  if (!isStaffRole(role)) {
    throw new ApiError(403, "Only staff accounts can manage student records.");
  }

  const caller: ApiCaller = { uid: decoded.uid, role };

  if (isAdminLevelRole(role)) {
    return caller;
  }

  if (role === "administrative-staff") {
    const settingsSnap = await adminDb.doc(SETTINGS_DOC_PATH).get();
    const allowStaffAddStudents = settingsSnap.exists
      ? Boolean(settingsSnap.data()?.allowStaffAddStudents)
      : false;
    if (allowStaffAddStudents) {
      return caller;
    }
  }

  throw new ApiError(
    403,
    "Only Administrators can add or edit students. Ask an Administrator to enable this permission for Administrative Staff in Settings."
  );
}
