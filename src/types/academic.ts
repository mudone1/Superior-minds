/**
 * Academic Setup data model.
 *
 * Design notes:
 * - A Term always belongs to a Session (e.g. "First Term" under
 *   "2025/2026") — terms are never shared across sessions.
 * - A Class Arm always belongs to a Class (e.g. "Gold" under "Primary 4").
 * - "Current" session/term is NOT stored as a flag on each document.
 *   It's a single pointer in `settings/academic` (currentSessionId /
 *   currentTermId), so switching current never requires touching more
 *   than one document — no multi-document transaction, no risk of two
 *   sessions both claiming to be "current" if a write partially fails.
 * - Student.class / Student.arm remain plain strings on the Student
 *   record (unchanged) — they're validated against these collections'
 *   `name` fields, not rewritten to store IDs. This keeps every existing
 *   student record and every place that reads `student.class` working
 *   without a data migration.
 */

export interface AcademicSession {
  id: string;
  name: string; // e.g. "2025/2026"
  startDate?: string | null; // ISO date
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicSessionInput {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface Term {
  id: string;
  sessionId: string;
  name: string; // e.g. "First Term"
  order: number; // 1, 2, 3 — for sorting within a session
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTermInput {
  sessionId: string;
  name: string;
  order: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Primary 4"
  order: number; // for display sorting, Creche -> SS3
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchoolClassInput {
  name: string;
  order: number;
}

export interface ClassArm {
  id: string;
  classId: string;
  className: string; // denormalized for display without a join
  name: string; // e.g. "Gold", "A"
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassArmInput {
  classId: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string; // e.g. "Mathematics"
  code?: string | null; // e.g. "MTH"
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectInput {
  name: string;
  code?: string | null;
}

/** Which subjects make up a class's curriculum (not arm-specific — all arms of a class share the same subject list). */
export interface ClassSubject {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  createdAt: string;
}

/** The homeroom / class teacher for a specific class arm. One active assignment per arm — creating a new one is expected to replace the previous. */
export interface ClassTeacher {
  id: string;
  classId: string;
  className: string;
  armId: string;
  armName: string;
  teacherUid: string;
  teacherName: string;
  createdAt: string;
}

/** Which teacher teaches a given subject to a given class arm. This is what the Teacher Portal (Phase 4) will query by `teacherUid` to resolve "my classes" + "my subjects" + (via matching Student.class/arm) "my students". */
export interface TeacherSubjectAssignment {
  id: string;
  teacherUid: string;
  teacherName: string;
  classId: string;
  className: string;
  armId: string;
  armName: string;
  subjectId: string;
  subjectName: string;
  createdAt: string;
}

/** Singleton `settings/academic` document — the one source of truth for "what's active right now". */
export interface AcademicSettings {
  currentSessionId: string | null;
  currentSessionName: string | null;
  currentTermId: string | null;
  currentTermName: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export const DEFAULT_ACADEMIC_SETTINGS: AcademicSettings = {
  currentSessionId: null,
  currentSessionName: null,
  currentTermId: null,
  currentTermName: null,
  updatedAt: null,
  updatedBy: null,
};
