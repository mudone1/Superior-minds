"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { downloadWorkbook, parseFirstSheetRows } from "@/lib/excel/workbook";
import {
  buildParentBulkTemplate,
  validateParentBulkRows,
  type ParentBulkRow,
  type ParentBulkRowError,
} from "@/lib/validation/parentBulk";
import { suggestTemporaryPassword } from "@/lib/validation/user";
import { createStaffAccount, ManageUserError } from "@/lib/firebase/functions";

interface BulkParentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type Stage = "idle" | "parsing" | "reviewing" | "importing" | "done";

interface ImportOutcome {
  email: string;
  ok: boolean;
  message?: string;
}

/** Accounts are created one at a time against the existing single-account API route — no new server endpoint needed, and every row gets the same validation (email uniqueness, etc.) that a manually-added parent would. */
async function createAccountsSequentially(
  rows: ParentBulkRow[],
  onProgress: (done: number, total: number) => void
): Promise<ImportOutcome[]> {
  const outcomes: ImportOutcome[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    try {
      await createStaffAccount({
        email: row.email,
        displayName: row.displayName,
        role: "parent",
        phone: row.phone || undefined,
        temporaryPassword: row.temporaryPassword,
      });
      outcomes.push({ email: row.email, ok: true });
    } catch (err) {
      const message = err instanceof ManageUserError ? err.message : "Something went wrong.";
      outcomes.push({ email: row.email, ok: false, message });
    }
    onProgress(i + 1, rows.length);
  }
  return outcomes;
}

export function BulkParentUploadModal({ open, onClose, onImported }: BulkParentUploadModalProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [validRows, setValidRows] = useState<ParentBulkRow[]>([]);
  const [rowErrors, setRowErrors] = useState<ParentBulkRowError[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [outcomes, setOutcomes] = useState<ImportOutcome[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStage("idle");
    setFileName(null);
    setValidRows([]);
    setRowErrors([]);
    setFormError(null);
    setProgress({ done: 0, total: 0 });
    setOutcomes([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleDownloadTemplate() {
    downloadWorkbook("SMA-Parent-Bulk-Upload-Template.xlsx", buildParentBulkTemplate());
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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
      const { validRows: valid, rowErrors: errs } = validateParentBulkRows(
        rawRows,
        suggestTemporaryPassword
      );
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
    setProgress({ done: 0, total: validRows.length });

    const results = await createAccountsSequentially(validRows, (done, total) =>
      setProgress({ done, total })
    );
    setOutcomes(results);
    setStage("done");
    if (results.some((r) => r.ok)) onImported();
  }

  const successCount = outcomes.filter((o) => o.ok).length;
  const failureCount = outcomes.length - successCount;

  return (
    <Modal open={open} onClose={handleClose} title="Bulk Upload Parent Accounts" size="lg">
      <div className="flex flex-col gap-5">
        {formError && <Alert variant="error">{formError}</Alert>}

        {stage === "done" ? (
          <div className="flex flex-col gap-3">
            <Alert variant={failureCount > 0 ? "info" : "success"}>
              Created {successCount} parent account{successCount === 1 ? "" : "s"}
              {failureCount > 0 ? `, ${failureCount} failed` : ""}.
            </Alert>
            {failureCount > 0 && (
              <div className="max-h-56 overflow-y-auto rounded-md border border-red-200 bg-red-50">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-red-100 text-red-800">
                    <tr>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outcomes
                      .filter((o) => !o.ok)
                      .map((o) => (
                        <tr key={o.email} className="border-t border-red-200">
                          <td className="px-3 py-2 align-top text-red-700">{o.email}</td>
                          <td className="px-3 py-2 text-red-700">{o.message}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-md border border-ink-300/60 bg-ink/5 p-4 text-sm text-ink-700">
              <p className="font-medium text-ink">Step 1 — Download the template</p>
              <p className="mt-1 text-ink-500">
                Each row creates a Parent-role account with sign-in access. Leave Temporary Password
                blank to auto-generate one.
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={handleDownloadTemplate}>
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

            {stage === "importing" && (
              <p className="text-sm text-ink-500">
                Creating account {progress.done} of {progress.total}…
              </p>
            )}
          </>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {stage === "done" ? "Close" : "Cancel"}
          </Button>
          {stage === "reviewing" && validRows.length > 0 && (
            <Button type="button" onClick={handleImport}>
              Create {validRows.length} Account{validRows.length === 1 ? "" : "s"}
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
