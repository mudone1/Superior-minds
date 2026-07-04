import { GENDERS, type Gender } from "@/types";
import { CLASS_LEVELS } from "@/lib/data/classLevels";
import { NIGERIAN_STATES, getLgasForState } from "@/lib/data/nigeria";
import type { TemplateSheet } from "@/lib/excel/workbook";

/**
 * The exact column order for the bulk student upload template. Order
 * matters only for the human filling in the sheet — parsing itself is
 * done by header name, not position, so a reordered or partially-filled
 * copy of the template still imports correctly.
 */
export const STUDENT_BULK_COLUMNS = [
  "Admission Number",
  "Surname",
  "Other Names",
  "Gender",
  "Date of Birth",
  "Admission Date",
  "Class",
  "Arm",
  "State",
  "LGA",
  "Address",
  "Guardian Name",
  "Guardian Phone",
  "Guardian Relationship",
] as const;

export type StudentBulkColumn = (typeof STUDENT_BULK_COLUMNS)[number];

const REQUIRED_COLUMNS: StudentBulkColumn[] = [
  "Admission Number",
  "Surname",
  "Other Names",
  "Gender",
  "Date of Birth",
  "Admission Date",
  "Class",
  "Arm",
  "State",
  "LGA",
  "Address",
];

export interface StudentBulkRow {
  admissionNumber: string;
  surname: string;
  otherNames: string;
  gender: Gender;
  dateOfBirth: string;
  admissionDate: string;
  class: string;
  arm: string;
  state: string;
  lga: string;
  address: string;
  guardian: { name: string; phone: string; relationship: string } | null;
}

export interface StudentBulkRowError {
  /** 1-based row number as it appears in Excel (header is row 1, so first data row is row 2). */
  row: number;
  errors: string[];
}

export interface StudentBulkValidationResult {
  validRows: StudentBulkRow[];
  rowErrors: StudentBulkRowError[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Accepts "2024-09-01", "01/09/2024", "1-Sep-2024", or an Excel-parsed Date object stringified — normalizes to yyyy-mm-dd, or returns null if unparseable. */
function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  if (DATE_RE.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

/**
 * Validates parsed spreadsheet rows against the student data model. Runs
 * entirely client-side for instant feedback; the API route re-validates
 * everything again server-side before writing anything to Firestore, so
 * this pass is about a fast, friendly error report — not the security
 * boundary.
 */
export function validateStudentBulkRows(
  rawRows: Record<string, string>[]
): StudentBulkValidationResult {
  const validRows: StudentBulkRow[] = [];
  const rowErrors: StudentBulkRowError[] = [];
  const seenAdmissionNumbers = new Set<string>();

  rawRows.forEach((raw, index) => {
    const excelRow = index + 2; // +1 for header, +1 for 1-based indexing
    const errors: string[] = [];

    for (const col of REQUIRED_COLUMNS) {
      if (!raw[col]) errors.push(`${col} is required`);
    }

    const admissionNumber = raw["Admission Number"]?.trim() ?? "";
    if (admissionNumber) {
      const lower = admissionNumber.toLowerCase();
      if (seenAdmissionNumbers.has(lower)) {
        errors.push(`Admission Number "${admissionNumber}" is duplicated elsewhere in this file`);
      }
      seenAdmissionNumbers.add(lower);
    }

    const gender = raw["Gender"]?.trim();
    if (gender && !(GENDERS as readonly string[]).includes(gender)) {
      errors.push(`Gender must be exactly "Male" or "Female" (got "${gender}")`);
    }

    const dateOfBirth = raw["Date of Birth"] ? normalizeDate(raw["Date of Birth"]) : null;
    if (raw["Date of Birth"] && !dateOfBirth) {
      errors.push(`Date of Birth "${raw["Date of Birth"]}" isn't a recognizable date`);
    }

    const admissionDate = raw["Admission Date"] ? normalizeDate(raw["Admission Date"]) : null;
    if (raw["Admission Date"] && !admissionDate) {
      errors.push(`Admission Date "${raw["Admission Date"]}" isn't a recognizable date`);
    }

    const classValue = raw["Class"]?.trim();
    if (classValue && !CLASS_LEVELS.includes(classValue)) {
      errors.push(`Class "${classValue}" isn't a recognized class (see the Instructions sheet)`);
    }

    const stateValue = raw["State"]?.trim();
    const stateExists = stateValue ? NIGERIAN_STATES.some((s) => s.name === stateValue) : false;
    if (stateValue && !stateExists) {
      errors.push(`State "${stateValue}" isn't a recognized Nigerian state`);
    }

    const lgaValue = raw["LGA"]?.trim();
    if (lgaValue && stateExists && !getLgasForState(stateValue ?? "").includes(lgaValue)) {
      errors.push(`LGA "${lgaValue}" doesn't belong to ${stateValue}`);
    }

    const guardianName = raw["Guardian Name"]?.trim() ?? "";
    const guardianPhone = raw["Guardian Phone"]?.trim() ?? "";
    const guardianRelationship = raw["Guardian Relationship"]?.trim() ?? "";
    const guardian = guardianName
      ? { name: guardianName, phone: guardianPhone, relationship: guardianRelationship }
      : null;

    if (errors.length > 0) {
      rowErrors.push({ row: excelRow, errors });
      return;
    }

    validRows.push({
      admissionNumber,
      surname: (raw["Surname"] ?? "").trim(),
      otherNames: (raw["Other Names"] ?? "").trim(),
      gender: gender as Gender,
      dateOfBirth: dateOfBirth!,
      admissionDate: admissionDate!,
      class: classValue!,
      arm: (raw["Arm"] ?? "").trim(),
      state: stateValue!,
      lga: lgaValue!,
      address: (raw["Address"] ?? "").trim(),
      guardian,
    });
  });

  return { validRows, rowErrors };
}

/** Builds the downloadable .xlsx template: a filled-in example row plus an Instructions sheet listing valid values. */
export function buildStudentBulkTemplate(): TemplateSheet[] {
  const templateSheet: TemplateSheet = {
    name: "Template",
    rows: [
      [...STUDENT_BULK_COLUMNS],
      [
        "SMA/24N045",
        "Okafor",
        "Chidinma",
        "Female",
        "2015-03-12",
        "2024-09-09",
        "Primary 4",
        "Gold",
        "Lagos",
        "Ikeja",
        "12 Adeola Street, Ikeja, Lagos",
        "Ngozi Okafor",
        "08012345678",
        "Mother",
      ],
    ],
    columnWidths: [16, 14, 14, 10, 14, 14, 12, 10, 12, 16, 30, 16, 16, 18],
  };

  const instructionsSheet: TemplateSheet = {
    name: "Instructions",
    rows: [
      ["Superior Minds Academy — Bulk Student Upload Instructions"],
      [""],
      ["Column", "Required?", "Notes"],
      [
        "Admission Number",
        "Yes",
        "Must be unique. Not auto-generated for bulk uploads — enter the number you already use for this student.",
      ],
      ["Surname", "Yes", ""],
      ["Other Names", "Yes", ""],
      ["Gender", "Yes", 'Exactly "Male" or "Female"'],
      ["Date of Birth", "Yes", "Format: YYYY-MM-DD (e.g. 2015-03-12)"],
      ["Admission Date", "Yes", "Format: YYYY-MM-DD (e.g. 2024-09-09)"],
      ["Class", "Yes", `One of: ${CLASS_LEVELS.join(", ")}`],
      ["Arm", "Yes", "e.g. A, Gold, Diamond"],
      ["State", "Yes", "Full Nigerian state name, e.g. Lagos"],
      ["LGA", "Yes", "Must belong to the State entered"],
      ["Address", "Yes", ""],
      ["Guardian Name", "No", "Leave all three Guardian columns blank if not applicable"],
      ["Guardian Phone", "No", ""],
      ["Guardian Relationship", "No", "e.g. Grandmother, Uncle"],
      [""],
      ["Do not change the column headers on the Template sheet — rows are matched by header name."],
      [
        "Delete the example row before adding your own students, or leave it — it will import as a real record if left in.",
      ],
    ],
    columnWidths: [28, 12, 70],
  };

  return [templateSheet, instructionsSheet];
}
