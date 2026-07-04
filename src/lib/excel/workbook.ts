"use client";

import * as XLSX from "xlsx";

export interface TemplateSheet {
  name: string;
  /** Array of row arrays. The first row is treated as the header. */
  rows: (string | number)[][];
  /** Optional column widths (characters), same order as the header row. */
  columnWidths?: number[];
}

/** Builds a multi-sheet .xlsx file in the browser and triggers a download — no server round trip needed. */
export function downloadWorkbook(filename: string, sheets: TemplateSheet[]): void {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.rows);
    if (sheet.columnWidths) {
      worksheet["!cols"] = sheet.columnWidths.map((wch) => ({ wch }));
    }
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }

  XLSX.writeFile(workbook, filename);
}

/**
 * Reads the first sheet of an uploaded .xlsx/.xls/.csv file into an array of
 * row objects keyed by the header row's exact cell text. Blank trailing
 * rows are dropped. All cell values are coerced to strings (numbers/dates
 * included) so downstream validation can apply its own, more specific
 * parsing rules.
 */
export async function parseFirstSheetRows(file: File): Promise<Record<string, string>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) return [];

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
    dateNF: "yyyy-mm-dd",
  });

  return raw
    .map((row) => {
      const out: Record<string, string> = {};
      for (const [key, value] of Object.entries(row)) {
        out[key.trim()] = typeof value === "string" ? value.trim() : String(value ?? "").trim();
      }
      return out;
    })
    .filter((row) => Object.values(row).some((v) => v !== ""));
}
