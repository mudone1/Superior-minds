import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import {
  CLASS_ARMS_COLLECTION,
  CLASS_TEACHERS_COLLECTION,
  TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION,
} from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ armId: string }> }) {
  try {
    await requireApiAdminCaller();
    const { armId } = await params;
    const body = await request.json();

    const docRef = adminDb.collection(CLASS_ARMS_COLLECTION).doc(armId);
    const snap = await docRef.get();
    if (!snap.exists) throw new ApiError(404, "Arm not found.");

    const changes: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (typeof body.name === "string" && body.name.trim()) changes.name = body.name.trim();

    await docRef.update(changes);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ armId: string }> }) {
  try {
    await requireApiAdminCaller();
    const { armId } = await params;

    const [classTeachers, teacherAssignments] = await Promise.all([
      adminDb.collection(CLASS_TEACHERS_COLLECTION).where("armId", "==", armId).limit(1).get(),
      adminDb.collection(TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION).where("armId", "==", armId).limit(1).get(),
    ]);
    if (!classTeachers.empty || !teacherAssignments.empty) {
      throw new ApiError(409, "Remove this arm's teacher assignments first.");
    }

    await adminDb.collection(CLASS_ARMS_COLLECTION).doc(armId).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
