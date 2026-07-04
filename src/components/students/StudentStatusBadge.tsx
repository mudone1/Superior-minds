import { Badge } from "@/components/ui/Badge";
import { STUDENT_STATUS_LABELS, type StudentStatus } from "@/types";

const STATUS_TONE: Record<StudentStatus, "indigo" | "brass" | "sage" | "rose" | "neutral"> = {
  active: "sage",
  promoted: "indigo",
  transferred: "brass",
  graduated: "indigo",
  archived: "neutral",
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STUDENT_STATUS_LABELS[status]}</Badge>;
}
