import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminMessaging } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { NOTIFICATIONS_COLLECTION, PUSH_TOKENS_COLLECTION } from "@/lib/firebase/notifications";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";
import { NOTIFICATION_CATEGORIES, type NotificationTargetType } from "@/types";
import { ROLES } from "@/types";

/** FCM's multicast send caps at 500 tokens per call. */
const FCM_BATCH_SIZE = 500;

async function resolveTargetUids(
  targetType: NotificationTargetType,
  targetRoles: string[],
  targetUids: string[]
): Promise<string[]> {
  if (targetType === "users") return targetUids;

  if (targetType === "roles") {
    const snap = await adminDb.collection(USERS_COLLECTION).where("role", "in", targetRoles).get();
    return snap.docs.map((d) => d.id);
  }

  // "all"
  const snap = await adminDb.collection(USERS_COLLECTION).where("status", "!=", "suspended").get();
  return snap.docs.map((d) => d.id);
}

export async function POST(request: NextRequest) {
  try {
    const caller = await requireApiAdminCaller();
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const messageBody = typeof body.body === "string" ? body.body.trim() : "";
    const category = body.category;
    const targetType = body.targetType as NotificationTargetType;
    const targetRoles: string[] = Array.isArray(body.targetRoles) ? body.targetRoles : [];
    const targetUids: string[] = Array.isArray(body.targetUids) ? body.targetUids : [];

    if (!title) throw new ApiError(400, "Title is required.");
    if (!messageBody) throw new ApiError(400, "Message body is required.");
    if (!(NOTIFICATION_CATEGORIES as readonly string[]).includes(category)) {
      throw new ApiError(400, "Invalid category.");
    }
    if (!["all", "roles", "users"].includes(targetType)) {
      throw new ApiError(400, "Invalid target type.");
    }
    if (targetType === "roles") {
      if (targetRoles.length === 0) throw new ApiError(400, "Select at least one role.");
      if (!targetRoles.every((r) => (ROLES as readonly string[]).includes(r))) {
        throw new ApiError(400, "Invalid role in target list.");
      }
    }
    if (targetType === "users" && targetUids.length === 0) {
      throw new ApiError(400, "Select at least one recipient.");
    }

    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(NOTIFICATIONS_COLLECTION).add({
      title,
      body: messageBody,
      category,
      targetType,
      targetRoles: targetType === "roles" ? targetRoles : [],
      targetUids: targetType === "users" ? targetUids : [],
      createdBy: caller.uid,
      createdByName: (await adminDb.collection(USERS_COLLECTION).doc(caller.uid).get()).data()?.displayName ?? "Admin",
      createdAt: now,
      readBy: [],
    });

    // Push delivery is best-effort: the in-app inbox (Firestore doc above)
    // is the durable record, so a push failure here never loses the
    // notification — recipients still see it next time they open the app.
    let pushSent = 0;
    let pushFailed = 0;
    try {
      const uids = await resolveTargetUids(targetType, targetRoles, targetUids);
      const tokenDocs = await Promise.all(
        uids.map((uid) => adminDb.collection(PUSH_TOKENS_COLLECTION).doc(uid).get())
      );
      const uidByToken = new Map<string, string>();
      const allTokens: string[] = [];
      for (const snap of tokenDocs) {
        if (!snap.exists) continue;
        const tokens: string[] = snap.data()?.tokens ?? [];
        for (const t of tokens) {
          allTokens.push(t);
          uidByToken.set(t, snap.id);
        }
      }

      for (let i = 0; i < allTokens.length; i += FCM_BATCH_SIZE) {
        const chunk = allTokens.slice(i, i + FCM_BATCH_SIZE);
        const result = await adminMessaging.sendEachForMulticast({
          tokens: chunk,
          notification: { title, body: messageBody },
          webpush: { fcmOptions: { link: "/dashboard/notifications" } },
        });
        pushSent += result.successCount;
        pushFailed += result.failureCount;

        // Prune tokens FCM says are no longer valid, so dead devices don't
        // accumulate forever.
        await Promise.all(
          result.responses.map(async (res, idx) => {
            if (res.success) return;
            const code = res.error?.code;
            if (code === "messaging/invalid-registration-token" || code === "messaging/registration-token-not-registered") {
              const badToken = chunk[idx]!;
              const uid = uidByToken.get(badToken);
              if (uid) {
                await adminDb
                  .collection(PUSH_TOKENS_COLLECTION)
                  .doc(uid)
                  .update({ tokens: FieldValue.arrayRemove(badToken) });
              }
            }
          })
        );
      }
    } catch (pushErr) {
      console.error("[api/admin/notifications] push send failed", pushErr);
    }

    return NextResponse.json({ id: docRef.id, pushSent, pushFailed });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
