import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { USERS_COLLECTION } from "@/lib/firebase/firestore";
import { STUDENTS_COLLECTION } from "@/lib/firebase/students";
import { requireApiStudentManager } from "@/lib/server/requireApiStudentManager";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";
import { studentSchema } from "@/lib/validation/student";

export async function POST(request: NextRequest) {
  try {
    const caller = await requireApiStudentManager();
    const body = await request.json();
    const parsed = studentSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid student details.");
    }
    const input = parsed.data;

    const admissionNumberLower = input.admissionNumber.toLowerCase();
    const existing = await adminDb
      .collection(STUDENTS_COLLECTION)
      .where("admissionNumberLower", "==", admissionNumberLower)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new ApiError(409, `Admission number "${input.admissionNumber}" is already in use.`);
    }

    let parentName: string | null = null;
    if (input.parentUid) {
      const parentSnap = await adminDb.collection(USERS_COLLECTION).doc(input.parentUid).get();
      if (!parentSnap.exists) {
        throw new ApiError(400, "The selected parent account no longer exists.");
      }
      parentName = parentSnap.data()?.displayName ?? null;
    }

    const now = FieldValue.serverTimestamp();
    const fullNameLower = `${input.surname} ${input.otherNames}`.trim().toLowerCase();

    const docRef = await adminDb.collection(STUDENTS_COLLECTION).add({
      passportPhotoURL: null,
      admissionNumber: input.admissionNumber,
      admissionNumberLower,
      surname: input.surname,
      otherNames: input.otherNames,
      fullNameLower,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      state: input.state,
      lga: input.lga,
      address: input.address,
      bloodGroup: input.bloodGroup,
      genotype: input.genotype,
      medicalNotes: input.medicalNotes || null,
      class: input.class,
      arm: input.arm,
      parentUid: input.parentUid || null,
      parentName,
      guardian: input.guardian || null,
      admissionDate: input.admissionDate,
      status: "active",
      statusNote: null,
      createdAt: now,
      updatedAt: now,
      createdBy: caller.uid,
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
