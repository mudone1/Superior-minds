"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { transferStudentSchema } from "@/lib/validation/student";
import { transferStudent, ApiClientError } from "@/lib/api/students";
import type { Student } from "@/types";

interface TransferStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  student: Student | null;
}

export function TransferStudentModal({ open, onClose, onSaved, student }: TransferStudentModalProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setNote("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit() {
    if (!student) return;
    const parsed = transferStudentSchema.safeParse({ note });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Add a note about this transfer.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await transferStudent(student.id, parsed.data.note);
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
      title="Transfer Student"
      description={student ? `Mark ${student.surname} ${student.otherNames} as transferred out.` : undefined}
      size="sm"
    >
      {student && (
        <div className="flex flex-col gap-4">
          {error && <Alert variant="error">{error}</Alert>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              Note <span className="text-brass-600">*</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Transferred to Bright Future Academy, Kubwa"
              rows={3}
              className="w-full rounded-md border border-ink-300/60 bg-white px-3 py-2 text-sm text-ink transition-colors focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={submitting} variant="secondary">
              Confirm Transfer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
