import { UserCog, GraduationCap, Banknote, ClipboardCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { WelcomeBanner, StatCard, PhaseNotice } from "@/components/dashboard";

export default async function AdministratorDashboardPage() {
  const user = await requireRole("administrator");

  return (
    <DashboardShell role="administrator" title="Administrator Overview">
      <div className="flex flex-col gap-6">
        <WelcomeBanner
          user={user}
          blurb="Manage staff, students, and the school's daily operations from here."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Staff On Record" value="—" icon={UserCog} tone="indigo" />
          <StatCard label="Enrolled Students" value="—" icon={GraduationCap} tone="brass" />
          <StatCard label="Outstanding Fees" value="—" icon={Banknote} tone="sage" />
          <StatCard label="Pending Approvals" value="0" icon={ClipboardCheck} tone="indigo" />
        </div>

        <PhaseNotice
          items={[
            "Approve staff and student record changes",
            "Review school-wide attendance and performance",
            "Manage fee structures and finance reports",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
