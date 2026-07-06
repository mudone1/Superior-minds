import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { CLASSES_COLLECTION } from "@/lib/firebase/academic";
import { requireApiAdminCaller } from "@/lib/server/requireApiAdmin";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function POST(request: NextRequest) {
  try {
    await requireApiAdminCaller();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const order = Number(body.order);

    if (!name) throw new ApiError(400, "Class name is required, e.g. \"Primary 4\".");
    if (!Number.isFinite(order)) throw new ApiError(400, "Order must be a number.");

    const existing = await adminDb
      .collection(CLASSES_COLLECTION)
      .where("name", "==", name)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new ApiError(409, `A class named "${name}" already exists.`);
    }

    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(CLASSES_COLLECTION).add({
      name,
      order,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
