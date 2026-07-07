"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, Send } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { StudentAvatar } from "@/components/students";
import { listTeacherSubjectAssignments, getAcademicSettings } from "@/lib/firebase/academic";
import { listStudents } from "@/lib/firebase/students";
import { listScores } from "@/lib/firebase/scores";
import { saveScores, submitScores, ApiClientError } from "@/lib/api/scores";
import { SCORE_STATUS_LABELS, DEFAULT_CA_MAX, DEFAULT_EXAM_MAX } from "@/types";
import type { AcademicSettings, ScoreStatus, Student, StudentScore, TeacherSubjectAssignment } from "@/types";

interface GradebookClientProps {
  teacherUid: string;
}

interface RowState {
  student: Student;
  caScore: number | null;
  examScore: number | null;
  status: ScoreStatus;
}

export function GradebookClient({ teacherUid }: GradebookClientProps) {
  const [assignments, setAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [settings, setSettings] = useState<AcademicSettings | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [rows, setRows] = useState<RowState[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listTeacherSubjectAssignments({ teacherUid }), getAcademicSettings()])
      .then(([a, s]) => {
        setAssignments(a);
        setSettings(s);
      })
      .catch(() => setError("Couldn't load your class assignments."))
      .finally(() => setLoadingAssignments(false));
  }, [teacherUid]);

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId) ?? null;
  const currentTermId = settings?.currentTermId ?? null;

  async function loadRows() {
    if (!selectedAssignment || !currentTermId) return;
    setLoadingRows(true);
    setError(null);
    setMessage(null);
    try {
      const [studentResult, scores] = await Promise.all([
        listStudents({
          classLevel: selectedAssignment.className,
          arm: selectedAssignment.armName,
          status: "active",
          pageSize: 300,
        }),
        listScores({
          armId: selectedAssignment.armId,
          subjectId: selectedAssignment.subjectId,
          termId: currentTermId,
        }),
      ]);

      const scoreByStudent = new Map<string, StudentScore>(scores.map((s) => [s.studentId, s]));
      const nextRows: RowState[] = studentResult.students
        .slice()
        .sort((a, b) => `${a.surname} ${a.otherNames}`.localeCompare(`${b.surname} ${b.otherNames}`))
        .map((student) => {
          const existing = scoreByStudent.get(student.id);
          return {
            student,
            caScore: existing?.caScore ?? null,
            examScore: existing?.examScore ?? null,
            status: existing?.status ?? "draft",
          };
        });
      setRows(nextRows);
    } catch {
      setError("Couldn't load students and scores for this class.");
    } finally {
      setLoadingRows(false);
    }
  }

  useEffect(() => {
    setRows([]);
    if (selectedAssignmentId && currentTermId) loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssignmentId, currentTermId]);

  function updateRow(studentId: string, field: "caScore" | "examScore", raw: string) {
    const max = field === "caScore" ? DEFAULT_CA_MAX : DEFAULT_EXAM_MAX;
    const value = raw === "" ? null : Math.max(0, Math.min(max, Number(raw)));
    setRows((prev) => prev.map((r) => (r.student.id === studentId ? { ...r, [field]: value } : r)));
  }

  const editableRows = rows.filter((r) => r.status === "draft" || r.status === "submitted");
  const allComplete = rows.length > 0 && rows.every((r) => r.caScore !== null && r.examScore !== null);

  async function handleSave() {
    if (!selectedAssignment || !currentTermId) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await saveScores({
        armId: selectedAssignment.armId,
        subjectId: selectedAssignment.subjectId,
        termId: currentTermId,
        entries: rows.map((r) => ({ studentId: r.student.id, caScore: r.caScore, examScore: r.examScore })),
      });
      setMessage(
        `Saved ${result.saved} score${result.saved === 1 ? "" : "s"}${
          result.skippedLocked > 0 ? ` (${result.skippedLocked} locked and unchanged)` : ""
        }.`
      );
      await loadRows();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't save scores.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!selectedAssignment || !currentTermId) return;
    if (!window.confirm("Submit these scores for approval? You can still update them until an admin approves.")) {
      return;
    }
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const result = await submitScores({
        armId: selectedAssignment.armId,
        subjectId: selectedAssignment.subjectId,
        termId: currentTermId,
      });
      setMessage(`Submitted ${result.submitted} score${result.submitted === 1 ? "" : "s"} for approval.`);
      await loadRows();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't submit scores.");
    } finally {
      setSubmitting(false);
    }
  }

  const assignmentOptions = useMemo(
    () =>
      assignments.map((a) => ({
        value: a.id,
        label: `${a.className} ${a.armName} — ${a.subjectName}`,
      })),
    [assignments]
  );

  if (loadingAssignments) {
    return (
      <Card>
        <CardBody className="py-10">
          <Spinner label="Loading your classes…" />
        </CardBody>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Alert variant="info">
        You haven&apos;t been assigned to teach any subject yet. Ask an Administrator to assign
        you under Academic Setup.
      </Alert>
    );
  }

  if (!currentTermId) {
    return (
      <Alert variant="info">
        No current academic term is set. Ask an Administrator to set one under Academic Setup
        before entering scores.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card>
        <CardBody className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-72">
            <Select
              label="Class, Arm & Subject"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              options={assignmentOptions}
              placeholder="Choose which class to grade"
            />
          </div>
          <p className="text-xs text-ink-500">
            Entering scores for <span className="font-medium text-ink">{settings?.currentTermName}</span>,{" "}
            {settings?.currentSessionName}
          </p>
        </CardBody>
      </Card>

      {selectedAssignmentId && (
        <Card>
          {loadingRows ? (
            <div className="py-10">
              <Spinner label="Loading students…" />
            </div>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-500">No active students in this class arm yet.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-300/20 text-xs uppercase tracking-wide text-ink-500">
                      <th className="px-6 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">CA (/{DEFAULT_CA_MAX})</th>
                      <th className="px-4 py-3 font-medium">Exam (/{DEFAULT_EXAM_MAX})</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-300/10">
                    {rows.map((row) => {
                      const locked = row.status !== "draft" && row.status !== "submitted";
                      const total = row.caScore !== null && row.examScore !== null ? row.caScore + row.examScore : null;
                      return (
                        <tr key={row.student.id}>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <StudentAvatar
                                photoURL={row.student.passportPhotoURL}
                                name={`${row.student.surname} ${row.student.otherNames}`}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-ink">
                                  {row.student.surname} {row.student.otherNames}
                                </p>
                                <p className="truncate text-xs text-ink-500">{row.student.admissionNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              max={DEFAULT_CA_MAX}
                              value={row.caScore ?? ""}
                              disabled={locked}
                              onChange={(e) => updateRow(row.student.id, "caScore", e.target.value)}
                              className="h-9 w-20 rounded-md border border-ink-300/60 bg-white px-2 text-sm text-ink disabled:bg-ink/5 disabled:text-ink-300"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              max={DEFAULT_EXAM_MAX}
                              value={row.examScore ?? ""}
                              disabled={locked}
                              onChange={(e) => updateRow(row.student.id, "examScore", e.target.value)}
                              className="h-9 w-20 rounded-md border border-ink-300/60 bg-white px-2 text-sm text-ink disabled:bg-ink/5 disabled:text-ink-300"
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-ink">{total ?? "—"}</td>
                          <td className="px-4 py-3">
                            <Badge tone={row.status === "draft" ? "sage" : "brass"}>
                              {SCORE_STATUS_LABELS[row.status]}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-300/20 px-6 py-4">
                <p className="text-xs text-ink-500">
                  {editableRows.length === 0
                    ? "All scores here are locked (approved or published)."
                    : allComplete
                      ? "Every student has a CA and Exam score."
                      : "Fill in every CA and Exam score before submitting."}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleSave} isLoading={saving} disabled={editableRows.length === 0}>
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={handleSubmit} isLoading={submitting} disabled={!allComplete || editableRows.length === 0}>
                    <Send className="h-4 w-4" />
                    Submit for Approval
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
