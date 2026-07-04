import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { SETTINGS_DOC_PATH } from "@/lib/firebase/settings";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function PATCH(request: NextRequest) {
  try {
    const caller = await requireApiAdminCaller();
    const { allowStaffAddStudents } = (await request.json()) as { allowStaffAddStudents?: boolean };

    if (typeof allowStaffAddStudents !== "boolean") {
      throw new ApiError(400, "allowStaffAddStudents must be true or false.");
    }

    await adminDb.doc(SETTINGS_DOC_PATH).set(
      {
        allowStaffAddStudents,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: caller.uid,
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
