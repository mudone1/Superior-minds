import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { type UpdateRequest } from "firebase-admin/auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { assertCanManageTarget } from "@/lib/server/userManagementGuards";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";
import type { UserRole } from "@/types";

interface RouteParams {
  params: Promise<{ uid: string }>;
}

/**
 * Edits the non-identity fields of an existing account: display name,
 * phone, status (active/suspended), and avatar URL. Email is intentionally
 * out of scope — changing it means re-verifying ownership of the new
 * address, a separate flow. Role changes go through the /role route so
 * the two mutations stay independently permissioned and auditable.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const caller = await requireApiAdminCaller();
    const { uid } = await params;

    const { displayName, phone, status, photoURL } = (await request.json()) as {
      displayName?: string;
      phone?: string | null;
      status?: string;
      photoURL?: string | null;
    };

    if (status && !["active", "suspended", "pending"].includes(status)) {
      throw new ApiError(400, `Unknown status: ${status}`);
    }

    const targetSnap = await adminDb.collection(USERS_COLLECTION).doc(uid).get();
    if (!targetSnap.exists) {
      throw new ApiError(404, "No such user.");
    }
    const targetRole = targetSnap.data()?.role as UserRole;
    assertCanManageTarget(caller, targetRole);

    if (status === "suspended" && uid === caller.uid) {
      throw new ApiError(400, "You can't suspend your own account.");
    }

    const firestoreChanges: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    const authChanges: UpdateRequest = {};

    if (typeof displayName === "string" && displayName.trim()) {
      firestoreChanges.displayName = displayName.trim();
      firestoreChanges.displayNameLower = displayName.trim().toLowerCase();
      authChanges.displayName = displayName.trim();
    }
    if (phone !== undefined) {
      firestoreChanges.phone = phone;
    }
    if (photoURL !== undefined) {
      firestoreChanges.photoURL = photoURL;
      authChanges.photoURL = photoURL;
    }
    if (status) {
      firestoreChanges.status = status;
      authChanges.disabled = status === "suspended";
    }

    if (Object.keys(authChanges).length > 0) {
      await adminAuth.updateUser(uid, authChanges);
    }
    await adminDb.collection(USERS_COLLECTION).doc(uid).update(firestoreChanges);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

/**
 * Permanently removes an account: deletes the Firebase Auth user, then
 * cleans up the Firestore profile in the same request (no Cloud Functions
 * trigger to lean on here, so both steps happen inline).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const caller = await requireApiAdminCaller();
    const { uid } = await params;

    if (uid === caller.uid) {
      throw new ApiError(400, "You can't delete your own account.");
    }

    const targetSnap = await adminDb.collection(USERS_COLLECTION).doc(uid).get();
    if (!targetSnap.exists) {
      throw new ApiError(404, "No such user.");
    }
    const targetRole = targetSnap.data()?.role as UserRole;
    assertCanManageTarget(caller, targetRole);

    await adminAuth.deleteUser(uid);
    await adminDb
      .collection(USERS_COLLECTION)
      .doc(uid)
      .delete()
      .catch(() => {
        // Auth user is already gone either way — nothing more to do.
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
