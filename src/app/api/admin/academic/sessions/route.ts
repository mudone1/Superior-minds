import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { ACADEMIC_SESSIONS_COLLECTION } from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function POST(request: NextRequest) {
  try {
    await requireApiAdminCaller();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) throw new ApiError(400, "Session name is required, e.g. \"2025/2026\".");

    const existing = await adminDb
      .collection(ACADEMIC_SESSIONS_COLLECTION)
      .where("name", "==", name)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new ApiError(409, `A session named "${name}" already exists.`);
    }

    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(ACADEMIC_SESSIONS_COLLECTION).add({
      name,
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
