import { requireStaff } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StudentListClient } from "./StudentListClient";

export default async function StudentsPage() {
  const user = await requireStaff();

  return (
    <DashboardShell role={user.role} title="Students">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Students</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Search, view, and manage student records. Administrators can always add and edit
            students; Administrative Staff can too if enabled in Settings.
          </p>
        </div>
        <StudentListClient currentUser={user} />
      </div>
    </DashboardShell>
  );
}
