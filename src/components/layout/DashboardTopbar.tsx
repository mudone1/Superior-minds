"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getInitials, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface DashboardTopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function DashboardTopbar({ title, onMenuClick }: DashboardTopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    router.replace(ROUTES.login);
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-ink-300/20 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-ink-500 hover:bg-ink/5 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-ink/5"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo font-mono text-xs font-semibold text-white">
            {getInitials(user?.displayName ?? user?.email ?? "?")}
          </span>
          <span className="hidden text-sm font-medium text-ink sm:block">
            {user?.displayName}
          </span>
          <ChevronDown className="h-4 w-4 text-ink-500" aria-hidden="true" />
        </button>

        <div
          role="menu"
          className={cn(
            "absolute right-0 mt-2 w-48 origin-top-right rounded-md border border-ink-300/20 bg-white py-1 shadow-panel transition",
            menuOpen ? "visible opacity-100" : "invisible opacity-0"
          )}
        >
          <div className="border-b border-ink-300/20 px-3 py-2">
            <p className="truncate text-sm font-medium text-ink">{user?.displayName}</p>
            <p className="truncate text-xs text-ink-500">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
