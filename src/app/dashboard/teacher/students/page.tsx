import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { TeacherStudentsClient } from "@/components/teacher/TeacherStudentsClient";

export default async function TeacherStudentsPage() {
  const user = await requireRole("teacher");

  return (
    <DashboardShell role="teacher" title="My Students">
      <TeacherStudentsClient teacherUid={user.uid} />
    </DashboardShell>
  );
}
