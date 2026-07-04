"use client";

import type { EditStudentFormValues, StudentFormValues } from "@/lib/validation/student";

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiClientError";
  }
}

async function apiCall<TOutput>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: object
): Promise<TOutput> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiClientError(0, "Couldn't reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message: string = payload.error || "Something went wrong. Please try again.";
    throw new ApiClientError(res.status, message);
  }

  return res.json() as Promise<TOutput>;
}

export function createStudent(input: StudentFormValues): Promise<{ id: string }> {
  return apiCall("/api/admin/students", "POST", input);
}

export function updateStudent(id: string, input: Partial<EditStudentFormValues>): Promise<{ ok: true }> {
  return apiCall(`/api/admin/students/${id}`, "PATCH", input);
}

export function promoteStudent(id: string, classLevel: string, arm: string): Promise<{ ok: true }> {
  return apiCall(`/api/admin/students/${id}/promote`, "POST", { class: classLevel, arm });
}

export function transferStudent(id: string, note: string): Promise<{ ok: true }> {
  return apiCall(`/api/admin/students/${id}/transfer`, "POST", { note });
}

export function archiveStudent(id: string): Promise<{ ok: true }> {
  return apiCall(`/api/admin/students/${id}/archive`, "POST");
}

export function restoreStudent(id: string): Promise<{ ok: true }> {
  return apiCall(`/api/admin/students/${id}/restore`, "POST");
}

export function updateSchoolSettings(allowStaffAddStudents: boolean): Promise<{ ok: true }> {
  return apiCall("/api/admin/settings", "PATCH", { allowStaffAddStudents });
}
