import Link from "next/link";
import { BookOpen, Users, ClipboardCheck, CalendarCheck2, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardBody } from "@/components/ui/Card";
import { WelcomeBanner, StatCard } from "@/components/dashboard";
import { getTeacherOverviewStats, getTeacherClassSummaries } from "@/lib/server/getTeacherOverviewStats";

export default async function TeacherDashboardPage() {
  const user = await requireRole("teacher");
  const [stats, classSummaries] = await Promise.all([
    getTeacherOverviewStats(user.uid),
    getTeacherClassSummaries(user.uid),
  ]);

  return (
    <DashboardShell role="teacher" title="Teacher Overview">
      <div className="flex flex-col gap-6">
        <WelcomeBanner
          user={user}
          blurb="Your classes, gradebook, and attendance records live here."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="My Classes" value={String(stats.classCount)} icon={BookOpen} tone="indigo" />
          <StatCard label="Total Students" value={String(stats.studentCount)} icon={Users} tone="brass" />
          <StatCard label="Assignments Due" value="0" icon={ClipboardCheck} tone="sage" />
          <StatCard label="Today's Sessions" value="0" icon={CalendarCheck2} tone="indigo" />
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-ink">My Classes</h2>
          {classSummaries.length === 0 ? (
            <Card>
              <CardBody className="py-8 text-center text-sm text-ink-500">
                You haven&apos;t been assigned to any class yet. Ask an Administrator to assign
                you under Academic Setup.
              </CardBody>
            </Card>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classSummaries.map((c) => (
                <Card key={c.armId}>
                  <CardBody>
                    <p className="font-display text-base font-semibold text-ink">
                      {c.className} {c.armName}
                    </p>
                    <p className="mt-1 text-sm text-ink-500">{c.subjects.join(", ")}</p>
                    <Link
                      href="/dashboard/teacher/gradebook"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
                    >
                      Open Gradebook
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
