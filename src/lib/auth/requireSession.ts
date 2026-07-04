import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { isValidRole, dashboardPathForRole } from "@/lib/roles";
import { isAdminLevelRole, isStaffRole } from "@/types";
import type { SessionUser, UserRole } from "@/types";

/**
 * Verifies the session cookie against Firebase Admin and loads the
 * matching Firestore profile. Redirects to /login if anything is
 * missing, expired, revoked, or the linked profile no longer exists —
 * this is the real authorization boundary; `middleware.ts` is only a
 * cheap first pass.
 */
export async function requireSession(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const profileSnap = await adminDb.collection(USERS_COLLECTION).doc(decoded.uid).get();

    if (!profileSnap.exists) {
      redirect("/login");
    }

    const profile = profileSnap.data() as {
      email: string;
      displayName: string;
      role: string;
      status: string;
      photoURL?: string | null;
    };

    if (!isValidRole(profile.role) || profile.status === "suspended") {
      redirect("/unauthorized");
    }

    return {
      uid: decoded.uid,
      email: profile.email,
      displayName: profile.displayName,
      role: profile.role,
      status: profile.status as SessionUser["status"],
      photoURL: profile.photoURL ?? null,
    };
  } catch {
    redirect("/login");
  }
}

/**
 * Guards a role-specific dashboard segment. A signed-in user whose role
 * doesn't match the requested segment is sent to *their own* dashboard
 * rather than a dead end — typing /dashboard/teacher as a parent just
 * bounces you back to /dashboard/parent.
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await requireSession();
  if (user.role !== role) {
    redirect(dashboardPathForRole(user.role));
  }
  return user;
}

/**
 * Guards routes shared by both admin-level roles (Super Admin and
 * Administrator) — currently just the user management module. Anyone
 * else signed in is sent back to their own dashboard rather than an
 * unauthorized page, matching `requireRole`'s behavior.
 */
export async function requireAdminLevel(): Promise<SessionUser> {
  const user = await requireSession();
  if (!isAdminLevelRole(user.role)) {
    redirect(dashboardPathForRole(user.role));
  }
  return user;
}

/**
 * Guards routes any staff role can view but Parent cannot — currently the
 * student directory and profile pages. Parents will get their own scoped
 * view of just their children in a future phase.
 */
export async function requireStaff(): Promise<SessionUser> {
  const user = await requireSession();
  if (!isStaffRole(user.role)) {
    redirect(dashboardPathForRole(user.role));
  }
  return user;
}
