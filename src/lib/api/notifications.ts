"use client";

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiClientError";
  }
}

async function apiCall<TOutput>(path: string, method: "POST", body?: object): Promise<TOutput> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new ApiClientError(0, "Couldn't reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new ApiClientError(res.status, payload.error || "Something went wrong. Please try again.");
  }

  return res.json() as Promise<TOutput>;
}

export function sendNotification(input: {
  title: string;
  body: string;
  category: string;
  targetType: "all" | "roles" | "users";
  targetRoles?: string[];
  targetUids?: string[];
}) {
  return apiCall<{ id: string; pushSent: number; pushFailed: number }>(
    "/api/admin/notifications",
    "POST",
    input
  );
}

export function registerPushToken(token: string) {
  return apiCall<{ ok: true }>("/api/notifications/register-token", "POST", { token });
}
