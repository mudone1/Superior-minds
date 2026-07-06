import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { TERMS_COLLECTION, ACADEMIC_SETTINGS_DOC_PATH } from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiAdminCaller();
    const { id } = await params;
    const body = await request.json();

    const docRef = adminDb.collection(TERMS_COLLECTION).doc(id);
    const snap = await docRef.get();
    if (!snap.exists) throw new ApiError(404, "Term not found.");

    const changes: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (typeof body.name === "string" && body.name.trim()) changes.name = body.name.trim();
    if (body.order !== undefined && Number.isFinite(Number(body.order))) changes.order = Number(body.order);
    if ("startDate" in body) changes.startDate = body.startDate || null;
    if ("endDate" in body) changes.endDate = body.endDate || null;

    await docRef.update(changes);

    if (changes.name) {
      const settingsSnap = await adminDb.doc(ACADEMIC_SETTINGS_DOC_PATH).get();
      if (settingsSnap.exists && settingsSnap.data()?.currentTermId === id) {
        await adminDb.doc(ACADEMIC_SETTINGS_DOC_PATH).update({ currentTermName: changes.name });
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
    if (settingsSnap.exists && settingsSnap.data()?.currentTermId === id) {
      throw new ApiError(409, "This is the current term. Set a different term as current before deleting it.");
    }

    await adminDb.collection(TERMS_COLLECTION).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
