import { UserRound, GraduationCap, Banknote, Bell } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { WelcomeBanner, StatCard, PhaseNotice } from "@/components/dashboard";

export default async function ParentDashboardPage() {
  const user = await requireRole("parent");

  return (
    <DashboardShell role="parent" title="Parent Overview">
      <div className="flex flex-col gap-6">
        <WelcomeBanner
          user={user}
          blurb="Follow your child's attendance, grades, and fee statements in one place."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Children Linked" value="0" icon={UserRound} tone="indigo" />
          <StatCard label="Average Grade" value="—" icon={GraduationCap} tone="brass" />
          <StatCard label="Fee Balance" value="$0.00" icon={Banknote} tone="sage" />
          <StatCard label="New Notices" value="0" icon={Bell} tone="indigo" />
        </div>

        <PhaseNotice
          items={[
            "Link and view each child's academic record",
            "Receive attendance and grade notifications",
            "Pay outstanding fees online",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
