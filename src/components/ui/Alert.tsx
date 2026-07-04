import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const variantConfig: Record<AlertVariant, { classes: string; Icon: typeof Info }> = {
  error: { classes: "border-rose/30 bg-rose-50 text-rose", Icon: AlertTriangle },
  success: { classes: "border-sage/30 bg-sage-50 text-sage-600", Icon: CheckCircle2 },
  info: { classes: "border-indigo/20 bg-indigo-50 text-indigo-600", Icon: Info },
};

export function Alert({ variant = "info", children, className }: AlertProps) {
  const { classes, Icon } = variantConfig[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-4 py-3 text-sm",
        classes,
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
