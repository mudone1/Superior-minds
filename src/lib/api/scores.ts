"use client";

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiClientError";
  }
}

async function apiCall<TOutput>(path: string, body: object): Promise<TOutput> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

export function saveScores(input: {
  armId: string;
  subjectId: string;
  termId: string;
  entries: Array<{ studentId: string; caScore: number | null; examScore: number | null }>;
}) {
  return apiCall<{ ok: true; saved: number; skippedLocked: number }>("/api/teacher/scores", input);
}

export function submitScores(input: { armId: string; subjectId: string; termId: string }) {
  return apiCall<{ ok: true; submitted: number }>("/api/teacher/scores/submit", input);
}
