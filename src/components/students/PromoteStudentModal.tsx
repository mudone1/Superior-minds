"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { listSchoolClasses, listClassArms } from "@/lib/firebase/academic";
import { promoteStudent, ApiClientError } from "@/lib/api/students";
import type { ClassArm, SchoolClass, Student } from "@/types";

interface PromoteStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  student: Student | null;
}

export function PromoteStudentModal({ open, onClose, onSaved, student }: PromoteStudentModalProps) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [arms, setArms] = useState<ClassArm[]>([]);
  const [classLevel, setClassLevel] = useState("");
  const [arm, setArm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && student) {
      setError(null);
      listSchoolClasses()
        .then((c) => {
          const sorted = c.slice().sort((a, b) => a.order - b.order);
          setClasses(sorted);
          const currentIndex = sorted.findIndex((cls) => cls.name === student.class);
          const nextClass = currentIndex >= 0 ? sorted[currentIndex + 1] : undefined;
          setClassLevel(nextClass?.name ?? student.class);
        })
        .catch(() => setError("Couldn't load classes."));
      setArm(student.arm);
    }
  }, [open, student]);

  useEffect(() => {
    const match = classes.find((c) => c.name === classLevel);
    if (!match) {
      setArms([]);
      return;
    }
    listClassArms(match.id)
      .then(setArms)
      .catch(() => setArms([]));
  }, [classLevel, classes]);

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
            onChange={(e) => {
              setClassLevel(e.target.value);
              setArm("");
            }}
            options={classes.map((c) => ({ value: c.name, label: c.name }))}
          />
          <Select
            label="New Arm"
            value={arm}
            onChange={(e) => setArm(e.target.value)}
            options={arms.map((a) => ({ value: a.name, label: a.name }))}
            placeholder={arms.length === 0 ? "No arms set up for this class" : "Select an arm"}
            disabled={arms.length === 0}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={submitting} disabled={!classLevel || !arm}>
              Promote
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
