import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { PUSH_TOKENS_COLLECTION } from "@/lib/firebase/notifications";
import { requireApiSession } from "@/lib/server/requireApiSession";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";

export async function POST(request: NextRequest) {
  try {
    const caller = await requireApiSession();
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    if (!token) throw new ApiError(400, "Missing push token.");

    await adminDb.collection(PUSH_TOKENS_COLLECTION).doc(caller.uid).set(
      {
        tokens: FieldValue.arrayUnion(token),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
