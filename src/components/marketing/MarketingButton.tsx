import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "ghost";
type Size = "md" | "lg";

interface MarketingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-royal text-white shadow-lg shadow-royal/25 hover:bg-royal-600 hover:shadow-xl hover:shadow-royal/30 dark:bg-royal-400 dark:hover:bg-royal-100 dark:hover:text-royal-900",
  gold: "bg-gold text-royal-900 shadow-lg shadow-gold/30 hover:bg-gold-400 hover:shadow-xl",
  outline:
    "border-2 border-royal/20 bg-white/70 text-royal backdrop-blur-md hover:border-royal/40 hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
  ghost: "bg-transparent text-royal hover:bg-royal/5 dark:text-white dark:hover:bg-white/10",
};

const sizeClasses: Record<Size, string> = {
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

export const MarketingButton = forwardRef<HTMLButtonElement, MarketingButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-jakarta font-semibold tracking-tight",
          "transition-all duration-300 ease-out active:scale-[0.97]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
MarketingButton.displayName = "MarketingButton";
