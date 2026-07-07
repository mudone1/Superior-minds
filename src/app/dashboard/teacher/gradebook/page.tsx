import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { GradebookClient } from "@/components/teacher/GradebookClient";

export default async function GradebookPage() {
  const user = await requireRole("teacher");

  return (
    <DashboardShell role="teacher" title="Gradebook">
      <GradebookClient teacherUid={user.uid} />
    </DashboardShell>
  );
}
