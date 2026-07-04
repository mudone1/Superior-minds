"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import type { UserRole } from "@/types";

interface DashboardShellProps {
  role: UserRole;
  title: string;
  children: ReactNode;
}

export function DashboardShell({ role, title, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar role={role} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative h-full">
            <Sidebar role={role} onNavigate={() => setMobileOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-ink-500 hover:bg-ink/5"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
