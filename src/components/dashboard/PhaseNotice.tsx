import { Construction } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

interface PhaseNoticeProps {
  items: string[];
}

export function PhaseNotice({ items }: PhaseNoticeProps) {
  return (
    <Card className="border-dashed">
      <CardBody className="flex gap-4">
        <Construction className="h-5 w-5 shrink-0 text-brass-600" aria-hidden="true" />
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            Coming in the next phase
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink-500">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
