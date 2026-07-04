import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_EXPIRES_DAYS } from "@/lib/constants";
import { isValidRole } from "@/lib/roles";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";

/**
 * POST /api/auth/session
 * Body: { idToken: string }
 * Verifies the freshly-signed-in user's ID token, then mints a long-lived
 * httpOnly session cookie so `middleware.ts` and server components can
 * recognize the session without re-sending the ID token on every request.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken, true);

    const profileSnap = await adminDb.collection(USERS_COLLECTION).doc(decoded.uid).get();
    if (!profileSnap.exists) {
      return NextResponse.json(
        { error: "No profile found for this account. Contact an administrator." },
        { status: 403 }
      );
    }
    const profile = profileSnap.data() as { role?: string; status?: string };
    if (!profile.role || !isValidRole(profile.role)) {
      return NextResponse.json({ error: "Account has no valid role assigned." }, { status: 403 });
    }
    if (profile.status === "suspended") {
      return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
    }

    const expiresIn = SESSION_COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Fire-and-forget: record the sign-in time for the user management
    // module's "Last Login" column. Never blocks establishing the session.
    adminDb
      .collection(USERS_COLLECTION)
      .doc(decoded.uid)
      .update({ lastLoginAt: FieldValue.serverTimestamp() })
      .catch((error) => console.error("[api/auth/session] lastLoginAt update failed", error));

    const response = NextResponse.json({ role: profile.role, status: profile.status });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("[api/auth/session] POST failed", error);
    return NextResponse.json({ error: "Unable to establish session." }, { status: 401 });
  }
}

/**
 * GET /api/auth/session
 * Verifies the current session cookie and returns the signed-in user's
 * uid + role, or 401 if there isn't a valid session.
 */
export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    const profileSnap = await adminDb.collection(USERS_COLLECTION).doc(decoded.uid).get();
    if (!profileSnap.exists) {
      return NextResponse.json({ error: "No profile" }, { status: 401 });
    }
    const profile = profileSnap.data() as {
      role: string;
      status: string;
      displayName: string;
      email: string;
      photoURL?: string | null;
    };
    return NextResponse.json({
      uid: decoded.uid,
      email: profile.email,
      displayName: profile.displayName,
      role: profile.role,
      status: profile.status,
      photoURL: profile.photoURL ?? null,
    });
  } catch (error) {
    console.error("[api/auth/session] GET failed", error);
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

/** DELETE /api/auth/session — clears the session cookie on sign-out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
