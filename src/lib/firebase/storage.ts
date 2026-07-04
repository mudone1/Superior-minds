import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./config";

/**
 * Upload a user's avatar and return its public download URL.
 * Stored at avatars/{uid}/{filename} — matched by storage.rules.
 */
export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const path = `avatars/${uid}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Upload a student's passport photograph and return its public download
 * URL. Stored at students/{studentId}/{filename} — matched by
 * storage.rules. Like avatars, this requires Firebase Storage to be
 * provisioned on the project; callers should treat a rejected promise
 * here as non-fatal and let the rest of the record save regardless.
 */
export async function uploadStudentPassport(studentId: string, file: File): Promise<string> {
  const path = `students/${studentId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Generic uploader for role-scoped document folders, e.g. report cards,
 * enrollment forms. Keeps the path convention centralized in one place.
 */
export async function uploadDocument(
  folder: string,
  ownerId: string,
  file: File
): Promise<string> {
  const path = `documents/${folder}/${ownerId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}
