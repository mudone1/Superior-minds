/**
 * A single student's CA + Exam entry for one subject, in one class arm,
 * for one term. This is intentionally the smallest useful unit — Phase
 * 5's Result Processing Engine will read across every subject a student
 * has a score in for a term to compute Average, Position, Overall
 * Average, and will add a separate per-student "report card" record for
 * Attendance, Psychomotor, Affective Domain, and the two comment fields
 * (those aren't per-subject, so they don't belong on this record).
 *
 * `caMax` / `examMax` are stored on each record (not hardcoded 40/60
 * everywhere) so Phase 5 can change the split per the uploaded Excel
 * template without a migration — every existing record still carries the
 * scale it was actually entered under.
 */
export const SCORE_STATUSES = ["draft", "submitted", "approved", "published"] as const;
export type ScoreStatus = (typeof SCORE_STATUSES)[number];

export const SCORE_STATUS_LABELS: Record<ScoreStatus, string> = {
  draft: "Draft",
  submitted: "Submitted for Approval",
  approved: "Approved",
  published: "Published",
};

export interface StudentScore {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  armId: string;
  armName: string;
  subjectId: string;
  subjectName: string;
  sessionId: string;
  termId: string;
  caScore: number | null;
  caMax: number;
  examScore: number | null;
  examMax: number;
  /** caScore + examScore once both are entered, otherwise null — never computed from partial data. */
  subjectTotal: number | null;
  status: ScoreStatus;
  enteredBy: string;
  enteredByName: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreEntryInput {
  studentId: string;
  caScore: number | null;
  examScore: number | null;
}

export const DEFAULT_CA_MAX = 40;
export const DEFAULT_EXAM_MAX = 60;
