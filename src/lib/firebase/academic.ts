import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db, auth } from "./config";
import type {
  AcademicSession,
  AcademicSettings,
  ClassArm,
  ClassSubject,
  ClassTeacher,
  SchoolClass,
  Subject,
  Term,
  TeacherSubjectAssignment,
} from "@/types";
import { DEFAULT_ACADEMIC_SETTINGS } from "@/types";

export const ACADEMIC_SESSIONS_COLLECTION = "academicSessions";
export const TERMS_COLLECTION = "terms";
export const CLASSES_COLLECTION = "classes";
export const CLASS_ARMS_COLLECTION = "classArms";
export const SUBJECTS_COLLECTION = "subjects";
export const CLASS_SUBJECTS_COLLECTION = "classSubjects";
export const CLASS_TEACHERS_COLLECTION = "classTeachers";
export const TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION = "teacherSubjectAssignments";
export const ACADEMIC_SETTINGS_DOC_PATH = "settings/academic";

/**
 * Every read below goes through the client SDK, which enforces Firestore
 * rules against `request.auth`. On a hard refresh that's only populated
 * once persisted auth state restores, so every function here waits for
 * it first — same reasoning as `lib/firebase/users.ts` and `students.ts`.
 */
async function ensureAuthReady(): Promise<void> {
  await auth.authStateReady();
}

function toISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function docData<T>(docSnap: QueryDocumentSnapshot<DocumentData>, map: (data: DocumentData) => Omit<T, "id">): T {
  return { id: docSnap.id, ...map(docSnap.data()) } as T;
}

export async function listAcademicSessions(): Promise<AcademicSession[]> {
  await ensureAuthReady();
  const snap = await getDocs(
    query(collection(db, ACADEMIC_SESSIONS_COLLECTION), orderBy("name", "desc"))
  );
  return snap.docs.map((d) =>
    docData<AcademicSession>(d, (data) => ({
      name: data.name,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      createdAt: toISO(data.createdAt),
      updatedAt: toISO(data.updatedAt),
    }))
  );
}

export async function listTerms(sessionId?: string): Promise<Term[]> {
  await ensureAuthReady();
  const constraints = sessionId ? [where("sessionId", "==", sessionId)] : [];
  const snap = await getDocs(query(collection(db, TERMS_COLLECTION), ...constraints));
  const terms = snap.docs.map((d) =>
    docData<Term>(d, (data) => ({
      sessionId: data.sessionId,
      name: data.name,
      order: data.order ?? 0,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      createdAt: toISO(data.createdAt),
      updatedAt: toISO(data.updatedAt),
    }))
  );
  return terms.sort((a, b) => a.order - b.order);
}

export async function listSchoolClasses(): Promise<SchoolClass[]> {
  await ensureAuthReady();
  const snap = await getDocs(query(collection(db, CLASSES_COLLECTION), orderBy("order", "asc")));
  return snap.docs.map((d) =>
    docData<SchoolClass>(d, (data) => ({
      name: data.name,
      order: data.order ?? 0,
      createdAt: toISO(data.createdAt),
      updatedAt: toISO(data.updatedAt),
    }))
  );
}

export async function listClassArms(classId?: string): Promise<ClassArm[]> {
  await ensureAuthReady();
  const constraints = classId ? [where("classId", "==", classId)] : [];
  const snap = await getDocs(query(collection(db, CLASS_ARMS_COLLECTION), ...constraints));
  return snap.docs.map((d) =>
    docData<ClassArm>(d, (data) => ({
      classId: data.classId,
      className: data.className,
      name: data.name,
      createdAt: toISO(data.createdAt),
      updatedAt: toISO(data.updatedAt),
    }))
  );
}

export async function listSubjects(): Promise<Subject[]> {
  await ensureAuthReady();
  const snap = await getDocs(query(collection(db, SUBJECTS_COLLECTION), orderBy("name", "asc")));
  return snap.docs.map((d) =>
    docData<Subject>(d, (data) => ({
      name: data.name,
      code: data.code ?? null,
      createdAt: toISO(data.createdAt),
      updatedAt: toISO(data.updatedAt),
    }))
  );
}

export async function listClassSubjects(classId?: string): Promise<ClassSubject[]> {
  await ensureAuthReady();
  const constraints = classId ? [where("classId", "==", classId)] : [];
  const snap = await getDocs(query(collection(db, CLASS_SUBJECTS_COLLECTION), ...constraints));
  return snap.docs.map((d) =>
    docData<ClassSubject>(d, (data) => ({
      classId: data.classId,
      className: data.className,
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      createdAt: toISO(data.createdAt),
    }))
  );
}

export async function listClassTeachers(params?: { classId?: string; armId?: string }): Promise<ClassTeacher[]> {
  await ensureAuthReady();
  const constraints = [];
  if (params?.armId) constraints.push(where("armId", "==", params.armId));
  else if (params?.classId) constraints.push(where("classId", "==", params.classId));
  const snap = await getDocs(query(collection(db, CLASS_TEACHERS_COLLECTION), ...constraints));
  return snap.docs.map((d) =>
    docData<ClassTeacher>(d, (data) => ({
      classId: data.classId,
      className: data.className,
      armId: data.armId,
      armName: data.armName,
      teacherUid: data.teacherUid,
      teacherName: data.teacherName,
      createdAt: toISO(data.createdAt),
    }))
  );
}

export async function listTeacherSubjectAssignments(params?: {
  teacherUid?: string;
  classId?: string;
  armId?: string;
}): Promise<TeacherSubjectAssignment[]> {
  await ensureAuthReady();
  const constraints = [];
  if (params?.teacherUid) constraints.push(where("teacherUid", "==", params.teacherUid));
  if (params?.armId) constraints.push(where("armId", "==", params.armId));
  else if (params?.classId) constraints.push(where("classId", "==", params.classId));
  const snap = await getDocs(
    query(collection(db, TEACHER_SUBJECT_ASSIGNMENTS_COLLECTION), ...constraints)
  );
  return snap.docs.map((d) =>
    docData<TeacherSubjectAssignment>(d, (data) => ({
      teacherUid: data.teacherUid,
      teacherName: data.teacherName,
      classId: data.classId,
      className: data.className,
      armId: data.armId,
      armName: data.armName,
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      createdAt: toISO(data.createdAt),
    }))
  );
}

export async function getAcademicSettings(): Promise<AcademicSettings> {
  await ensureAuthReady();
  const snap = await getDoc(doc(db, ACADEMIC_SETTINGS_DOC_PATH));
  if (!snap.exists()) return DEFAULT_ACADEMIC_SETTINGS;
  const data = snap.data();
  return {
    currentSessionId: data.currentSessionId ?? null,
    currentSessionName: data.currentSessionName ?? null,
    currentTermId: data.currentTermId ?? null,
    currentTermName: data.currentTermName ?? null,
    updatedAt: data.updatedAt ? toISO(data.updatedAt) : null,
    updatedBy: data.updatedBy ?? null,
  };
}

/** Every valid class name currently configured — used to validate the Student form's Class field and bulk-upload rows. */
export async function listClassNames(): Promise<string[]> {
  const classes = await listSchoolClasses();
  return classes.map((c) => c.name);
}

/** Every valid arm name for a given class name — used to validate the Student form's Arm field and bulk-upload rows. Looks the class up by name since Student records store the class name, not its id. */
export async function listArmNamesForClassName(className: string): Promise<string[]> {
  const classes = await listSchoolClasses();
  const match = classes.find((c) => c.name === className);
  if (!match) return [];
  const arms = await listClassArms(match.id);
  return arms.map((a) => a.name);
}
