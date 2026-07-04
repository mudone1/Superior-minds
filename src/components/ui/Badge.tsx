import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeTone = "indigo" | "brass" | "sage" | "rose" | "neutral";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  brass: "bg-brass-50 text-brass-600 border-brass-100",
  sage: "bg-sage-50 text-sage-600 border-sage-100",
  rose: "bg-rose-50 text-rose border-rose/20",
  neutral: "bg-ink/5 text-ink-500 border-ink-300/30",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
