"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { listMyNotifications, markNotificationRead } from "@/lib/firebase/notifications";
import { NOTIFICATION_CATEGORY_LABELS, type AppNotification } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listMyNotifications(user)
      .then((n) => {
        if (!cancelled) setNotifications(n);
      })
      .catch(() => {});
    // Light polling keeps the badge reasonably fresh without needing a
    // realtime listener for what's a low-frequency, non-critical count.
    const interval = setInterval(() => {
      listMyNotifications(user)
        .then((n) => {
          if (!cancelled) setNotifications(n);
        })
        .catch(() => {});
    }, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.readBy.includes(user.uid)).length;

  async function handleOpenNotification(n: AppNotification) {
    if (!user) return;
    if (!n.readBy.includes(user.uid)) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, readBy: [...item.readBy, user.uid] } : item))
      );
      markNotificationRead(n.id, user.uid).catch(() => {});
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink/5"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 mt-2 w-80 origin-top-right rounded-md border border-ink-300/20 bg-white py-1 shadow-panel transition",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-300/20 px-3 py-2">
          <p className="text-sm font-medium text-ink">Notifications</p>
          <Link href="/dashboard/notifications" className="text-xs text-indigo-600 hover:underline" onClick={() => setOpen(false)}>
            View all
          </Link>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-ink-500">No notifications yet.</p>
          )}
          {notifications.slice(0, 8).map((n) => {
            const isUnread = !n.readBy.includes(user.uid);
            return (
              <Link
                key={n.id}
                href="/dashboard/notifications"
                onClick={() => {
                  handleOpenNotification(n);
                  setOpen(false);
                }}
                className={cn("block border-b border-ink-300/10 px-3 py-2.5 last:border-0 hover:bg-ink/[0.02]", isUnread && "bg-indigo-50/50")}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-ink">{n.title}</p>
                  {isUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo" />}
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{n.body}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-ink-300">
                  {NOTIFICATION_CATEGORY_LABELS[n.category]} · {dateFormatter.format(new Date(n.createdAt))}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
