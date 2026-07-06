"use client";

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
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

// ── Sessions ───────────────────────────────────────────────────────────
export function createSession(input: { name: string; startDate?: string | null; endDate?: string | null }) {
  return apiCall<{ id: string }>("/api/admin/academic/sessions", "POST", input);
}
export function updateSession(id: string, input: Partial<{ name: string; startDate: string | null; endDate: string | null }>) {
  return apiCall<{ ok: true }>(`/api/admin/academic/sessions/${id}`, "PATCH", input);
}
export function deleteSession(id: string) {
  return apiCall<{ ok: true }>(`/api/admin/academic/sessions/${id}`, "DELETE");
}

// ── Terms ──────────────────────────────────────────────────────────────
export function createTerm(input: { sessionId: string; name: string; order: number; startDate?: string | null; endDate?: string | null }) {
  return apiCall<{ id: string }>("/api/admin/academic/terms", "POST", input);
}
export function updateTerm(id: string, input: Partial<{ name: string; order: number; startDate: string | null; endDate: string | null }>) {
  return apiCall<{ ok: true }>(`/api/admin/academic/terms/${id}`, "PATCH", input);
}
export function deleteTerm(id: string) {
  return apiCall<{ ok: true }>(`/api/admin/academic/terms/${id}`, "DELETE");
}

// ── Classes ────────────────────────────────────────────────────────────
export function createClass(input: { name: string; order: number }) {
  return apiCall<{ id: string }>("/api/admin/academic/classes", "POST", input);
}
export function updateClass(id: string, input: Partial<{ name: string; order: number }>) {
  return apiCall<{ ok: true }>(`/api/admin/academic/classes/${id}`, "PATCH", input);
}
export function deleteClass(id: string) {
  return apiCall<{ ok: true }>(`/api/admin/academic/classes/${id}`, "DELETE");
}

// ── Class Arms ─────────────────────────────────────────────────────────
export function createArm(classId: string, input: { name: string }) {
  return apiCall<{ id: string }>(`/api/admin/academic/classes/${classId}/arms`, "POST", input);
}
export function updateArm(armId: string, input: { name: string }) {
  return apiCall<{ ok: true }>(`/api/admin/academic/arms/${armId}`, "PATCH", input);
}
export function deleteArm(armId: string) {
  return apiCall<{ ok: true }>(`/api/admin/academic/arms/${armId}`, "DELETE");
}

// ── Subjects ───────────────────────────────────────────────────────────
export function createSubject(input: { name: string; code?: string | null }) {
  return apiCall<{ id: string }>("/api/admin/academic/subjects", "POST", input);
}
export function updateSubject(id: string, input: Partial<{ name: string; code: string | null }>) {
  return apiCall<{ ok: true }>(`/api/admin/academic/subjects/${id}`, "PATCH", input);
}
export function deleteSubject(id: string) {
  return apiCall<{ ok: true }>(`/api/admin/academic/subjects/${id}`, "DELETE");
}

// ── Assignments ────────────────────────────────────────────────────────
export function assignClassSubject(input: { classId: string; subjectId: string }) {
  return apiCall<{ id: string }>("/api/admin/academic/assignments/class-subjects", "POST", input);
}
export function unassignClassSubject(id: string) {
  return apiCall<{ ok: true }>("/api/admin/academic/assignments/class-subjects", "DELETE", { id });
}

export function assignClassTeacher(input: { armId: string; teacherUid: string }) {
  return apiCall<{ id: string }>("/api/admin/academic/assignments/class-teachers", "POST", input);
}
export function unassignClassTeacher(id: string) {
  return apiCall<{ ok: true }>("/api/admin/academic/assignments/class-teachers", "DELETE", { id });
}

export function assignTeacherSubject(input: { armId: string; subjectId: string; teacherUid: string }) {
  return apiCall<{ id: string }>("/api/admin/academic/assignments/teacher-subjects", "POST", input);
}
export function unassignTeacherSubject(id: string) {
  return apiCall<{ ok: true }>("/api/admin/academic/assignments/teacher-subjects", "DELETE", { id });
}

// ── Academic Settings (current session/term) ────────────────────────────
export function updateAcademicSettings(input: { currentSessionId?: string | null; currentTermId?: string | null }) {
  return apiCall<{ ok: true }>("/api/admin/academic/settings", "PATCH", input);
}
