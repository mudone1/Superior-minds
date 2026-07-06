import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { CLASSES_COLLECTION, CLASS_ARMS_COLLECTION, CLASS_TEACHERS_COLLECTION } from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function POST(request: NextRequest) {
  try {
    await requireApiAdminCaller();
    const body = await request.json();
    const armId = typeof body.armId === "string" ? body.armId : "";
    const teacherUid = typeof body.teacherUid === "string" ? body.teacherUid : "";
    if (!armId || !teacherUid) throw new ApiError(400, "A class arm and teacher are both required.");

    const [armSnap, teacherSnap] = await Promise.all([
      adminDb.collection(CLASS_ARMS_COLLECTION).doc(armId).get(),
      adminDb.collection(USERS_COLLECTION).doc(teacherUid).get(),
    ]);
    if (!armSnap.exists) throw new ApiError(400, "That class arm no longer exists.");
    if (!teacherSnap.exists) throw new ApiError(400, "That teacher account no longer exists.");
    if (teacherSnap.data()?.role !== "teacher") {
      throw new ApiError(400, "Only accounts with the Teacher role can be assigned as a class teacher.");
    }

    const armData = armSnap.data()!;
    const classSnap = await adminDb.collection(CLASSES_COLLECTION).doc(armData.classId).get();

    // Only one active class teacher per arm — replace, don't stack.
    const existing = await adminDb
      .collection(CLASS_TEACHERS_COLLECTION)
      .where("armId", "==", armId)
      .get();
    const batch = adminDb.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));

    const newRef = adminDb.collection(CLASS_TEACHERS_COLLECTION).doc();
    batch.set(newRef, {
      classId: armData.classId,
      className: classSnap.data()?.name ?? armData.className,
      armId,
      armName: armData.name,
      teacherUid,
      teacherName: teacherSnap.data()?.displayName ?? "Unknown",
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return NextResponse.json({ id: newRef.id });
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

    await adminDb.collection(CLASS_TEACHERS_COLLECTION).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
