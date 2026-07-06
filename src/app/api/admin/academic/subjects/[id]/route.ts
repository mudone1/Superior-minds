import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import {
  SUBJECTS_COLLECTION,
  CLASS_SUBJECTS_COLLECTION,
  TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION,
} from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdminCaller();
    const { id } = await params;
    const body = await request.json();

    const docRef = adminDb.collection(SUBJECTS_COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) throw new ApiError(404, "Subject not found.");

    const changes: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (typeof body.name === "string" && body.name.trim()) changes.name = body.name.trim();
    if ("code" in body) changes.code = typeof body.code === "string" ? body.code.trim().toUpperCase() || null : null;

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

    const [classSubjects, teacherAssignments] = await Promise.all([
      adminDb.collection(CLASS_SUBJECTS_COLLECTION).where("subjectId", "==", id).limit(1).get(),
      adminDb.collection(TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION).where("subjectId", "==", id).limit(1).get(),
    ]);
    if (!classSubjects.empty || !teacherAssignments.empty) {
      throw new ApiError(409, "Remove this subject from classes and teacher assignments first.");
    }

    await adminDb.collection(SUBJECTS_COLLECTION).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
