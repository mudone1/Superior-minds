import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { assertCanManageTarget } from "@/lib/server/userManagementGuards";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";
import { isValidRole } from "@/lib/roles";

export async function POST(request: NextRequest) {
  try {
    const caller = await requireApiAdminCaller();

    const { email, displayName, role, phone, temporaryPassword } = (await request.json()) as {
      email?: string;
      displayName?: string;
      role?: string;
      phone?: string;
      temporaryPassword?: string;
    };

    if (!email || !displayName || !role || !temporaryPassword) {
      throw new ApiError(400, "email, displayName, role, and temporaryPassword are all required.");
    }
    if (!isValidRole(role)) {
      throw new ApiError(400, `Unknown role: ${role}`);
    }
    assertCanManageTarget(caller, role);

    const userRecord = await adminAuth.createUser({
      email,
      displayName,
      password: temporaryPassword,
      emailVerified: false,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    const now = FieldValue.serverTimestamp();
    await adminDb
      .collection(USERS_COLLECTION)
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email,
        emailLower: email.toLowerCase(),
        displayName,
        displayNameLower: displayName.toLowerCase(),
        role,
        status: "active",
        photoURL: null,
        phone: phone ?? null,
        createdAt: now,
        updatedAt: now,
        createdBy: caller.uid,
        lastLoginAt: null,
      });

    return NextResponse.json({ uid: userRecord.uid });
  } catch (err) {
    if ((err as { code?: string })?.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    return apiErrorResponse(err);
  }
}
