import { requireSession } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const user = await requireSession();

  return (
    <DashboardShell role={user.role} title="Notifications">
      <NotificationsClient currentUser={user} />
    </DashboardShell>
  );
}
