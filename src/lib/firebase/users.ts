import {
  collection,
  endAt,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
  getDocs,
  getCountFromServer,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "./config";
import { USERS_COLLECTION } from "./firestore";
import type { AccountStatus, AppUser, UserRole } from "@/types";

/**
 * The page itself is authorized server-side via the session cookie (Admin
 * SDK, bypasses rules entirely). But these Firestore reads run in the
 * browser through the client SDK, which enforces security rules against
 * `request.auth` — populated only once the client SDK has restored its
 * persisted session. On a hard refresh that restoration is asynchronous,
 * so a query fired immediately on mount can race ahead of it and get
 * denied even though the user is genuinely signed in. Every exported
 * query function below waits for this first.
 */
async function ensureAuthReady(): Promise<void> {
  await auth.authStateReady();
}

export const USERS_PAGE_SIZE = 10;

export interface ListUsersParams {
  role?: UserRole | "all";
  status?: AccountStatus | "all";
  /** Matched as a case-insensitive prefix against name or email. */
  search?: string;
  pageSize?: number;
  /** Pass the last row's snapshot from the previous page to continue forward. */
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}

export interface ListUsersResult {
  users: AppUser[];
  /** Snapshot of the last doc in this page — feed back in as `cursor` for the next page. */
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

function toISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function docToAppUser(docSnap: QueryDocumentSnapshot<DocumentData>): AppUser {
  const data = docSnap.data();
  return {
    uid: docSnap.id,
    email: data.email ?? "",
    emailLower: data.emailLower ?? (data.email ?? "").toLowerCase(),
    displayName: data.displayName ?? "",
    displayNameLower: data.displayNameLower ?? (data.displayName ?? "").toLowerCase(),
    role: data.role,
    status: data.status ?? "active",
    photoURL: data.photoURL ?? null,
    phone: data.phone ?? null,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    createdBy: data.createdBy ?? null,
    lastLoginAt: data.lastLoginAt ? toISO(data.lastLoginAt) : null,
  };
}

/**
 * Lists users with optional role/status filters, an optional name-or-email
 * prefix search, and cursor-based pagination. Firestore can't OR across
 * two different fields in one query, so a search term runs two prefix
 * queries (one against `displayNameLower`, one against `emailLower`) and
 * merges the results — fine at school-directory scale.
 */
export async function listUsers(params: ListUsersParams): Promise<ListUsersResult> {
  await ensureAuthReady();
  const pageSize = params.pageSize ?? USERS_PAGE_SIZE;
  const term = params.search?.trim().toLowerCase();

  if (term) {
    const [byName, byEmail] = await Promise.all([
      runPrefixQuery("displayNameLower", term, params, pageSize),
      runPrefixQuery("emailLower", term, params, pageSize),
    ]);
    const merged = new Map<string, AppUser>();
    for (const u of [...byName, ...byEmail]) merged.set(u.uid, u);
    const users = Array.from(merged.values()).slice(0, pageSize);
    return { users, lastDoc: null, hasMore: false }; // Search results aren't paginated — narrow the term instead.
  }

  const constraints: QueryConstraint[] = [];
  if (params.role && params.role !== "all") constraints.push(where("role", "==", params.role));
  if (params.status && params.status !== "all") {
    constraints.push(where("status", "==", params.status));
  }
  constraints.push(orderBy("createdAt", "desc"));
  if (params.cursor) constraints.push(startAfter(params.cursor));
  constraints.push(limit(pageSize + 1));

  const snap = await getDocs(query(collection(db, USERS_COLLECTION), ...constraints));
  const docs = snap.docs.slice(0, pageSize);
  const hasMore = snap.docs.length > pageSize;

  return {
    users: docs.map(docToAppUser),
    lastDoc: docs.length > 0 ? (docs[docs.length - 1] ?? null) : null,
    hasMore,
  };
}

async function runPrefixQuery(
  field: "displayNameLower" | "emailLower",
  term: string,
  params: ListUsersParams,
  pageSize: number
): Promise<AppUser[]> {
  const constraints: QueryConstraint[] = [];
  if (params.role && params.role !== "all") constraints.push(where("role", "==", params.role));
  if (params.status && params.status !== "all") {
    constraints.push(where("status", "==", params.status));
  }
  constraints.push(orderBy(field));
  constraints.push(startAt(term));
  constraints.push(endAt(term + "\uf8ff"));
  constraints.push(limit(pageSize));

  const snap = await getDocs(query(collection(db, USERS_COLLECTION), ...constraints));
  return snap.docs.map(docToAppUser);
}

/** Total count for the current role/status filter — used for the "X users" summary line. Ignores search (Firestore count doesn't support the merged OR query above). */
export async function countUsers(params: Pick<ListUsersParams, "role" | "status">): Promise<number> {
  await ensureAuthReady();
  const constraints: QueryConstraint[] = [];
  if (params.role && params.role !== "all") constraints.push(where("role", "==", params.role));
  if (params.status && params.status !== "all") {
    constraints.push(where("status", "==", params.status));
  }
  const snap = await getCountFromServer(query(collection(db, USERS_COLLECTION), ...constraints));
  return snap.data().count;
}
