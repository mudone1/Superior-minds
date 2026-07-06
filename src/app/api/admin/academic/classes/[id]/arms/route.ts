import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { CLASSES_COLLECTION, CLASS_ARMS_COLLECTION } from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdminCaller();
    const { id: classId } = await params;
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) throw new ApiError(400, "Arm name is required, e.g. \"Gold\" or \"A\".");

    const classSnap = await adminDb.collection(CLASSES_COLLECTION).doc(classId).get();
    if (!classSnap.exists) throw new ApiError(404, "Class not found.");
    const className = classSnap.data()?.name as string;

    const existing = await adminDb
      .collection(CLASS_ARMS_COLLECTION)
      .where("classId", "==", classId)
      .where("name", "==", name)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new ApiError(409, `"${name}" already exists for ${className}.`);
    }

    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(CLASS_ARMS_COLLECTION).add({
      classId,
      className,
      name,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
