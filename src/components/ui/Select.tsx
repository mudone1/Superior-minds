"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, className, required, options, placeholder, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;
    const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink-700">
            {label}
            {required && <span className="ml-0.5 text-brass-600">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "h-11 w-full appearance-none rounded-md border border-ink-300/60 bg-white px-3 pr-9 text-sm text-ink",
              "transition-colors focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20",
              error && "border-rose focus:border-rose focus:ring-rose/20",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300"
            aria-hidden="true"
          />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-rose" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${selectId}-hint`} className="text-sm text-ink-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
