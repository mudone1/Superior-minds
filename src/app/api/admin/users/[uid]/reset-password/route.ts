import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { assertCanManageTarget, generateTemporaryPassword } from "@/lib/server/userManagementGuards";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";
import type { UserRole } from "@/types";

interface RouteParams {
  params: Promise<{ uid: string }>;
}

/**
 * Issues a fresh temporary password for an account and returns it once in
 * the response — it is never stored or logged in plaintext. The admin is
 * expected to relay it to the user through a trusted channel.
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const caller = await requireApiAdminCaller();
    const { uid } = await params;

    const targetSnap = await adminDb.collection(USERS_COLLECTION).doc(uid).get();
    if (!targetSnap.exists) {
      throw new ApiError(404, "No such user.");
    }
    const targetRole = targetSnap.data()?.role as UserRole;
    assertCanManageTarget(caller, targetRole);

    const temporaryPassword = generateTemporaryPassword();
    await adminAuth.updateUser(uid, { password: temporaryPassword });
    await adminDb
      .collection(USERS_COLLECTION)
      .doc(uid)
      .update({ updatedAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ temporaryPassword });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
