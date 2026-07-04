import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { assertCanManageTarget } from "@/lib/server/userManagementGuards";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";
import { isValidRole } from "@/lib/roles";
import type { UserRole } from "@/types";

interface RouteParams {
  params: Promise<{ uid: string }>;
}

/**
 * Changes an existing account's role. Super Admin can assign any role,
 * including promoting/demoting other admin-level accounts. A plain
 * Administrator may only change the role of a non-admin-level account,
 * and never their own.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const caller = await requireApiAdminCaller();
    const { uid } = await params;

    const { role } = (await request.json()) as { role?: string };
    if (!role || !isValidRole(role)) {
      throw new ApiError(400, "A valid role is required.");
    }
    if (uid === caller.uid) {
      throw new ApiError(400, "You can't change your own role.");
    }

    const targetSnap = await adminDb.collection(USERS_COLLECTION).doc(uid).get();
    if (!targetSnap.exists) {
      throw new ApiError(404, "No such user.");
    }
    const currentRole = targetSnap.data()?.role as UserRole;
    // Block if the account's current role OR the requested new role is
    // admin-level and the caller isn't Super Admin.
    assertCanManageTarget(caller, currentRole);
    assertCanManageTarget(caller, role);

    await adminAuth.setCustomUserClaims(uid, { role });
    await adminDb
      .collection(USERS_COLLECTION)
      .doc(uid)
      .update({ role, updatedAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
