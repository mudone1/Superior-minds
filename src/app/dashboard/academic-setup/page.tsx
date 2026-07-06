import { requireAdminLevel } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AcademicSetupClient } from "@/components/academic/AcademicSetupClient";

export default async function AcademicSetupPage() {
  const user = await requireAdminLevel();

  return (
    <DashboardShell role={user.role} title="Academic Setup">
      <AcademicSetupClient />
    </DashboardShell>
  );
}
