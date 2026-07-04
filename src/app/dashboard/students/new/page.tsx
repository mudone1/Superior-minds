import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StudentForm } from "@/components/students";
import { adminDb } from "@/lib/firebase/admin";
import { SETTINGS_DOC_PATH } from "@/lib/firebase/settings";
import { isAdminLevelRole } from "@/types";

export default async function NewStudentPage() {
  const user = await requireStaff();

  // Server-side permission check mirrors requireApiStudentManager, so a
  // staff member without the setting enabled can't even reach the form —
  // not just have the submit button rejected.
  if (!isAdminLevelRole(user.role)) {
    const settingsSnap = await adminDb.doc(SETTINGS_DOC_PATH).get();
    const allowed = settingsSnap.exists ? Boolean(settingsSnap.data()?.allowStaffAddStudents) : false;
    if (!allowed) {
      redirect("/dashboard/students");
    }
  }

  return (
    <DashboardShell role={user.role} title="Add Student">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Add Student</h2>
          <p className="mt-1 text-sm text-ink-500">Create a new student record.</p>
        </div>
        <StudentForm mode="create" />
      </div>
    </DashboardShell>
  );
}
