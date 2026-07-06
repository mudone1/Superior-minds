"use client";

import { useEffect, useState } from "react";
import { Send, BellRing } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { listMyNotifications, markNotificationRead } from "@/lib/firebase/notifications";
import { sendNotification, registerPushToken, ApiClientError } from "@/lib/api/notifications";
import { setupPushNotifications, listenForForegroundMessages } from "@/lib/firebase/messaging";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_LABELS,
  ROLE_LABELS,
  ROLES,
  isAdminLevelRole,
  type AppNotification,
  type NotificationTargetType,
  type SessionUser,
  type UserRole,
} from "@/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

interface NotificationsClientProps {
  currentUser: SessionUser;
}

export function NotificationsClient({ currentUser }: NotificationsClientProps) {
  const canCompose = isAdminLevelRole(currentUser.role);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pushStatus, setPushStatus] = useState<"unknown" | "unsupported" | "default" | "granted" | "denied">(
    "unknown"
  );
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<(typeof NOTIFICATION_CATEGORIES)[number]>("general");
  const [targetType, setTargetType] = useState<NotificationTargetType>("all");
  const [targetRoles, setTargetRoles] = useState<UserRole[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  async function loadNotifications() {
    setLoading(true);
    setError(null);
    try {
      setNotifications(await listMyNotifications(currentUser));
    } catch {
      setError("Couldn't load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission === "granted" ? "granted" : Notification.permission === "denied" ? "denied" : "default");
    } else {
      setPushStatus("unsupported");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    listenForForegroundMessages((notifTitle) => {
      setPushMessage(`New: ${notifTitle}`);
      loadNotifications();
    }).then((unsub) => {
      unsubscribe = unsub;
    });
    return () => unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleEnablePush() {
    setPushBusy(true);
    setPushMessage(null);
    const result = await setupPushNotifications();
    if (result.status === "granted") {
      try {
        await registerPushToken(result.token);
        setPushStatus("granted");
        setPushMessage("Push notifications are on for this device.");
      } catch {
        setPushMessage("Got permission, but couldn't save the device to your account. Try again.");
      }
    } else if (result.status === "denied") {
      setPushStatus("denied");
      setPushMessage("Notifications are blocked for this site in your browser settings.");
    } else if (result.status === "unsupported") {
      setPushStatus("unsupported");
      setPushMessage("Push notifications aren't supported in this browser.");
    } else {
      setPushMessage(result.message);
    }
    setPushBusy(false);
  }

  async function handleMarkRead(n: AppNotification) {
    if (n.readBy.includes(currentUser.uid)) return;
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, readBy: [...item.readBy, currentUser.uid] } : item))
    );
    markNotificationRead(n.id, currentUser.uid).catch(() => {});
  }

  async function handleSend() {
    setSending(true);
    setSendResult(null);
    setError(null);
    try {
      const result = await sendNotification({
        title: title.trim(),
        body: body.trim(),
        category,
        targetType,
        targetRoles: targetType === "roles" ? targetRoles : undefined,
      });
      setSendResult(
        `Sent. Delivered push to ${result.pushSent} device${result.pushSent === 1 ? "" : "s"}${
          result.pushFailed > 0 ? ` (${result.pushFailed} failed)` : ""
        }.`
      );
      setTitle("");
      setBody("");
      setTargetRoles([]);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't send notification.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {pushStatus !== "granted" && pushStatus !== "unsupported" && (
        <Alert variant="info">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Enable push notifications to get alerts even when the app isn&apos;t open.</span>
            <Button size="sm" variant="outline" onClick={handleEnablePush} isLoading={pushBusy}>
              <BellRing className="h-4 w-4" />
              Enable Notifications
            </Button>
          </div>
        </Alert>
      )}
      {pushMessage && <Alert variant={pushStatus === "granted" ? "success" : "info"}>{pushMessage}</Alert>}

      {canCompose && (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
              Send Announcement
            </h3>
            {error && <Alert variant="error">{error}</Alert>}
            {sendResult && <Alert variant="success">{sendResult}</Alert>}

            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. PTA Meeting — Saturday" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Details for the recipients…"
                className="w-full rounded-md border border-ink-300/60 bg-white p-3 text-sm text-ink placeholder:text-ink-300 focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                options={NOTIFICATION_CATEGORIES.map((c) => ({ value: c, label: NOTIFICATION_CATEGORY_LABELS[c] }))}
              />
              <Select
                label="Send To"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as NotificationTargetType)}
                options={[
                  { value: "all", label: "Everyone" },
                  { value: "roles", label: "Specific Roles" },
                ]}
              />
            </div>

            {targetType === "roles" && (
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => {
                  const checked = targetRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        setTargetRoles((prev) => (checked ? prev.filter((r) => r !== role) : [...prev, role]))
                      }
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        checked
                          ? "border-indigo bg-indigo-50 text-indigo-600"
                          : "border-ink-300/40 text-ink-500 hover:bg-ink/5"
                      }`}
                    >
                      {ROLE_LABELS[role]}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleSend}
                isLoading={sending}
                disabled={!title.trim() || !body.trim() || (targetType === "roles" && targetRoles.length === 0)}
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="py-10">
            <Spinner label="Loading notifications…" />
          </div>
        ) : error && notifications.length === 0 ? (
          <p className="p-6 text-sm text-rose">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-500">No notifications yet.</p>
        ) : (
          <div className="divide-y divide-ink-300/10">
            {notifications.map((n) => {
              const isUnread = !n.readBy.includes(currentUser.uid);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleMarkRead(n)}
                  className={`flex w-full flex-col gap-1.5 px-6 py-4 text-left transition-colors hover:bg-ink/[0.02] ${
                    isUnread ? "bg-indigo-50/40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink">{n.title}</p>
                      {isUnread && <span className="h-2 w-2 rounded-full bg-indigo" />}
                    </div>
                    <Badge tone="brass">{NOTIFICATION_CATEGORY_LABELS[n.category]}</Badge>
                  </div>
                  <p className="text-sm text-ink-500">{n.body}</p>
                  <p className="text-xs text-ink-300">
                    From {n.createdByName} · {dateFormatter.format(new Date(n.createdAt))}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
