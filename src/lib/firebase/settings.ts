import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "./config";
import { DEFAULT_SCHOOL_SETTINGS, type SchoolSettings } from "@/types";

export const SETTINGS_COLLECTION = "settings";
export const SETTINGS_DOC_ID = "general";
/** Full path form, handy for the Admin SDK's `adminDb.doc(path)` on the server. */
export const SETTINGS_DOC_PATH = `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`;

/**
 * Reads the singleton school settings document. Falls back to sensible
 * defaults (permission off) if the document doesn't exist yet — it's only
 * created the first time an Administrator saves a change from the
 * Settings page.
 */
export async function getSchoolSettings(): Promise<SchoolSettings> {
  await auth.authStateReady();
  const snap = await getDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID));
  if (!snap.exists()) return DEFAULT_SCHOOL_SETTINGS;
  const data = snap.data();
  return {
    allowStaffAddStudents: Boolean(data.allowStaffAddStudents),
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? null,
    updatedBy: data.updatedBy ?? null,
  };
}
