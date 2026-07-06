"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import {
  listSchoolClasses,
  listClassArms,
  listSubjects,
  listClassSubjects,
  listClassTeachers,
  listTeacherSubjectAssignments,
} from "@/lib/firebase/academic";
import { listUsers } from "@/lib/firebase/users";
import {
  assignClassSubject,
  unassignClassSubject,
  assignClassTeacher,
  unassignClassTeacher,
  assignTeacherSubject,
  unassignTeacherSubject,
  ApiClientError,
} from "@/lib/api/academic";
import type {
  AppUser,
  ClassArm,
  ClassSubject,
  ClassTeacher,
  SchoolClass,
  Subject,
  TeacherSubjectAssignment,
} from "@/types";

export function AssignmentsTab() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [arms, setArms] = useState<ClassArm[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [classTeachers, setClassTeachers] = useState<ClassTeacher[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedArmId, setSelectedArmId] = useState("");
  const [curriculumSubjectId, setCurriculumSubjectId] = useState("");
  const [classTeacherUid, setClassTeacherUid] = useState("");
  const [subjectTeacherSubjectId, setSubjectTeacherSubjectId] = useState("");
  const [subjectTeacherUid, setSubjectTeacherUid] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [c, a, s, teacherResult, cs, ct, ta] = await Promise.all([
        listSchoolClasses(),
        listClassArms(),
        listSubjects(),
        listUsers({ role: "teacher", status: "active", pageSize: 200 }),
        listClassSubjects(),
        listClassTeachers(),
        listTeacherSubjectAssignments(),
      ]);
      setClasses(c);
      setArms(a);
      setSubjects(s);
      setTeachers(teacherResult.users);
      setClassSubjects(cs);
      setClassTeachers(ct);
      setTeacherAssignments(ta);
    } catch {
      setError("Couldn't load assignment data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const armsForClass = useMemo(
    () => arms.filter((a) => a.classId === selectedClassId),
    [arms, selectedClassId]
  );

  useEffect(() => {
    setSelectedArmId("");
  }, [selectedClassId]);

  const curriculumForClass = classSubjects.filter((cs) => cs.classId === selectedClassId);
  const currentClassTeacher = classTeachers.find((ct) => ct.armId === selectedArmId);
  const assignmentsForArm = teacherAssignments.filter((ta) => ta.armId === selectedArmId);

  async function withBusy(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="py-10">
          <Spinner label="Loading assignment data…" />
        </CardBody>
      </Card>
    );
  }

  if (classes.length === 0 || subjects.length === 0) {
    return (
      <Alert variant="info">
        Add at least one Class (with an Arm) and one Subject on the other tabs before setting up
        assignments.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <CardBody className="flex flex-wrap items-end gap-4">
          <div className="w-56">
            <Select
              label="Class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              options={classes.slice().sort((a, b) => a.order - b.order).map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select a class"
            />
          </div>
          <div className="w-40">
            <Select
              label="Arm"
              value={selectedArmId}
              onChange={(e) => setSelectedArmId(e.target.value)}
              options={armsForClass.map((a) => ({ value: a.id, label: a.name }))}
              placeholder={selectedClassId ? "Select an arm" : "Select a class first"}
              disabled={!selectedClassId}
            />
          </div>
        </CardBody>
      </Card>

      {/* Class curriculum */}
      {selectedClassId && (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
              Curriculum — Subjects Taught in This Class
            </h3>
            <div className="flex flex-wrap gap-2">
              {curriculumForClass.map((cs) => (
                <span
                  key={cs.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-300/30 bg-ink/[0.02] py-1 pl-3 pr-1.5 text-sm text-ink-700"
                >
                  {cs.subjectName}
                  <button
                    type="button"
                    onClick={() => withBusy(() => unassignClassSubject(cs.id))}
                    aria-label={`Remove ${cs.subjectName}`}
                    className="rounded-full p-1 text-ink-300 hover:bg-rose-50 hover:text-rose"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {curriculumForClass.length === 0 && (
                <p className="text-xs text-ink-500">No subjects assigned to this class yet.</p>
              )}
            </div>
            <div className="flex items-end gap-3">
              <div className="w-56">
                <Select
                  label="Add Subject"
                  value={curriculumSubjectId}
                  onChange={(e) => setCurriculumSubjectId(e.target.value)}
                  options={subjects
                    .filter((s) => !curriculumForClass.some((cs) => cs.subjectId === s.id))
                    .map((s) => ({ value: s.id, label: s.name }))}
                  placeholder="Select a subject"
                />
              </div>
              <Button
                variant="outline"
                disabled={!curriculumSubjectId || busy}
                onClick={() =>
                  withBusy(async () => {
                    await assignClassSubject({ classId: selectedClassId, subjectId: curriculumSubjectId });
                    setCurriculumSubjectId("");
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Class teacher */}
      {selectedArmId && (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
              Class Teacher (Homeroom)
            </h3>
            {currentClassTeacher ? (
              <div className="flex items-center gap-3">
                <Badge tone="indigo">{currentClassTeacher.teacherName}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => withBusy(() => unassignClassTeacher(currentClassTeacher.id))}
                  className="text-rose hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            ) : (
              <p className="text-xs text-ink-500">No class teacher assigned to this arm yet.</p>
            )}
            <div className="flex items-end gap-3">
              <div className="w-56">
                <Select
                  label={currentClassTeacher ? "Replace With" : "Assign Teacher"}
                  value={classTeacherUid}
                  onChange={(e) => setClassTeacherUid(e.target.value)}
                  options={teachers.map((t) => ({ value: t.uid, label: t.displayName }))}
                  placeholder="Select a teacher"
                />
              </div>
              <Button
                variant="outline"
                disabled={!classTeacherUid || busy}
                onClick={() =>
                  withBusy(async () => {
                    await assignClassTeacher({ armId: selectedArmId, teacherUid: classTeacherUid });
                    setClassTeacherUid("");
                  })
                }
              >
                <Plus className="h-4 w-4" />
                {currentClassTeacher ? "Replace" : "Assign"}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Teacher subject assignment */}
      {selectedArmId && (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
              Subject Teachers for This Arm
            </h3>
            <div className="rounded-md border border-ink-300/20">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-ink-300/10">
                  {assignmentsForArm.map((ta) => (
                    <tr key={ta.id}>
                      <td className="px-4 py-2.5 font-medium text-ink">{ta.subjectName}</td>
                      <td className="px-4 py-2.5 text-ink-500">{ta.teacherName}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => withBusy(() => unassignTeacherSubject(ta.id))}
                          className="text-rose hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {assignmentsForArm.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-xs text-ink-500">
                        No subject teachers assigned to this arm yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-52">
                <Select
                  label="Subject"
                  value={subjectTeacherSubjectId}
                  onChange={(e) => setSubjectTeacherSubjectId(e.target.value)}
                  options={curriculumForClass.map((cs) => ({ value: cs.subjectId, label: cs.subjectName }))}
                  placeholder={curriculumForClass.length ? "Select a subject" : "Add this class's curriculum first"}
                  disabled={curriculumForClass.length === 0}
                />
              </div>
              <div className="w-52">
                <Select
                  label="Teacher"
                  value={subjectTeacherUid}
                  onChange={(e) => setSubjectTeacherUid(e.target.value)}
                  options={teachers.map((t) => ({ value: t.uid, label: t.displayName }))}
                  placeholder="Select a teacher"
                />
              </div>
              <Button
                variant="outline"
                disabled={!subjectTeacherSubjectId || !subjectTeacherUid || busy}
                onClick={() =>
                  withBusy(async () => {
                    await assignTeacherSubject({
                      armId: selectedArmId,
                      subjectId: subjectTeacherSubjectId,
                      teacherUid: subjectTeacherUid,
                    });
                    setSubjectTeacherSubjectId("");
                    setSubjectTeacherUid("");
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Assign
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
