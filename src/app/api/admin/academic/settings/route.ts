import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { ACADEMIC_SESSIONS_COLLECTION, TERMS_COLLECTION, ACADEMIC_SETTINGS_DOC_PATH } from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function PATCH(request: NextRequest) {
  try {
    const caller = await requireApiAdminCaller();
    const body = await request.json();

    const changes: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: caller.uid,
    };

    // Changing the current session resets the current term — a term from
    // last session's has no meaning as "current" once the session moves
    // on, and picking one blind could silently point at the wrong year.
    if ("currentSessionId" in body) {
      const sessionId = body.currentSessionId;
      if (sessionId === null) {
        changes.currentSessionId = null;
        changes.currentSessionName = null;
        changes.currentTermId = null;
        changes.currentTermName = null;
      } else {
        const sessionSnap = await adminDb.collection(ACADEMIC_SESSIONS_COLLECTION).doc(sessionId).get();
        if (!sessionSnap.exists) throw new ApiError(400, "That session no longer exists.");
        changes.currentSessionId = sessionId;
        changes.currentSessionName = sessionSnap.data()?.name;
        changes.currentTermId = null;
        changes.currentTermName = null;
      }
    }

    if ("currentTermId" in body) {
      const termId = body.currentTermId;
      if (termId === null) {
        changes.currentTermId = null;
        changes.currentTermName = null;
      } else {
        const termSnap = await adminDb.collection(TERMS_COLLECTION).doc(termId).get();
        if (!termSnap.exists) throw new ApiError(400, "That term no longer exists.");

        const settingsSnap = await adminDb.doc(ACADEMIC_SETTINGS_DOC_PATH).get();
        const effectiveSessionId = changes.currentSessionId ?? settingsSnap.data()?.currentSessionId;
        if (termSnap.data()?.sessionId !== effectiveSessionId) {
          throw new ApiError(400, "That term doesn't belong to the current session.");
        }
        changes.currentTermId = termId;
        changes.currentTermName = termSnap.data()?.name;
      }
    }

    await adminDb.doc(ACADEMIC_SETTINGS_DOC_PATH).set(changes, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
