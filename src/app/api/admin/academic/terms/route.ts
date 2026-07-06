import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { ACADEMIC_SESSIONS_COLLECTION, TERMS_COLLECTION } from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function POST(request: NextRequest) {
  try {
    await requireApiAdminCaller();
    const body = await request.json();
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const order = Number(body.order);

    if (!sessionId) throw new ApiError(400, "A session must be selected.");
    if (!name) throw new ApiError(400, "Term name is required, e.g. \"First Term\".");
    if (!Number.isFinite(order) || order < 1) throw new ApiError(400, "Order must be a positive number.");

    const sessionSnap = await adminDb.collection(ACADEMIC_SESSIONS_COLLECTION).doc(sessionId).get();
    if (!sessionSnap.exists) throw new ApiError(400, "That session no longer exists.");

    const existing = await adminDb
      .collection(TERMS_COLLECTION)
      .where("sessionId", "==", sessionId)
      .where("name", "==", name)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new ApiError(409, `"${name}" already exists for this session.`);
    }

    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(TERMS_COLLECTION).add({
      sessionId,
      name,
      order,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
