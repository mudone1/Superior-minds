import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, type AccountStatus } from "@/types";

const STATUS_TONE: Record<AccountStatus, "indigo" | "brass" | "sage" | "rose" | "neutral"> = {
  active: "sage",
  suspended: "rose",
  pending: "brass",
};

export function StatusBadge({ status }: { status: AccountStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Badge>;
}
