"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, required, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
          {label}
          {required && <span className="ml-0.5 text-brass-600">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "h-11 rounded-md border border-ink-300/60 bg-white px-3 text-sm text-ink placeholder:text-ink-300",
            "transition-colors focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20",
            error && "border-rose focus:border-rose focus:ring-rose/20",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-rose" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-sm text-ink-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
