import {
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  getCountFromServer,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
  Timestamp,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db, auth } from "./config";
import type { Student, StudentStatus } from "@/types";

export const STUDENTS_COLLECTION = "students";
export const STUDENTS_PAGE_SIZE = 10;

type Cursor = QueryDocumentSnapshot<DocumentData> | null;

export interface ListStudentsParams {
  classLevel?: string | "all";
  arm?: string | "all";
  status?: StudentStatus | "all";
  /** Matched as a case-insensitive prefix against full name or admission number. */
  search?: string;
  pageSize?: number;
  cursor?: Cursor;
}

export interface ListStudentsResult {
  students: Student[];
  lastDoc: Cursor;
  hasMore: boolean;
}

/** Same auth-restoration race guard as users.ts — see there for why this matters. */
async function ensureAuthReady(): Promise<void> {
  await auth.authStateReady();
}

function toISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function docToStudent(docSnap: DocumentSnapshot<DocumentData>): Student {
  const data = docSnap.data();
  if (!data) throw new Error(`Student document ${docSnap.id} has no data`);
  return {
    id: docSnap.id,
    passportPhotoURL: data.passportPhotoURL ?? null,
    admissionNumber: data.admissionNumber ?? "",
    admissionNumberLower: data.admissionNumberLower ?? (data.admissionNumber ?? "").toLowerCase(),
    surname: data.surname ?? "",
    otherNames: data.otherNames ?? "",
    fullNameLower: data.fullNameLower ?? "",
    gender: data.gender,
    dateOfBirth: data.dateOfBirth ?? "",
    state: data.state ?? "",
    lga: data.lga ?? "",
    address: data.address ?? "",
    bloodGroup: data.bloodGroup ?? "Unknown",
    genotype: data.genotype ?? "Unknown",
    medicalNotes: data.medicalNotes ?? null,
    class: data.class ?? "",
    arm: data.arm ?? "",
    parentUid: data.parentUid ?? null,
    parentName: data.parentName ?? null,
    guardian: data.guardian ?? null,
    admissionDate: data.admissionDate ?? "",
    status: data.status ?? "active",
    statusNote: data.statusNote ?? null,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    createdBy: data.createdBy ?? "",
  };
}

export async function listStudents(params: ListStudentsParams): Promise<ListStudentsResult> {
  await ensureAuthReady();
  const pageSize = params.pageSize ?? STUDENTS_PAGE_SIZE;
  const term = params.search?.trim().toLowerCase();

  const baseFilters: QueryConstraint[] = [];
  if (params.classLevel && params.classLevel !== "all") {
    baseFilters.push(where("class", "==", params.classLevel));
  }
  if (params.arm && params.arm !== "all") {
    baseFilters.push(where("arm", "==", params.arm));
  }
  if (params.status && params.status !== "all") {
    baseFilters.push(where("status", "==", params.status));
  }

  if (term) {
    const [byName, byAdmissionNo] = await Promise.all([
      runPrefixQuery("fullNameLower", term, baseFilters, pageSize),
      runPrefixQuery("admissionNumberLower", term, baseFilters, pageSize),
    ]);
    const merged = new Map<string, Student>();
    for (const s of [...byName, ...byAdmissionNo]) merged.set(s.id, s);
    return { students: Array.from(merged.values()).slice(0, pageSize), lastDoc: null, hasMore: false };
  }

  const constraints: QueryConstraint[] = [...baseFilters, orderBy("createdAt", "desc")];
  if (params.cursor) constraints.push(startAfter(params.cursor));
  constraints.push(limit(pageSize + 1));

  const snap = await getDocs(query(collection(db, STUDENTS_COLLECTION), ...constraints));
  const docs = snap.docs.slice(0, pageSize);
  const hasMore = snap.docs.length > pageSize;

  return {
    students: docs.map(docToStudent),
    lastDoc: docs.length > 0 ? (docs[docs.length - 1] ?? null) : null,
    hasMore,
  };
}

async function runPrefixQuery(
  field: "fullNameLower" | "admissionNumberLower",
  term: string,
  baseFilters: QueryConstraint[],
  pageSize: number
): Promise<Student[]> {
  const constraints: QueryConstraint[] = [
    ...baseFilters,
    orderBy(field),
    startAt(term),
    endAt(term + "\uf8ff"),
    limit(pageSize),
  ];
  const snap = await getDocs(query(collection(db, STUDENTS_COLLECTION), ...constraints));
  return snap.docs.map(docToStudent);
}

export async function countStudents(
  params: Pick<ListStudentsParams, "classLevel" | "arm" | "status">
): Promise<number> {
  await ensureAuthReady();
  const constraints: QueryConstraint[] = [];
  if (params.classLevel && params.classLevel !== "all") {
    constraints.push(where("class", "==", params.classLevel));
  }
  if (params.arm && params.arm !== "all") {
    constraints.push(where("arm", "==", params.arm));
  }
  if (params.status && params.status !== "all") {
    constraints.push(where("status", "==", params.status));
  }
  const snap = await getCountFromServer(query(collection(db, STUDENTS_COLLECTION), ...constraints));
  return snap.data().count;
}

export async function getStudent(id: string): Promise<Student | null> {
  await ensureAuthReady();
  const snap = await getDoc(doc(db, STUDENTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return docToStudent(snap);
}
