import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { STUDENTS_COLLECTION } from "@/lib/firebase/students";
import {
  CLASS_ARMS_COLLECTION,
  SUBJECTS_COLLECTION,
  TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION,
  TERMS_COLLECTION,
} from "@/lib/firebase/academic";
import { STUDENT_SCORES_COLLECTION } from "@/lib/firebase/scores";
import { requireApiSession } from "@/lib/server/requireApiSession";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";
import { DEFAULT_CA_MAX, DEFAULT_EXAM_MAX, type ScoreStatus } from "@/types";

/** Statuses a teacher may still write into — once approved/published by an admin, the record is locked from further teacher edits. */
const EDITABLE_STATUSES: ScoreStatus[] = ["draft", "submitted"];

export async function POST(request: NextRequest) {
  try {
    const caller = await requireApiSession();
    if (caller.role !== "teacher") {
      throw new ApiError(403, "Only teacher accounts can enter scores.");
    }

    const body = await request.json();
    const armId = typeof body.armId === "string" ? body.armId : "";
    const subjectId = typeof body.subjectId === "string" ? body.subjectId : "";
    const termId = typeof body.termId === "string" ? body.termId : "";
    const entries: Array<{ studentId: string; caScore: number | null; examScore: number | null }> =
      Array.isArray(body.entries) ? body.entries : [];

    if (!armId || !subjectId || !termId) {
      throw new ApiError(400, "Class arm, subject, and term are all required.");
    }
    if (entries.length === 0) {
      throw new ApiError(400, "No score entries were provided.");
    }

    // Confirm this teacher is actually assigned to teach this subject in
    // this arm — the one real authorization check for this whole route,
    // since Firestore rules deny all direct writes to studentScores.
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
    const assignment = assignmentSnap.docs[0]!.data();

    const [armSnap, subjectSnap, termSnap] = await Promise.all([
      adminDb.collection(CLASS_ARMS_COLLECTION).doc(armId).get(),
      adminDb.collection(SUBJECTS_COLLECTION).doc(subjectId).get(),
      adminDb.collection(TERMS_COLLECTION).doc(termId).get(),
    ]);
    if (!armSnap.exists) throw new ApiError(400, "That class arm no longer exists.");
    if (!subjectSnap.exists) throw new ApiError(400, "That subject no longer exists.");
    if (!termSnap.exists) throw new ApiError(400, "That term no longer exists.");

    const armData = armSnap.data()!;
    const termData = termSnap.data()!;
    const caMax = DEFAULT_CA_MAX;
    const examMax = DEFAULT_EXAM_MAX;

    for (const entry of entries) {
      if (typeof entry.studentId !== "string" || !entry.studentId) {
        throw new ApiError(400, "One of the entries is missing a student.");
      }
      if (entry.caScore !== null && (typeof entry.caScore !== "number" || entry.caScore < 0 || entry.caScore > caMax)) {
        throw new ApiError(400, `CA score must be between 0 and ${caMax}.`);
      }
      if (
        entry.examScore !== null &&
        (typeof entry.examScore !== "number" || entry.examScore < 0 || entry.examScore > examMax)
      ) {
        throw new ApiError(400, `Exam score must be between 0 and ${examMax}.`);
      }
    }

    // Existing records for this exact class-arm-subject-term, keyed by
    // student, so a save with a subset of students never clobbers
    // classmates' rows and re-saving an already-submitted row is blocked
    // rather than silently accepted.
    const existingSnap = await adminDb
      .collection(STUDENT_SCORES_COLLECTION)
      .where("armId", "==", armId)
      .where("subjectId", "==", subjectId)
      .where("termId", "==", termId)
      .get();
    const existingByStudent = new Map(existingSnap.docs.map((d) => [d.data().studentId as string, d]));

    const now = FieldValue.serverTimestamp();
    const batch = adminDb.batch();
    let skippedLocked = 0;

    for (const entry of entries) {
      const existing = existingByStudent.get(entry.studentId);
      if (existing && !EDITABLE_STATUSES.includes(existing.data().status)) {
        skippedLocked++;
        continue;
      }

      const subjectTotal = entry.caScore !== null && entry.examScore !== null ? entry.caScore + entry.examScore : null;

      if (existing) {
        batch.update(existing.ref, {
          caScore: entry.caScore,
          examScore: entry.examScore,
          subjectTotal,
          updatedAt: now,
        });
      } else {
        const studentSnap = await adminDb.collection(STUDENTS_COLLECTION).doc(entry.studentId).get();
        if (!studentSnap.exists) continue;
        const studentData = studentSnap.data()!;

        const docRef = adminDb.collection(STUDENT_SCORES_COLLECTION).doc();
        batch.set(docRef, {
          studentId: entry.studentId,
          studentName: `${studentData.surname} ${studentData.otherNames}`,
          admissionNumber: studentData.admissionNumber ?? "",
          classId: assignment.classId,
          className: assignment.className,
          armId,
          armName: armData.name,
          subjectId,
          subjectName: subjectSnap.data()?.name,
          sessionId: termData.sessionId,
          termId,
          caScore: entry.caScore,
          caMax,
          examScore: entry.examScore,
          examMax,
          subjectTotal,
          status: "draft",
          enteredBy: caller.uid,
          enteredByName: assignment.teacherName,
          submittedAt: null,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await batch.commit();
    return NextResponse.json({ ok: true, saved: entries.length - skippedLocked, skippedLocked });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
