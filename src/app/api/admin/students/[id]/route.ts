import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { STUDENTS_COLLECTION } from "@/lib/firebase/students";
import { requireApiStudentManager } from "@/lib/server/requireApiStudentManager";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";
import { editStudentSchema } from "@/lib/validation/student";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireApiStudentManager();
    const { id } = await params;
    const body = await request.json();
    const parsed = editStudentSchema.partial().safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid student details.");
    }
    const input = parsed.data;

    const studentRef = adminDb.collection(STUDENTS_COLLECTION).doc(id);
    const studentSnap = await studentRef.get();
    if (!studentSnap.exists) {
      throw new ApiError(404, "No such student.");
    }

    const changes: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

    if (input.surname !== undefined) changes.surname = input.surname;
    if (input.otherNames !== undefined) changes.otherNames = input.otherNames;
    if (input.surname !== undefined || input.otherNames !== undefined) {
      const current = studentSnap.data() ?? {};
      const surname = input.surname ?? current.surname ?? "";
      const otherNames = input.otherNames ?? current.otherNames ?? "";
      changes.fullNameLower = `${surname} ${otherNames}`.trim().toLowerCase();
    }
    if (input.gender !== undefined) changes.gender = input.gender;
    if (input.dateOfBirth !== undefined) changes.dateOfBirth = input.dateOfBirth;
    if (input.state !== undefined) changes.state = input.state;
    if (input.lga !== undefined) changes.lga = input.lga;
    if (input.address !== undefined) changes.address = input.address;
    if (input.bloodGroup !== undefined) changes.bloodGroup = input.bloodGroup;
    if (input.genotype !== undefined) changes.genotype = input.genotype;
    if (input.medicalNotes !== undefined) changes.medicalNotes = input.medicalNotes || null;
    if (input.class !== undefined) changes.class = input.class;
    if (input.arm !== undefined) changes.arm = input.arm;
    if (input.guardian !== undefined) changes.guardian = input.guardian || null;
    if (input.passportPhotoURL !== undefined) changes.passportPhotoURL = input.passportPhotoURL;

    if (input.parentUid !== undefined) {
      if (input.parentUid) {
        const parentSnap = await adminDb.collection(USERS_COLLECTION).doc(input.parentUid).get();
        if (!parentSnap.exists) {
          throw new ApiError(400, "The selected parent account no longer exists.");
        }
        changes.parentUid = input.parentUid;
        changes.parentName = parentSnap.data()?.displayName ?? null;
      } else {
        changes.parentUid = null;
        changes.parentName = null;
      }
    }

    await studentRef.update(changes);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
