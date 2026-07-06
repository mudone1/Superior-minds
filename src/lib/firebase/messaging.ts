"use client";

import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";
import app from "./config";

let messagingInstance: Messaging | null = null;

async function getMessagingInstance(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;
  // Push isn't supported everywhere (notably iOS Safari before 16.4, and
  // any non-HTTPS/non-localhost origin) — check first rather than letting
  // getMessaging() throw somewhere deep in a click handler.
  if (!(await isSupported())) return null;
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export type PushSetupResult =
  | { status: "unsupported" }
  | { status: "denied" }
  | { status: "granted"; token: string }
  | { status: "error"; message: string };

/**
 * Requests notification permission (must be called from a user gesture —
 * a button click, not on page load) and, if granted, retrieves an FCM
 * registration token tied to this browser's service worker.
 */
export async function setupPushNotifications(): Promise<PushSetupResult> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { status: "unsupported" };
  }

  const messaging = await getMessagingInstance();
  if (!messaging) return { status: "unsupported" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { status: "denied" };

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    return {
      status: "error",
      message: "Push isn't configured yet — missing NEXT_PUBLIC_FIREBASE_VAPID_KEY.",
    };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (!token) return { status: "error", message: "Couldn't generate a push token. Try again." };
    return { status: "granted", token };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Couldn't enable push notifications." };
  }
}

/** Shows an in-app toast/callback for pushes that arrive while the tab is open — the browser won't surface a system notification for these on its own. */
export async function listenForForegroundMessages(
  onMessageReceived: (title: string, body: string) => void
): Promise<() => void> {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    onMessageReceived(payload.notification?.title ?? "Superior Minds Academy", payload.notification?.body ?? "");
  });
}
