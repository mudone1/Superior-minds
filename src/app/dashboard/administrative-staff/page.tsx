import { ClipboardList, BookOpen, UserPlus, FileCheck2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { WelcomeBanner, StatCard, PhaseNotice } from "@/components/dashboard";

export default async function AdministrativeStaffDashboardPage() {
  const user = await requireRole("administrative-staff");

  return (
    <DashboardShell role="administrative-staff" title="Administrative Staff Overview">
      <div className="flex flex-col gap-6">
        <WelcomeBanner
          user={user}
          blurb="Handle admissions, records, and front-office coordination for the academy."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="New Applications" value="0" icon={UserPlus} tone="indigo" />
          <StatCard label="Records Updated Today" value="0" icon={FileCheck2} tone="brass" />
          <StatCard label="Open Tasks" value="0" icon={ClipboardList} tone="sage" />
          <StatCard label="Documents on File" value="—" icon={BookOpen} tone="indigo" />
        </div>

        <PhaseNotice
          items={[
            "Process admissions and enrollment forms",
            "Maintain student and staff records",
            "Coordinate front-office communications",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
