import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { STUDENTS_COLLECTION } from "@/lib/firebase/students";
import { requireApiStudentManager } from "@/lib/server/requireApiStudentManager";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireApiStudentManager();
    const { id } = await params;

    const studentRef = adminDb.collection(STUDENTS_COLLECTION).doc(id);
    const studentSnap = await studentRef.get();
    if (!studentSnap.exists) {
      throw new ApiError(404, "No such student.");
    }

    await studentRef.update({
      status: "active",
      statusNote: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
