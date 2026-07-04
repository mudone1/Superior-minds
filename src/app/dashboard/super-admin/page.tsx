import { Building2, Users, ShieldCheck, ServerCog } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { WelcomeBanner, StatCard, PhaseNotice } from "@/components/dashboard";

export default async function SuperAdminDashboardPage() {
  const user = await requireRole("super-admin");

  return (
    <DashboardShell role="super-admin" title="Super Admin Overview">
      <div className="flex flex-col gap-6">
        <WelcomeBanner
          user={user}
          blurb="You have system-wide access across every campus, staff account, and configuration setting."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Campuses" value="1" icon={Building2} tone="indigo" />
          <StatCard label="Total Staff" value="—" icon={Users} tone="brass" />
          <StatCard label="Active Roles" value="5" icon={ShieldCheck} tone="sage" />
          <StatCard label="System Health" value="OK" icon={ServerCog} tone="indigo" />
        </div>

        <PhaseNotice
          items={[
            "Manage campuses and system-wide settings",
            "Create and deactivate accounts for every role",
            "View platform-wide audit logs",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
