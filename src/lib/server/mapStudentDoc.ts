import "server-only";
import type { DocumentData } from "firebase-admin/firestore";
import type { Student } from "@/types";

function toISO(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value.toDate() as Date).toISOString();
  }
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

/** Maps a raw Firestore document (Admin SDK, no client-side Timestamp conversion) into the Student type. */
export function mapStudentDoc(id: string, data: DocumentData): Student {
  return {
    id,
    passportPhotoURL: data.passportPhotoURL ?? null,
    admissionNumber: data.admissionNumber ?? "",
    admissionNumberLower: data.admissionNumberLower ?? "",
    surname: data.surname ?? "",
    otherNames: data.otherNames ?? "",
    fullNameLower: data.fullNameLower ?? "",
    gender: data.gender,
    dateOfBirth: data.dateOfBirth ?? "",
    state: data.state ?? "",
    lga: data.lga ?? "",
    address: data.address ?? "",
    bloodGroup: data.bloodGroup ?? "Unknown",
    genotype: data.genotype ?? "Unknown",
    medicalNotes: data.medicalNotes ?? null,
    class: data.class ?? "",
    arm: data.arm ?? "",
    parentUid: data.parentUid ?? null,
    parentName: data.parentName ?? null,
    guardian: data.guardian ?? null,
    admissionDate: data.admissionDate ?? "",
    status: data.status ?? "active",
    statusNote: data.statusNote ?? null,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    createdBy: data.createdBy ?? "",
  };
}
