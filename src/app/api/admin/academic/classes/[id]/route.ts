import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import {
  CLASSES_COLLECTION,
  CLASS_ARMS_COLLECTION,
  CLASS_SUBJECTS_COLLECTION,
  CLASS_TEACHERS_COLLECTION,
  TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION,
} from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdminCaller();
    const { id } = await params;
    const body = await request.json();

    const docRef = adminDb.collection(CLASSES_COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) throw new ApiError(404, "Class not found.");

    const changes: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (typeof body.name === "string" && body.name.trim()) changes.name = body.name.trim();
    if (body.order !== undefined && Number.isFinite(Number(body.order))) changes.order = Number(body.order);

    await docRef.update(changes);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdminCaller();
    const { id } = await params;

    const [arms, classSubjects, classTeachers, teacherAssignments] = await Promise.all([
      adminDb.collection(CLASS_ARMS_COLLECTION).where("classId", "==", id).limit(1).get(),
      adminDb.collection(CLASS_SUBJECTS_COLLECTION).where("classId", "==", id).limit(1).get(),
      adminDb.collection(CLASS_TEACHERS_COLLECTION).where("classId", "==", id).limit(1).get(),
      adminDb.collection(TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION).where("classId", "==", id).limit(1).get(),
    ]);

    if (!arms.empty) throw new ApiError(409, "Delete this class's arms first.");
    if (!classSubjects.empty || !classTeachers.empty || !teacherAssignments.empty) {
      throw new ApiError(409, "Remove this class's subject and teacher assignments first.");
    }

    await adminDb.collection(CLASSES_COLLECTION).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
