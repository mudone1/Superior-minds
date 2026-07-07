import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION } from "@/lib/firebase/academic";
import { STUDENT_SCORES_COLLECTION } from "@/lib/firebase/scores";
import { requireApiSession } from "@/lib/server/requireApiSession";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function POST(request: NextRequest) {
  try {
    const caller = await requireApiSession();
    if (caller.role !== "teacher") {
      throw new ApiError(403, "Only teacher accounts can submit scores.");
    }

    const body = await request.json();
    const armId = typeof body.armId === "string" ? body.armId : "";
    const subjectId = typeof body.subjectId === "string" ? body.subjectId : "";
    const termId = typeof body.termId === "string" ? body.termId : "";
    if (!armId || !subjectId || !termId) {
      throw new ApiError(400, "Class arm, subject, and term are all required.");
    }

    const assignmentSnap = await adminDb
      .collection(TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION)
      .where("armId", "==", armId)
      .where("subjectId", "==", subjectId)
      .where("teacherUid", "==", caller.uid)
      .limit(1)
      .get();
    if (assignmentSnap.empty) {
      throw new ApiError(403, "You aren't assigned to teach this subject for this class.");
    }

    const draftsSnap = await adminDb
      .collection(STUDENT_SCORES_COLLECTION)
      .where("armId", "==", armId)
      .where("subjectId", "==", subjectId)
      .where("termId", "==", termId)
      .where("status", "==", "draft")
      .get();

    if (draftsSnap.empty) {
      throw new ApiError(400, "There are no draft scores to submit — save some scores first.");
    }

    const incomplete = draftsSnap.docs.filter((d) => d.data().subjectTotal === null);
    if (incomplete.length > 0) {
      throw new ApiError(
        400,
        `${incomplete.length} student${incomplete.length === 1 ? "" : "s"} still ${incomplete.length === 1 ? "is" : "are"} missing a CA or Exam score. Complete every row before submitting.`
      );
    }

    const now = FieldValue.serverTimestamp();
    const batch = adminDb.batch();
    draftsSnap.docs.forEach((d) => {
      batch.update(d.ref, { status: "submitted", submittedAt: now, updatedAt: now });
    });
    await batch.commit();

    return NextResponse.json({ ok: true, submitted: draftsSnap.size });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
