import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./config";
import type { AppUser } from "@/types";

export const USERS_COLLECTION = "users";

/** Fetch a single user's profile document by uid. Returns null if it doesn't exist yet. */
export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snap.exists()) return null;
  return snap.data() as AppUser;
}

/** Create the Firestore profile document that accompanies a new Firebase Auth account. */
export async function createUserProfile(profile: AppUser): Promise<void> {
  await setDoc(doc(db, USERS_COLLECTION, profile.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(uid: string, changes: Partial<AppUser>): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}
