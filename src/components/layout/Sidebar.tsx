"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  BookOpen,
  ClipboardList,
  Banknote,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV, type DashboardNavItem } from "@/lib/navigation";
import { ROLE_LABELS, type UserRole } from "@/types";
import { Logo } from "./Logo";
import { Badge } from "@/components/ui/Badge";

const ICONS: Record<DashboardNavItem["icon"], LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  users: Users,
  "graduation-cap": GraduationCap,
  "user-cog": UserCog,
  "book-open": BookOpen,
  "clipboard-list": ClipboardList,
  banknote: Banknote,
  settings: Settings,
  "shield-check": Settings,
  "user-round": UserRound,
};

interface SidebarProps {
  role: UserRole;
  onNavigate?: () => void;
}

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const items = DASHBOARD_NAV[role];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-ink-300/20 bg-white">
      <div className="flex h-16 items-center border-b border-ink-300/20 px-5">
        <Logo />
      </div>

      <div className="px-5 py-4">
        <Badge tone="brass">{ROLE_LABELS[role]}</Badge>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-ink-500 hover:bg-ink/5 hover:text-ink"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
