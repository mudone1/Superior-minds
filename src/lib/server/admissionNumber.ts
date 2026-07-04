import { adminDb } from "@/lib/firebase/admin";

const COUNTERS_COLLECTION = "counters";

/**
 * Atomically produces the next admission number for a given admission year,
 * in the format `SMA/YYN###` (e.g. `SMA/24N001`, `SMA/24N002`, ...).
 *
 * Each admission year gets its own counter document
 * (`counters/admissionNumber_{YY}`), and the sequence restarts at 001 for
 * every new year. A Firestore transaction is used — not a plain read-then-
 * write — so two staff members saving new students at the same instant can
 * never be handed the same number (the exact class of bug that previously
 * caused ID collisions in another one of this school's systems).
 */
export async function getNextAdmissionNumber(admissionYear: number): Promise<string> {
  const yy = String(admissionYear % 100).padStart(2, "0");
  const counterRef = adminDb.collection(COUNTERS_COLLECTION).doc(`admissionNumber_${yy}`);

  const nextSequence = await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(counterRef);
    const current = (snap.exists ? (snap.data()?.lastSequence as number | undefined) : 0) ?? 0;
    const next = current + 1;
    transaction.set(counterRef, { lastSequence: next }, { merge: true });
    return next;
  });

  const sequencePart = String(nextSequence).padStart(3, "0");
  return `SMA/${yy}N${sequencePart}`;
}

/** Derives the 2-digit admission year from an ISO date string (yyyy-mm-dd), falling back to the current year if unparseable. */
export function admissionYearFromDate(admissionDate: string): number {
  const year = Number(admissionDate.slice(0, 4));
  return Number.isFinite(year) && year > 1900 ? year : new Date().getFullYear();
}
