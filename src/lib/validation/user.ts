import { z } from "zod";
import { ROLES } from "@/types";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+()\-.\s]{7,20}$/, "Enter a valid phone number")
  .or(z.literal(""));

export const createUserSchema = z.object({
  displayName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: phoneSchema.optional(),
  role: z.enum(ROLES, { errorMap: () => ({ message: "Choose a role" }) }),
  temporaryPassword: z
    .string()
    .min(8, "Temporary password must be at least 8 characters"),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  displayName: z.string().trim().min(2, "Full name is required"),
  phone: phoneSchema.optional(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

/** Generates a readable random temporary password to prefill the Add User form — the admin can edit it before submitting. */
export function suggestTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)] ?? "";
  }
  return out;
}
