import { z } from "zod";
import { GENDERS, BLOOD_GROUPS, GENOTYPES } from "@/types";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

const guardianSchema = z
  .object({
    name: z.string().trim().min(2, "Guardian name is required"),
    phone: z.string().trim().min(7, "Enter a valid phone number"),
    relationship: z.string().trim().min(2, "Relationship is required"),
  })
  .nullable()
  .optional();

export const studentSchema = z.object({
  surname: z.string().trim().min(2, "Surname is required"),
  otherNames: z.string().trim().min(2, "Other names are required"),
  gender: z.enum(GENDERS, { errorMap: () => ({ message: "Choose a gender" }) }),
  dateOfBirth: dateSchema,
  state: z.string().trim().min(2, "State is required"),
  lga: z.string().trim().min(2, "LGA is required"),
  address: z.string().trim().min(5, "Address is required"),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  genotype: z.enum(GENOTYPES).optional(),
  medicalNotes: z.string().trim().optional(),
  class: z.string().trim().min(1, "Class is required"),
  arm: z.string().trim().min(1, "Arm is required"),
  parentUid: z.string().trim().optional().nullable(),
  guardian: guardianSchema,
  admissionDate: dateSchema,
});

export type StudentFormValues = z.infer<typeof studentSchema>;

/** Edit mode never touches admissionNumber — it's permanent once a record exists — and adds the photo URL, which is set via a separate upload step rather than typed in by hand. */
export const editStudentSchema = studentSchema.extend({
  passportPhotoURL: z.string().url().nullable().optional(),
});
export type EditStudentFormValues = z.infer<typeof editStudentSchema>;

export const promoteStudentSchema = z.object({
  class: z.string().trim().min(1, "Choose the class to promote into"),
  arm: z.string().trim().min(1, "Arm is required"),
});

export const transferStudentSchema = z.object({
  note: z.string().trim().min(3, "Add a short note (e.g. destination school)"),
});
