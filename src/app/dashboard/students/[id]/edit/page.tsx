import { notFound, redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StudentForm } from "@/components/students";
import { adminDb } from "@/lib/firebase/admin";
import { STUDENTS_COLLECTION } from "@/lib/firebase/students";
import { SETTINGS_DOC_PATH } from "@/lib/firebase/settings";
import { mapStudentDoc } from "@/lib/server/mapStudentDoc";
import { isAdminLevelRole } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: PageProps) {
  const user = await requireStaff();
  const { id } = await params;

  if (!isAdminLevelRole(user.role)) {
    const settingsSnap = await adminDb.doc(SETTINGS_DOC_PATH).get();
    const allowed = settingsSnap.exists ? Boolean(settingsSnap.data()?.allowStaffAddStudents) : false;
    if (!allowed) {
      redirect(`/dashboard/students/${id}`);
    }
  }

  const snap = await adminDb.collection(STUDENTS_COLLECTION).doc(id).get();
  if (!snap.exists) {
    notFound();
  }

  const student = mapStudentDoc(snap.id, snap.data() ?? {});

  return (
    <DashboardShell role={user.role} title="Edit Student">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Edit {student.surname} {student.otherNames}
          </h2>
          <p className="mt-1 text-sm text-ink-500">Update this student&apos;s profile.</p>
        </div>
        <StudentForm mode="edit" student={student} />
      </div>
    </DashboardShell>
  );
}
