import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { ROUTES } from "@/lib/constants";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form column */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link href={ROUTES.home} className="mb-10 inline-block">
            <Logo />
          </Link>
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-2 text-sm text-ink-500">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-sm text-ink-500">{footer}</div>}
        </div>
      </div>

      {/* Signature ledger panel */}
      <div className="relative hidden overflow-hidden bg-indigo lg:block">
        <div className="absolute inset-0 bg-ledger-lines opacity-40" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-16">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-brass-400">
            Record No. 001 — Access Ledger
          </div>
          <blockquote className="font-display text-3xl font-medium leading-snug text-white">
            “Every student, every score, every step of progress — kept in one
            trusted record.”
          </blockquote>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-white/20" />
            <span className="font-mono text-xs uppercase tracking-widest text-indigo-100">
              Superior Minds Academy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
