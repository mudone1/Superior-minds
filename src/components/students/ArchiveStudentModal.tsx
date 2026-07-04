"use client";

import { useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { archiveStudent, restoreStudent, ApiClientError } from "@/lib/api/students";
import type { Student } from "@/types";

interface ArchiveStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  student: Student | null;
  /** "archive" hides the record from the active roster; "restore" brings an archived record back to active. */
  action: "archive" | "restore";
}

export function ArchiveStudentModal({ open, onClose, onSaved, student, action }: ArchiveStudentModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isArchive = action === "archive";

  async function handleConfirm() {
    if (!student) return;
    setSubmitting(true);
    setError(null);
    try {
      await (isArchive ? archiveStudent(student.id) : restoreStudent(student.id));
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open && Boolean(student)}
      onClose={onClose}
      title={isArchive ? "Archive Student" : "Restore Student"}
      size="sm"
    >
      {student && (
        <div className="flex flex-col gap-4">
          {error && <Alert variant="error">{error}</Alert>}
          <div
            className={
              isArchive
                ? "flex items-start gap-2.5 rounded-md border border-rose/30 bg-rose-50 px-4 py-3 text-sm text-rose"
                : "flex items-start gap-2.5 rounded-md border border-sage/30 bg-sage-50 px-4 py-3 text-sm text-sage-600"
            }
          >
            {isArchive ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <p>
              {isArchive ? (
                <>
                  <strong>{student.surname} {student.otherNames}</strong> will be hidden from the
                  active roster but the record is kept, not deleted. You can restore it anytime.
                </>
              ) : (
                <>
                  <strong>{student.surname} {student.otherNames}</strong> will be marked active again
                  and reappear in the active roster.
                </>
              )}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={handleConfirm} isLoading={submitting} variant={isArchive ? "danger" : "primary"}>
              {isArchive ? "Archive" : "Restore"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
