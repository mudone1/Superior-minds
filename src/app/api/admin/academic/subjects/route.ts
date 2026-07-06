import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { SUBJECTS_COLLECTION } from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function POST(request: NextRequest) {
  try {
    await requireApiAdminCaller();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : null;

    if (!name) throw new ApiError(400, "Subject name is required, e.g. \"Mathematics\".");

    const existing = await adminDb
      .collection(SUBJECTS_COLLECTION)
      .where("name", "==", name)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new ApiError(409, `A subject named "${name}" already exists.`);
    }

    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(SUBJECTS_COLLECTION).add({
      name,
      code: code || null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
