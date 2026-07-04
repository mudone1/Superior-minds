import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { STUDENTS_COLLECTION } from "@/lib/firebase/students";
import { requireApiStudentManager } from "@/lib/server/requireApiStudentManager";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";
import { promoteStudentSchema } from "@/lib/validation/student";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Moves a student into a new class/arm and marks them active again (a promotion out of "archived" or "transferred" reactivates the record). */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireApiStudentManager();
    const { id } = await params;
    const body = await request.json();
    const parsed = promoteStudentSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Choose a class and arm.");
    }

    const studentRef = adminDb.collection(STUDENTS_COLLECTION).doc(id);
    const studentSnap = await studentRef.get();
    if (!studentSnap.exists) {
      throw new ApiError(404, "No such student.");
    }

    await studentRef.update({
      class: parsed.data.class,
      arm: parsed.data.arm,
      status: "active",
      statusNote: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
