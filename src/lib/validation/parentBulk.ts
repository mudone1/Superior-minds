import type { TemplateSheet } from "@/lib/excel/workbook";

export const PARENT_BULK_COLUMNS = ["Full Name", "Email", "Phone", "Temporary Password"] as const;

export type ParentBulkColumn = (typeof PARENT_BULK_COLUMNS)[number];

const REQUIRED_COLUMNS: ParentBulkColumn[] = ["Full Name", "Email"];

export interface ParentBulkRow {
  displayName: string;
  email: string;
  phone: string;
  /** Blank in the sheet means "generate one" — filled in by the caller, not here. */
  temporaryPassword: string;
}

export interface ParentBulkRowError {
  row: number;
  errors: string[];
}

export interface ParentBulkValidationResult {
  validRows: ParentBulkRow[];
  rowErrors: ParentBulkRowError[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\-.\s]{7,20}$/;

/**
 * Validates parsed spreadsheet rows for bulk Parent account creation.
 * Email uniqueness against existing accounts can only be confirmed when
 * each account is actually created (see BulkParentUploadModal), so this
 * pass only catches duplicates within the file itself plus obvious
 * formatting problems.
 */
export function validateParentBulkRows(
  rawRows: Record<string, string>[],
  generatePassword: () => string
): ParentBulkValidationResult {
  const validRows: ParentBulkRow[] = [];
  const rowErrors: ParentBulkRowError[] = [];
  const seenEmails = new Set<string>();

  rawRows.forEach((raw, index) => {
    const excelRow = index + 2;
    const errors: string[] = [];

    for (const col of REQUIRED_COLUMNS) {
      if (!raw[col]) errors.push(`${col} is required`);
    }

    const email = raw["Email"]?.trim().toLowerCase() ?? "";
    if (email) {
      if (!EMAIL_RE.test(email)) {
        errors.push(`Email "${raw["Email"]}" doesn't look like a valid email address`);
      } else if (seenEmails.has(email)) {
        errors.push(`Email "${email}" is duplicated elsewhere in this file`);
      }
      seenEmails.add(email);
    }

    const phone = raw["Phone"]?.trim() ?? "";
    if (phone && !PHONE_RE.test(phone)) {
      errors.push(`Phone "${phone}" doesn't look like a valid phone number`);
    }

    const temporaryPassword = raw["Temporary Password"]?.trim() ?? "";
    if (temporaryPassword && temporaryPassword.length < 8) {
      errors.push("Temporary Password must be at least 8 characters (or leave blank to auto-generate)");
    }

    if (errors.length > 0) {
      rowErrors.push({ row: excelRow, errors });
      return;
    }

    validRows.push({
      displayName: (raw["Full Name"] ?? "").trim(),
      email,
      phone,
      temporaryPassword: temporaryPassword || generatePassword(),
    });
  });

  return { validRows, rowErrors };
}

/** Builds the downloadable .xlsx template for bulk Parent account creation. */
export function buildParentBulkTemplate(): TemplateSheet[] {
  const templateSheet: TemplateSheet = {
    name: "Template",
    rows: [
      [...PARENT_BULK_COLUMNS],
      ["Ngozi Okafor", "ngozi.okafor@example.com", "08012345678", ""],
    ],
    columnWidths: [22, 30, 16, 20],
  };

  const instructionsSheet: TemplateSheet = {
    name: "Instructions",
    rows: [
      ["Superior Minds Academy — Bulk Parent Upload Instructions"],
      [""],
      ["Column", "Required?", "Notes"],
      ["Full Name", "Yes", ""],
      ["Email", "Yes", "Must be unique — this becomes the parent's login email"],
      ["Phone", "No", ""],
      [
        "Temporary Password",
        "No",
        "Leave blank to auto-generate one. If set, must be at least 8 characters. Share it with the parent — they should change it after first login.",
      ],
      [""],
      ["Every row creates a Parent-role account that can sign in immediately."],
      ["Do not change the column headers on the Template sheet — rows are matched by header name."],
      ["Linking a parent to their child's student record is a separate step, done from that student's profile after import."],
    ],
    columnWidths: [22, 12, 70],
  };

  return [templateSheet, instructionsSheet];
}
