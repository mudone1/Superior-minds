import "server-only";
import { NextResponse } from "next/server";

/** Thrown by API route handlers; caught once at the top and turned into a JSON error response. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export function apiErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[api/admin/users] unexpected error", err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
