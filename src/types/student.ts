export const GENDERS = ["Male", "Female"] as const;
export type Gender = (typeof GENDERS)[number];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const GENOTYPES = ["AA", "AS", "SS", "AC", "SC", "Unknown"] as const;
export type Genotype = (typeof GENOTYPES)[number];

export const STUDENT_STATUSES = ["active", "promoted", "transferred", "graduated", "archived"] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Active",
  promoted: "Promoted",
  transferred: "Transferred",
  graduated: "Graduated",
  archived: "Archived",
};

/**
 * A guardian is a caregiver who isn't necessarily a registered parent
 * account — grandparent, aunt, family friend, etc. Kept as a plain
 * embedded object rather than a user reference since they may never need
 * to log in.
 */
export interface Guardian {
  name: string;
  phone: string;
  relationship: string;
}

/** Shape of a document in the top-level `students` Firestore collection. */
export interface Student {
  id: string;
  passportPhotoURL?: string | null;
  admissionNumber: string;
  /** Lowercased mirror of `admissionNumber`, maintained server-side, used for prefix search. */
  admissionNumberLower: string;
  surname: string;
  otherNames: string;
  /** Lowercased mirror of `${surname} ${otherNames}`, maintained server-side, used for prefix search. */
  fullNameLower: string;
  gender: Gender;
  dateOfBirth: string; // ISO date (yyyy-mm-dd)
  state: string;
  lga: string;
  address: string;
  bloodGroup: BloodGroup;
  genotype: Genotype;
  medicalNotes?: string | null;
  class: string;
  arm: string;
  /** uid of the linked Parent-role account, if the family has one. */
  parentUid?: string | null;
  parentName?: string | null;
  guardian?: Guardian | null;
  admissionDate: string; // ISO date (yyyy-mm-dd)
  status: StudentStatus;
  /** Free-text note attached the last time status changed via transfer/archive/promote, e.g. destination school. */
  statusNote?: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  createdBy: string; // uid of the admin/staff member who added this record
}

/** Payload for creating a new student record. The admission number is generated server-side. */
export interface CreateStudentInput {
  surname: string;
  otherNames: string;
  gender: Gender;
  dateOfBirth: string;
  state: string;
  lga: string;
  address: string;
  bloodGroup?: BloodGroup;
  genotype?: Genotype;
  medicalNotes?: string;
  class: string;
  arm: string;
  parentUid?: string | null;
  guardian?: Guardian | null;
  admissionDate: string;
}

/** Payload for editing an existing student's profile fields (not status — that goes through promote/transfer/archive). */
export interface UpdateStudentInput {
  surname?: string;
  otherNames?: string;
  gender?: Gender;
  dateOfBirth?: string;
  state?: string;
  lga?: string;
  address?: string;
  bloodGroup?: BloodGroup;
  genotype?: Genotype;
  medicalNotes?: string | null;
  class?: string;
  arm?: string;
  parentUid?: string | null;
  guardian?: Guardian | null;
  passportPhotoURL?: string | null;
}
