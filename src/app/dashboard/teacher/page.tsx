import { BookOpen, Users, ClipboardCheck, CalendarCheck2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { WelcomeBanner, StatCard, PhaseNotice } from "@/components/dashboard";

export default async function TeacherDashboardPage() {
  const user = await requireRole("teacher");

  return (
    <DashboardShell role="teacher" title="Teacher Overview">
      <div className="flex flex-col gap-6">
        <WelcomeBanner
          user={user}
          blurb="Your classes, gradebook, and attendance records live here."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="My Classes" value="0" icon={BookOpen} tone="indigo" />
          <StatCard label="Total Students" value="0" icon={Users} tone="brass" />
          <StatCard label="Assignments Due" value="0" icon={ClipboardCheck} tone="sage" />
          <StatCard label="Today's Sessions" value="0" icon={CalendarCheck2} tone="indigo" />
        </div>

        <PhaseNotice
          items={[
            "Take attendance for each class session",
            "Record and publish grades to the gradebook",
            "Message parents directly about student progress",
          ]}
        />
      </div>
    </DashboardShell>
  );
}
