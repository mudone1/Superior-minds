import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db, auth } from "./config";
import type { StudentScore } from "@/types";

export const STUDENT_SCORES_COLLECTION = "studentScores";

async function ensureAuthReady(): Promise<void> {
  await auth.authStateReady();
}

function toISO(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return null;
}

export async function listScores(params: {
  armId: string;
  subjectId: string;
  termId: string;
}): Promise<StudentScore[]> {
  await ensureAuthReady();
  const snap = await getDocs(
    query(
      collection(db, STUDENT_SCORES_COLLECTION),
      where("armId", "==", params.armId),
      where("subjectId", "==", params.subjectId),
      where("termId", "==", params.termId)
    )
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      studentId: data.studentId,
      studentName: data.studentName,
      admissionNumber: data.admissionNumber ?? "",
      classId: data.classId,
      className: data.className,
      armId: data.armId,
      armName: data.armName,
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      sessionId: data.sessionId,
      termId: data.termId,
      caScore: data.caScore ?? null,
      caMax: data.caMax ?? 40,
      examScore: data.examScore ?? null,
      examMax: data.examMax ?? 60,
      subjectTotal: data.subjectTotal ?? null,
      status: data.status ?? "draft",
      enteredBy: data.enteredBy,
      enteredByName: data.enteredByName,
      submittedAt: toISO(data.submittedAt),
      createdAt: toISO(data.createdAt) ?? new Date().toISOString(),
      updatedAt: toISO(data.updatedAt) ?? new Date().toISOString(),
    };
  });
}
