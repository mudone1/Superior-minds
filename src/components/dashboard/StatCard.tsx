import type { LucideIcon } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "indigo" | "brass" | "sage";
}

const toneClasses = {
  indigo: "bg-indigo-50 text-indigo-600",
  brass: "bg-brass-50 text-brass-600",
  sage: "bg-sage-50 text-sage-600",
};

export function StatCard({ label, value, icon: Icon, tone = "indigo" }: StatCardProps) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
        </div>
        <span className={cn("rounded-lg p-2.5", toneClasses[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </CardBody>
    </Card>
  );
}
