import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { dashboardPathForRole } from "@/lib/roles";

export default async function DashboardIndexPage() {
  const user = await requireSession();
  redirect(dashboardPathForRole(user.role));
}
