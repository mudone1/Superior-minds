import { requireAdminLevel } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SettingsClient } from "./SettingsClient";
import { adminDb } from "@/lib/firebase/admin";
import { SETTINGS_DOC_PATH } from "@/lib/firebase/settings";

export default async function SettingsPage() {
  const user = await requireAdminLevel();

  const settingsSnap = await adminDb.doc(SETTINGS_DOC_PATH).get();
  const allowStaffAddStudents = settingsSnap.exists
    ? Boolean(settingsSnap.data()?.allowStaffAddStudents)
    : false;

  return (
    <DashboardShell role={user.role} title="Settings">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Settings</h2>
          <p className="mt-1 text-sm text-ink-500">School-wide preferences and permissions.</p>
        </div>
        <SettingsClient initialAllowStaffAddStudents={allowStaffAddStudents} />
      </div>
    </DashboardShell>
  );
}
