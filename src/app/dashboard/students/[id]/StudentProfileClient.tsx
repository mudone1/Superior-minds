"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Pencil, RotateCcw, ShieldAlert, TrendingUp } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  StudentAvatar,
  StudentStatusBadge,
  PromoteStudentModal,
  TransferStudentModal,
  ArchiveStudentModal,
} from "@/components/students";
import { useCanManageStudents } from "@/hooks/useCanManageStudents";
import type { Student, SessionUser } from "@/types";

interface StudentProfileClientProps {
  currentUser: SessionUser;
  student: Student;
  photoFailed?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return dateFormatter.format(new Date(iso));
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value || "—"}</p>
    </div>
  );
}

export function StudentProfileClient({ currentUser, student, photoFailed }: StudentProfileClientProps) {
  const router = useRouter();
  const { canManage } = useCanManageStudents(currentUser.role);

  const [promoteOpen, setPromoteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [archiveAction, setArchiveAction] = useState<"archive" | "restore" | null>(null);

  function refresh() {
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Link href="/dashboard/students" className="flex w-fit items-center gap-1.5 text-sm text-ink-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </Link>

      {photoFailed && (
        <Alert variant="error">
          Passport photo couldn&apos;t be uploaded (Firebase Storage isn&apos;t set up on this project
          yet). Everything else was saved successfully.
        </Alert>
      )}

      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <StudentAvatar
                photoURL={student.passportPhotoURL}
                name={`${student.surname} ${student.otherNames}`}
                size="lg"
              />
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  {student.surname} {student.otherNames}
                </h2>
                <p className="mt-0.5 font-mono text-sm text-ink-500">{student.admissionNumber}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StudentStatusBadge status={student.status} />
                  <span className="text-sm text-ink-500">
                    {student.class} {student.arm}
                  </span>
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/students/${student.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => setPromoteOpen(true)}>
                  <TrendingUp className="h-4 w-4" /> Promote
                </Button>
                {student.status === "archived" ? (
                  <Button variant="outline" size="sm" onClick={() => setArchiveAction("restore")}>
                    <RotateCcw className="h-4 w-4" /> Restore
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
                      <ShieldAlert className="h-4 w-4" /> Transfer
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setArchiveAction("archive")}>
                      Archive
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {student.statusNote && (
        <Alert variant="info">
          <strong>{student.status === "transferred" ? "Transfer note:" : "Note:"}</strong>{" "}
          {student.statusNote}
        </Alert>
      )}

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Personal Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Gender" value={student.gender} />
            <Field label="Date of Birth" value={formatDate(student.dateOfBirth)} />
            <Field label="Admission Date" value={formatDate(student.admissionDate)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Location
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="State" value={student.state} />
            <Field label="LGA" value={student.lga} />
            <Field label="Address" value={student.address} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Medical Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Blood Group" value={student.bloodGroup} />
            <Field label="Genotype" value={student.genotype} />
            <Field label="Medical Notes" value={student.medicalNotes ?? ""} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Parent / Guardian
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Parent" value={student.parentName ?? "Not linked"} />
            <Field label="Guardian" value={student.guardian?.name ?? "—"} />
            <Field
              label="Guardian Contact"
              value={
                student.guardian
                  ? `${student.guardian.phone} (${student.guardian.relationship})`
                  : "—"
              }
            />
          </div>
        </CardBody>
      </Card>

      <PromoteStudentModal
        open={promoteOpen}
        student={student}
        onClose={() => setPromoteOpen(false)}
        onSaved={refresh}
      />
      <TransferStudentModal
        open={transferOpen}
        student={student}
        onClose={() => setTransferOpen(false)}
        onSaved={refresh}
      />
      <ArchiveStudentModal
        open={Boolean(archiveAction)}
        student={student}
        action={archiveAction ?? "archive"}
        onClose={() => setArchiveAction(null)}
        onSaved={refresh}
      />
    </div>
  );
}
