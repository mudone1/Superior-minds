"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { downloadWorkbook, parseFirstSheetRows } from "@/lib/excel/workbook";
import {
  buildStudentBulkTemplate,
  validateStudentBulkRows,
  type ClassArmOptions,
  type StudentBulkRow,
  type StudentBulkRowError,
} from "@/lib/validation/studentBulk";
import { listSchoolClasses, listClassArms } from "@/lib/firebase/academic";

interface BulkStudentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
}

type Stage = "idle" | "parsing" | "reviewing" | "importing" | "done";

export function BulkStudentUploadModal({ open, onClose, onImported }: BulkStudentUploadModalProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [validRows, setValidRows] = useState<StudentBulkRow[]>([]);
  const [rowErrors, setRowErrors] = useState<StudentBulkRowError[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [classArmOptions, setClassArmOptions] = useState<ClassArmOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const classes = await listSchoolClasses();
        const armLists = await Promise.all(classes.map((c) => listClassArms(c.id)));
        if (cancelled) return;
        const armNamesByClass: Record<string, string[]> = {};
        classes.forEach((c, i) => {
          armNamesByClass[c.name] = (armLists[i] ?? []).map((a) => a.name);
        });
        setClassArmOptions({ classNames: classes.map((c) => c.name), armNamesByClass });
      } catch {
        if (!cancelled) setOptionsError("Couldn't load your school's classes and arms.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  function reset() {
    setStage("idle");
    setFileName(null);
    setValidRows([]);
    setRowErrors([]);
    setFormError(null);
    setImportedCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleDownloadTemplate() {
    downloadWorkbook("SMA-Student-Bulk-Upload-Template.xlsx", buildStudentBulkTemplate(classArmOptions?.classNames ?? []));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!classArmOptions) {
      setFormError("Still loading your school's classes — try again in a moment.");
      return;
    }
    setFileName(file.name);
    setFormError(null);
    setStage("parsing");

    try {
      const rawRows = await parseFirstSheetRows(file);
      if (rawRows.length === 0) {
        setFormError("That file doesn't have any rows to import.");
        setStage("idle");
        return;
      }
      const { validRows: valid, rowErrors: errs } = validateStudentBulkRows(rawRows, classArmOptions);
      setValidRows(valid);
      setRowErrors(errs);
      setStage("reviewing");
    } catch {
      setFormError("Couldn't read that file. Make sure it's a .xlsx or .csv file exported from Excel.");
      setStage("idle");
    }
  }

  async function handleImport() {
    if (validRows.length === 0) return;
    setStage("importing");
    setFormError(null);

    try {
      const res = await fetch("/api/admin/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(payload.error ?? "Import failed. Please try again.");
        setStage("reviewing");
        return;
      }
      setImportedCount(payload.created ?? validRows.length);
      setStage("done");
      onImported(payload.created ?? validRows.length);
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
      setStage("reviewing");
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Bulk Upload Students" size="lg">
      <div className="flex flex-col gap-5">
        {formError && <Alert variant="error">{formError}</Alert>}
        {optionsError && <Alert variant="error">{optionsError}</Alert>}
        {classArmOptions && classArmOptions.classNames.length === 0 && (
          <Alert variant="info">
            No classes are set up yet. Add classes and arms under Academic Setup before bulk
            uploading students.
          </Alert>
        )}

        {stage === "done" ? (
          <Alert variant="success">
            Imported {importedCount} student{importedCount === 1 ? "" : "s"} successfully.
          </Alert>
        ) : (
          <>
            <div className="rounded-md border border-ink-300/60 bg-ink/5 p-4 text-sm text-ink-700">
              <p className="font-medium text-ink">Step 1 — Download the template</p>
              <p className="mt-1 text-ink-500">
                Fill it in following the column order and Instructions sheet. Admission numbers you
                enter are used as-is — they are not auto-generated for bulk uploads.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleDownloadTemplate}
                disabled={!classArmOptions}
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>

            <div className="rounded-md border border-ink-300/60 bg-ink/5 p-4 text-sm text-ink-700">
              <p className="font-medium text-ink">Step 2 — Upload your completed file</p>
              <p className="mt-1 text-ink-500">Accepts .xlsx, .xls, or .csv.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => fileInputRef.current?.click()}
                isLoading={stage === "parsing"}
                disabled={!classArmOptions}
              >
                <Upload className="h-4 w-4" />
                {fileName ?? "Choose File"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {stage === "reviewing" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4 text-indigo" />
                  <span className="font-medium text-ink">
                    {validRows.length} row{validRows.length === 1 ? "" : "s"} ready to import
                  </span>
                  {rowErrors.length > 0 && (
                    <span className="text-red-600">
                      · {rowErrors.length} row{rowErrors.length === 1 ? "" : "s"} with errors (won&apos;t be
                      imported)
                    </span>
                  )}
                </div>

                {rowErrors.length > 0 && (
                  <div className="max-h-56 overflow-y-auto rounded-md border border-red-200 bg-red-50">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-red-100 text-red-800">
                        <tr>
                          <th className="px-3 py-2 font-medium">Row</th>
                          <th className="px-3 py-2 font-medium">Problems</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowErrors.map((re) => (
                          <tr key={re.row} className="border-t border-red-200">
                            <td className="px-3 py-2 align-top font-mono text-red-700">{re.row}</td>
                            <td className="px-3 py-2 text-red-700">{re.errors.join("; ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {stage === "done" ? "Close" : "Cancel"}
          </Button>
          {stage === "reviewing" && validRows.length > 0 && (
            <Button type="button" onClick={handleImport} isLoading={false}>
              Import {validRows.length} Student{validRows.length === 1 ? "" : "s"}
            </Button>
          )}
          {stage === "importing" && (
            <Button type="button" isLoading disabled>
              Importing…
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
