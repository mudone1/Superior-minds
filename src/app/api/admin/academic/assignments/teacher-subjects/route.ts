import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import {
  CLASSES_COLLECTION,
  CLASS_ARMS_COLLECTION,
  SUBJECTS_COLLECTION,
  TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION,
} from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function POST(request: NextRequest) {
  try {
    await requireApiAdminCaller();
    const body = await request.json();
    const armId = typeof body.armId === "string" ? body.armId : "";
    const subjectId = typeof body.subjectId === "string" ? body.subjectId : "";
    const teacherUid = typeof body.teacherUid === "string" ? body.teacherUid : "";
    if (!armId || !subjectId || !teacherUid) {
      throw new ApiError(400, "A class arm, subject, and teacher are all required.");
    }

    const [armSnap, subjectSnap, teacherSnap] = await Promise.all([
      adminDb.collection(CLASS_ARMS_COLLECTION).doc(armId).get(),
      adminDb.collection(SUBJECTS_COLLECTION).doc(subjectId).get(),
      adminDb.collection(USERS_COLLECTION).doc(teacherUid).get(),
    ]);
    if (!armSnap.exists) throw new ApiError(400, "That class arm no longer exists.");
    if (!subjectSnap.exists) throw new ApiError(400, "That subject no longer exists.");
    if (!teacherSnap.exists) throw new ApiError(400, "That teacher account no longer exists.");
    if (teacherSnap.data()?.role !== "teacher") {
      throw new ApiError(400, "Only accounts with the Teacher role can be assigned to teach a subject.");
    }

    const armData = armSnap.data()!;
    const classSnap = await adminDb.collection(CLASSES_COLLECTION).doc(armData.classId).get();

    const existing = await adminDb
      .collection(TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION)
      .where("armId", "==", armId)
      .where("subjectId", "==", subjectId)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new ApiError(409, "A teacher is already assigned to this subject for this class arm.");
    }

    const docRef = await adminDb.collection(TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION).add({
      teacherUid,
      teacherName: teacherSnap.data()?.displayName ?? "Unknown",
      classId: armData.classId,
      className: classSnap.data()?.name ?? armData.className,
      armId,
      armName: armData.name,
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

    await adminDb.collection(TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
