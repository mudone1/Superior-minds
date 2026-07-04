import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { STUDENTS_COLLECTION } from "@/lib/firebase/students";
import { requireApiStudentManager } from "@/lib/server/requireApiStudentManager";
import { apiErrorResponse, ApiError } from "@/lib/server/apiError";
import { GENDERS } from "@/types";

const guardianSchema = z
  .object({
    name: z.string().trim(),
    phone: z.string().trim(),
    relationship: z.string().trim(),
  })
  .nullable();

const bulkRowSchema = z.object({
  admissionNumber: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  otherNames: z.string().trim().min(1),
  gender: z.enum(GENDERS),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  class: z.string().trim().min(1),
  arm: z.string().trim().min(1),
  state: z.string().trim().min(1),
  lga: z.string().trim().min(1),
  address: z.string().trim().min(1),
  guardian: guardianSchema.optional(),
});

const bulkRequestSchema = z.object({
  rows: z.array(bulkRowSchema).min(1).max(500),
});

/** Firestore batched writes cap at 500 operations; stay comfortably under that per chunk. */
const BATCH_CHUNK_SIZE = 400;

export async function POST(request: NextRequest) {
  try {
    const caller = await requireApiStudentManager();
    const body = await request.json();
    const parsed = bulkRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "The uploaded rows are missing or malformed. Re-check the file and try again.");
    }
    const { rows } = parsed.data;

    // Re-check admission number uniqueness within the batch itself...
    const admissionNumberLowers = rows.map((r) => r.admissionNumber.toLowerCase());
    const duplicateWithinFile = admissionNumberLowers.find(
      (v, i) => admissionNumberLowers.indexOf(v) !== i
    );
    if (duplicateWithinFile) {
      throw new ApiError(
        409,
        `Admission number "${duplicateWithinFile}" appears more than once in this file.`
      );
    }

    // ...and against every existing student record. Firestore `in` queries
    // cap at 30 values, so this is chunked.
    const existingLowers = new Set<string>();
    for (let i = 0; i < admissionNumberLowers.length; i += 30) {
      const chunk = admissionNumberLowers.slice(i, i + 30);
      const snap = await adminDb
        .collection(STUDENTS_COLLECTION)
        .where("admissionNumberLower", "in", chunk)
        .get();
      snap.forEach((doc) => existingLowers.add(doc.data().admissionNumberLower));
    }
    if (existingLowers.size > 0) {
      throw new ApiError(
        409,
        `${existingLowers.size} admission number(s) already exist in the system: ${Array.from(existingLowers).slice(0, 5).join(", ")}${existingLowers.size > 5 ? ", ..." : ""}`
      );
    }

    const now = FieldValue.serverTimestamp();
    let created = 0;

    for (let i = 0; i < rows.length; i += BATCH_CHUNK_SIZE) {
      const chunk = rows.slice(i, i + BATCH_CHUNK_SIZE);
      const batch = adminDb.batch();

      for (const row of chunk) {
        const docRef = adminDb.collection(STUDENTS_COLLECTION).doc();
        batch.set(docRef, {
          passportPhotoURL: null,
          admissionNumber: row.admissionNumber,
          admissionNumberLower: row.admissionNumber.toLowerCase(),
          surname: row.surname,
          otherNames: row.otherNames,
          fullNameLower: `${row.surname} ${row.otherNames}`.trim().toLowerCase(),
          gender: row.gender,
          dateOfBirth: row.dateOfBirth,
          state: row.state,
          lga: row.lga,
          address: row.address,
          bloodGroup: "Unknown",
          genotype: "Unknown",
          medicalNotes: null,
          class: row.class,
          arm: row.arm,
          parentUid: null,
          parentName: null,
          guardian: row.guardian ?? null,
          admissionDate: row.admissionDate,
          status: "active",
          statusNote: null,
          createdAt: now,
          updatedAt: now,
          createdBy: caller.uid,
        });
      }

      await batch.commit();
      created += chunk.length;
    }

    return NextResponse.json({ created });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
