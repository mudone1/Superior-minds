import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { ACADEMIC_SESSIONS_COLLECTION, TERMS_COLLECTION, ACADEMIC_SETTINGS_DOC_PATH } from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdminCaller();
    const { id } = await params;
    const body = await request.json();

    const docRef = adminDb.collection(ACADEMIC_SESSIONS_COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) throw new ApiError(404, "Session not found.");

    const changes: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (typeof body.name === "string" && body.name.trim()) changes.name = body.name.trim();
    if ("startDate" in body) changes.startDate = body.startDate || null;
    if ("endDate" in body) changes.endDate = body.endDate || null;

    await docRef.update(changes);

    // Keep the denormalized name on the current-session pointer in sync,
    // if this session happens to be the one currently active.
    if (changes.name) {
      const settingsSnap = await adminDb.doc(ACADEMIC_SETTINGS_DOC_PATH).get();
      if (settingsSnap.exists && settingsSnap.data()?.currentSessionId === id) {
        await adminDb.doc(ACADEMIC_SETTINGS_DOC_PATH).update({ currentSessionName: changes.name });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdminCaller();
    const { id } = await params;

    const settingsSnap = await adminDb.doc(ACADEMIC_SETTINGS_DOC_PATH).get();
    if (settingsSnap.exists && settingsSnap.data()?.currentSessionId === id) {
      throw new ApiError(
        409,
        "This is the current session. Set a different session as current before deleting it."
      );
    }

    const termsSnap = await adminDb
      .collection(TERMS_COLLECTION)
      .where("sessionId", "==", id)
      .limit(1)
      .get();
    if (!termsSnap.empty) {
      throw new ApiError(409, "Delete this session's terms first.");
    }

    await adminDb.collection(ACADEMIC_SESSIONS_COLLECTION).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
