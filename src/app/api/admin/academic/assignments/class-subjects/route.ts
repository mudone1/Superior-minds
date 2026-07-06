import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { CLASSES_COLLECTION, SUBJECTS_COLLECTION, CLASS_SUBJECTS_COLLECTION } from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function POST(request: NextRequest) {
  try {
    await requireApiAdminCaller();
    const body = await request.json();
    const classId = typeof body.classId === "string" ? body.classId : "";
    const subjectId = typeof body.subjectId === "string" ? body.subjectId : "";
    if (!classId || !subjectId) throw new ApiError(400, "A class and subject are both required.");

    const [classSnap, subjectSnap] = await Promise.all([
      adminDb.collection(CLASSES_COLLECTION).doc(classId).get(),
      adminDb.collection(SUBJECTS_COLLECTION).doc(subjectId).get(),
    ]);
    if (!classSnap.exists) throw new ApiError(400, "That class no longer exists.");
    if (!subjectSnap.exists) throw new ApiError(400, "That subject no longer exists.");

    const existing = await adminDb
      .collection(CLASS_SUBJECTS_COLLECTION)
      .where("classId", "==", classId)
      .where("subjectId", "==", subjectId)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new ApiError(409, "That subject is already part of this class's curriculum.");
    }

    const docRef = await adminDb.collection(CLASS_SUBJECTS_COLLECTION).add({
      classId,
      className: classSnap.data()?.name,
      subjectId,
      subjectName: subjectSnap.data()?.name,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireApiAdminCaller();
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) throw new ApiError(400, "Missing assignment id.");

    await adminDb.collection(CLASS_SUBJECTS_COLLECTION).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
