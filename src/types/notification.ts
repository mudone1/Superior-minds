import type { UserRole } from "./user";

export const NOTIFICATION_CATEGORIES = [
  "general",
  "pta-meeting",
  "holiday",
  "closing-time",
  "timetable-change",
  "result",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  general: "General",
  "pta-meeting": "PTA Meeting",
  holiday: "Holiday",
  "closing-time": "Closing Time",
  "timetable-change": "Timetable Change",
  result: "Result Published",
};

/**
 * Who a notification goes to. `roles` and `users` are mutually exclusive
 * with each other but not with anything else — `all` means every signed-in
 * account regardless of role.
 */
export type NotificationTargetType = "all" | "roles" | "users";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  targetType: NotificationTargetType;
  targetRoles?: UserRole[];
  targetUids?: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  /** uids who have marked this notification as read in-app. */
  readBy: string[];
}

export interface CreateNotificationInput {
  title: string;
  body: string;
  category: NotificationCategory;
  targetType: NotificationTargetType;
  targetRoles?: UserRole[];
  targetUids?: string[];
}
