import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS, type UserRole } from "@/types";

const ROLE_TONE: Record<UserRole, "indigo" | "brass" | "sage" | "rose" | "neutral"> = {
  "super-admin": "rose",
  administrator: "brass",
  "administrative-staff": "indigo",
  teacher: "sage",
  parent: "neutral",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge tone={ROLE_TONE[role]}>{ROLE_LABELS[role]}</Badge>;
}
