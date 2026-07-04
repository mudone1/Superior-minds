"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CLASS_LEVELS } from "@/lib/data/classLevels";
import { promoteStudent, ApiClientError } from "@/lib/api/students";
import type { Student } from "@/types";

interface PromoteStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  student: Student | null;
}

export function PromoteStudentModal({ open, onClose, onSaved, student }: PromoteStudentModalProps) {
  const [classLevel, setClassLevel] = useState("");
  const [arm, setArm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && student) {
      const currentIndex = CLASS_LEVELS.indexOf(student.class);
      const nextClass = currentIndex >= 0 ? CLASS_LEVELS[currentIndex + 1] : undefined;
      setClassLevel(nextClass ?? student.class);
      setArm(student.arm);
      setError(null);
    }
  }, [open, student]);

  async function handleSubmit() {
    if (!student) return;
    setSubmitting(true);
    setError(null);
    try {
      await promoteStudent(student.id, classLevel, arm);
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
      title="Promote Student"
      description={student ? `Move ${student.surname} ${student.otherNames} to a new class.` : undefined}
      size="sm"
    >
      {student && (
        <div className="flex flex-col gap-4">
          {error && <Alert variant="error">{error}</Alert>}
          <Select
            label="New Class"
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            options={CLASS_LEVELS.map((c) => ({ value: c, label: c }))}
          />
          <input
            value={arm}
            onChange={(e) => setArm(e.target.value)}
            placeholder="Arm"
            aria-label="Arm"
            className="h-11 w-full rounded-md border border-ink-300/60 bg-white px-3 text-sm text-ink transition-colors focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={submitting}>
              Promote
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
