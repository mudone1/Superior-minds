import { requireAdminLevel } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserManagementClient } from "./UserManagementClient";

export default async function UsersManagementPage() {
  const user = await requireAdminLevel();

  return (
    <DashboardShell role={user.role} title="User Management">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Users</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Add, edit, and manage accounts for every role at Superior Minds Academy. Only
            Administrators and the Super Admin can create accounts, change roles, reset
            passwords, or remove access.
          </p>
        </div>
        <UserManagementClient currentUser={user} />
      </div>
    </DashboardShell>
  );
}
