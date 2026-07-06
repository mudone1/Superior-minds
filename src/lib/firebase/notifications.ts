import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  orderBy,
  limit as fsLimit,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "./config";
import type { AppNotification, SessionUser } from "@/types";

export const NOTIFICATIONS_COLLECTION = "notifications";
export const PUSH_TOKENS_COLLECTION = "pushTokens";

async function ensureAuthReady(): Promise<void> {
  await auth.authStateReady();
}

function toISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

/**
 * Fetches notifications addressed to this user: broadcast-to-all, sent to
 * their role, or sent to them individually. Firestore can't OR across
 * different fields in one query, so this runs up to three queries and
 * merges/dedupes/sorts client-side — same pattern as the existing user
 * search (by-name + by-email merge).
 */
export async function listMyNotifications(user: SessionUser, take = 30): Promise<AppNotification[]> {
  await ensureAuthReady();
  const col = collection(db, NOTIFICATIONS_COLLECTION);

  const [allSnap, roleSnap, userSnap] = await Promise.all([
    getDocs(query(col, where("targetType", "==", "all"), orderBy("createdAt", "desc"), fsLimit(take))),
    getDocs(
      query(
        col,
        where("targetType", "==", "roles"),
        where("targetRoles", "array-contains", user.role),
        orderBy("createdAt", "desc"),
        fsLimit(take)
      )
    ),
    getDocs(
      query(
        col,
        where("targetType", "==", "users"),
        where("targetUids", "array-contains", user.uid),
        orderBy("createdAt", "desc"),
        fsLimit(take)
      )
    ),
  ]);

  const byId = new Map<string, AppNotification>();
  for (const snap of [allSnap, roleSnap, userSnap]) {
    for (const d of snap.docs) {
      const data = d.data();
      byId.set(d.id, {
        id: d.id,
        title: data.title,
        body: data.body,
        category: data.category,
        targetType: data.targetType,
        targetRoles: data.targetRoles ?? [],
        targetUids: data.targetUids ?? [],
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        createdAt: toISO(data.createdAt),
        readBy: data.readBy ?? [],
      });
    }
  }

  return Array.from(byId.values())
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, take);
}

export async function markNotificationRead(notificationId: string, uid: string): Promise<void> {
  await ensureAuthReady();
  await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
    readBy: arrayUnion(uid),
  });
}
