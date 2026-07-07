"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { StudentAvatar, StudentStatusBadge } from "@/components/students";
import { listTeacherSubjectAssignments } from "@/lib/firebase/academic";
import { listStudents } from "@/lib/firebase/students";
import type { Student, TeacherSubjectAssignment } from "@/types";

interface TeacherStudentsClientProps {
  teacherUid: string;
}

export function TeacherStudentsClient({ teacherUid }: TeacherStudentsClientProps) {
  const [assignments, setAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [selectedArmId, setSelectedArmId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTeacherSubjectAssignments({ teacherUid })
      .then(setAssignments)
      .catch(() => setError("Couldn't load your assigned classes."))
      .finally(() => setLoadingAssignments(false));
  }, [teacherUid]);

  // A teacher can be assigned several subjects in the same arm — this is
  // "my classes" scoped to distinct arms, not one row per subject.
  const distinctArms = useMemo(() => {
    const byArm = new Map<string, TeacherSubjectAssignment>();
    for (const a of assignments) byArm.set(a.armId, a);
    return Array.from(byArm.values()).sort((a, b) =>
      `${a.className} ${a.armName}`.localeCompare(`${b.className} ${b.armName}`)
    );
  }, [assignments]);

  const selectedArm = distinctArms.find((a) => a.armId === selectedArmId) ?? null;

  useEffect(() => {
    if (!selectedArm) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    setError(null);
    listStudents({ classLevel: selectedArm.className, arm: selectedArm.armName, status: "active", pageSize: 300 })
      .then((result) =>
        setStudents(
          result.students
            .slice()
            .sort((a, b) => `${a.surname} ${a.otherNames}`.localeCompare(`${b.surname} ${b.otherNames}`))
        )
      )
      .catch(() => setError("Couldn't load students for this class."))
      .finally(() => setLoadingStudents(false));
  }, [selectedArm]);

  if (loadingAssignments) {
    return (
      <Card>
        <div className="py-10">
          <Spinner label="Loading your classes…" />
        </div>
      </Card>
    );
  }

  if (distinctArms.length === 0) {
    return (
      <Alert variant="info">
        You haven&apos;t been assigned to any class yet. Ask an Administrator to assign you under
        Academic Setup.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="w-72">
        <Select
          label="My Classes"
          value={selectedArmId}
          onChange={(e) => setSelectedArmId(e.target.value)}
          options={distinctArms.map((a) => ({ value: a.armId, label: `${a.className} ${a.armName}` }))}
          placeholder="Choose a class to view"
        />
      </div>

      {selectedArmId && (
        <Card>
          {loadingStudents ? (
            <div className="py-10">
              <Spinner label="Loading students…" />
            </div>
          ) : students.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-500">No active students in this class yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-300/20 text-xs uppercase tracking-wide text-ink-500">
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Admission No.</th>
                    <th className="px-4 py-3 font-medium">Gender</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-300/10">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-ink/[0.02]">
                      <td className="px-6 py-3">
                        <Link href={`/dashboard/students/${s.id}`} className="flex items-center gap-3">
                          <StudentAvatar photoURL={s.passportPhotoURL} name={`${s.surname} ${s.otherNames}`} size="sm" />
                          <p className="font-medium text-ink">
                            {s.surname} {s.otherNames}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-ink-500">{s.admissionNumber}</td>
                      <td className="px-4 py-3 text-ink-500">{s.gender}</td>
                      <td className="px-4 py-3">
                        <StudentStatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
