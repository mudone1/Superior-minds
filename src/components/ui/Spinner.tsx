import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = "Loading…" }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-ink-500" role="status">
      <Loader2 className={cn("h-5 w-5 animate-spin text-indigo", className)} aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-paper">
      <Spinner label={label} />
    </div>
  );
}
