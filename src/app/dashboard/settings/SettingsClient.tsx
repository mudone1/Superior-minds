"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { updateSchoolSettings, ApiClientError } from "@/lib/api/students";

interface SettingsClientProps {
  initialAllowStaffAddStudents: boolean;
}

export function SettingsClient({ initialAllowStaffAddStudents }: SettingsClientProps) {
  const [allowStaffAddStudents, setAllowStaffAddStudents] = useState(initialAllowStaffAddStudents);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleToggle(next: boolean) {
    const previous = allowStaffAddStudents;
    setAllowStaffAddStudents(next);
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateSchoolSettings(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setAllowStaffAddStudents(previous);
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert variant="error">{error}</Alert>}
      {saved && <Alert variant="success">Setting saved.</Alert>}

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Student Management
          </h3>
          <label className="flex items-start justify-between gap-4">
            <span>
              <span className="block text-sm font-medium text-ink">
                Allow Administrative Staff to add students
              </span>
              <span className="mt-0.5 block text-sm text-ink-500">
                When off, only Administrators and the Super Admin can add or edit student records.
                When on, Administrative Staff can too.
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              aria-checked={allowStaffAddStudents}
              checked={allowStaffAddStudents}
              disabled={saving}
              onChange={(e) => handleToggle(e.target.checked)}
              className="mt-1 h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-ink-300/40 transition-colors checked:bg-sage relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
            />
          </label>
        </CardBody>
      </Card>
    </div>
  );
}
