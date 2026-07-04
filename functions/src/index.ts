import { initializeApp } from "firebase-admin/app";
import { getAuth, type UpdateRequest } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onUserDeleted } from "firebase-functions/v2/auth";
import { logger } from "firebase-functions/v2";
import { ADMIN_LEVEL_ROLES, isValidRole, type UserRole } from "./roles";

initializeApp();
const auth = getAuth();
const db = getFirestore();

const USERS_COLLECTION = "users";

/** Random, human-typeable temporary password: 12 chars drawn from an unambiguous alphabet. */
function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

interface CallerContext {
  uid: string;
  role: UserRole;
}

/** Confirms the caller is signed in and holds an admin-level role. Every mutating callable in this file starts here. */
function requireAdminCaller(request: { auth?: { uid: string; token?: { role?: string } } }): CallerContext {
  const callerUid = request.auth?.uid;
  if (!callerUid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  const callerRole = request.auth?.token?.role;
  if (!callerRole || !ADMIN_LEVEL_ROLES.includes(callerRole as UserRole)) {
    throw new HttpsError(
      "permission-denied",
      "Only Super Admin or Administrator accounts can manage users."
    );
  }
  return { uid: callerUid, role: callerRole as UserRole };
}

/**
 * Administrator-level accounts (Administrator, Super Admin) can only be
 * created, edited, role-changed, password-reset, or deleted by a Super
 * Admin. A plain Administrator managing another Administrator — or
 * themselves — would be a privilege-escalation path, so it's blocked here
 * centrally rather than trusting each callable to remember the check.
 */
function assertCanManageTarget(caller: CallerContext, targetRole: UserRole) {
  const targetIsAdminLevel = (ADMIN_LEVEL_ROLES as UserRole[]).includes(targetRole);
  if (targetIsAdminLevel && caller.role !== "super-admin") {
    throw new HttpsError(
      "permission-denied",
      "Only Super Admin can manage Administrator or Super Admin accounts."
    );
  }
}

/**
 * Accounts in Superior Minds Academy are never self-registered — an
 * Administrator or Super Admin provisions every login. This callable
 * creates the Firebase Auth user, sets a role custom claim (so security
 * rules and future Cloud Functions can trust the role without an extra
 * Firestore read), and writes the matching Firestore profile, all in one
 * request so the two never drift out of sync.
 */
export const createStaffAccount = onCall(async (request) => {
  const caller = requireAdminCaller(request);

  const { email, displayName, role, phone, temporaryPassword } = request.data as {
    email?: string;
    displayName?: string;
    role?: string;
    phone?: string;
    temporaryPassword?: string;
  };

  if (!email || !displayName || !role || !temporaryPassword) {
    throw new HttpsError(
      "invalid-argument",
      "email, displayName, role, and temporaryPassword are all required."
    );
  }
  if (!isValidRole(role)) {
    throw new HttpsError("invalid-argument", `Unknown role: ${role}`);
  }
  assertCanManageTarget(caller, role);

  const userRecord = await auth.createUser({
    email,
    displayName,
    password: temporaryPassword,
    emailVerified: false,
  });

  await auth.setCustomUserClaims(userRecord.uid, { role });

  const now = FieldValue.serverTimestamp();
  await db.collection(USERS_COLLECTION).doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    emailLower: email.toLowerCase(),
    displayName,
    displayNameLower: displayName.toLowerCase(),
    role,
    status: "active",
    photoURL: null,
    phone: phone ?? null,
    createdAt: now,
    updatedAt: now,
    createdBy: caller.uid,
    lastLoginAt: null,
  });

  logger.info("Staff account created", { uid: userRecord.uid, role, by: caller.uid });

  return { uid: userRecord.uid };
});

/**
 * Edits the non-identity fields of an existing account: display name,
 * phone, status (active/suspended), and avatar URL. Email is intentionally
 * out of scope here — changing it means re-verifying ownership of the new
 * address, which is a separate flow. Role changes go through
 * `setUserRole` so the two mutations stay auditable and independently
 * permissioned.
 */
export const updateStaffAccount = onCall(async (request) => {
  const caller = requireAdminCaller(request);

  const { uid, displayName, phone, status, photoURL } = request.data as {
    uid?: string;
    displayName?: string;
    phone?: string | null;
    status?: string;
    photoURL?: string | null;
  };

  if (!uid) {
    throw new HttpsError("invalid-argument", "uid is required.");
  }
  if (status && !["active", "suspended", "pending"].includes(status)) {
    throw new HttpsError("invalid-argument", `Unknown status: ${status}`);
  }

  const targetSnap = await db.collection(USERS_COLLECTION).doc(uid).get();
  if (!targetSnap.exists) {
    throw new HttpsError("not-found", "No such user.");
  }
  const targetRole = targetSnap.data()?.role as UserRole;
  assertCanManageTarget(caller, targetRole);

  if (status === "suspended" && uid === caller.uid) {
    throw new HttpsError("failed-precondition", "You can't suspend your own account.");
  }

  const firestoreChanges: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  const authChanges: UpdateRequest = {};

  if (typeof displayName === "string" && displayName.trim()) {
    firestoreChanges.displayName = displayName.trim();
    firestoreChanges.displayNameLower = displayName.trim().toLowerCase();
    authChanges.displayName = displayName.trim();
  }
  if (phone !== undefined) {
    firestoreChanges.phone = phone;
  }
  if (photoURL !== undefined) {
    firestoreChanges.photoURL = photoURL;
    authChanges.photoURL = photoURL;
  }
  if (status) {
    firestoreChanges.status = status;
    authChanges.disabled = status === "suspended";
  }

  if (Object.keys(authChanges).length > 0) {
    await auth.updateUser(uid, authChanges);
  }
  await db.collection(USERS_COLLECTION).doc(uid).update(firestoreChanges);

  logger.info("Staff account updated", { uid, by: caller.uid, fields: Object.keys(firestoreChanges) });

  return { ok: true };
});

/**
 * Changes an existing account's role. Super Admin can assign any role,
 * including promoting/demoting other admin-level accounts. A plain
 * Administrator may only change the role of a non-admin-level account
 * (teacher, parent, administrative-staff), and never their own.
 */
export const setUserRole = onCall(async (request) => {
  const caller = requireAdminCaller(request);

  const { uid, role } = request.data as { uid?: string; role?: string };
  if (!uid || !role || !isValidRole(role)) {
    throw new HttpsError("invalid-argument", "A valid uid and role are required.");
  }
  if (uid === caller.uid) {
    throw new HttpsError("failed-precondition", "You can't change your own role.");
  }

  const targetSnap = await db.collection(USERS_COLLECTION).doc(uid).get();
  if (!targetSnap.exists) {
    throw new HttpsError("not-found", "No such user.");
  }
  const currentRole = targetSnap.data()?.role as UserRole;
  // Block if the account's current role OR the requested new role is
  // admin-level and the caller isn't Super Admin.
  assertCanManageTarget(caller, currentRole);
  assertCanManageTarget(caller, role);

  await auth.setCustomUserClaims(uid, { role });
  await db.collection(USERS_COLLECTION).doc(uid).update({
    role,
    updatedAt: FieldValue.serverTimestamp(),
  });

  logger.info("Role changed", { uid, role, by: caller.uid });

  return { ok: true };
});

/**
 * Issues a fresh temporary password for an account and returns it once in
 * the response — it is never stored or logged in plaintext. The admin is
 * expected to relay it to the user through a trusted channel; the user
 * should change it on next sign-in.
 */
export const resetStaffPassword = onCall(async (request) => {
  const caller = requireAdminCaller(request);

  const { uid } = request.data as { uid?: string };
  if (!uid) {
    throw new HttpsError("invalid-argument", "uid is required.");
  }

  const targetSnap = await db.collection(USERS_COLLECTION).doc(uid).get();
  if (!targetSnap.exists) {
    throw new HttpsError("not-found", "No such user.");
  }
  const targetRole = targetSnap.data()?.role as UserRole;
  assertCanManageTarget(caller, targetRole);

  const temporaryPassword = generateTemporaryPassword();
  await auth.updateUser(uid, { password: temporaryPassword });
  await db.collection(USERS_COLLECTION).doc(uid).update({
    updatedAt: FieldValue.serverTimestamp(),
  });

  logger.info("Password reset", { uid, by: caller.uid });

  return { temporaryPassword };
});

/**
 * Permanently removes an account: deletes the Firebase Auth user (which
 * triggers `onAccountDeleted` below to clean up Firestore) rather than
 * only deleting the Firestore document, which would otherwise leave a
 * still-functional login behind.
 */
export const deleteStaffAccount = onCall(async (request) => {
  const caller = requireAdminCaller(request);

  const { uid } = request.data as { uid?: string };
  if (!uid) {
    throw new HttpsError("invalid-argument", "uid is required.");
  }
  if (uid === caller.uid) {
    throw new HttpsError("failed-precondition", "You can't delete your own account.");
  }

  const targetSnap = await db.collection(USERS_COLLECTION).doc(uid).get();
  if (!targetSnap.exists) {
    throw new HttpsError("not-found", "No such user.");
  }
  const targetRole = targetSnap.data()?.role as UserRole;
  assertCanManageTarget(caller, targetRole);

  await auth.deleteUser(uid);

  logger.info("Staff account deleted", { uid, role: targetRole, by: caller.uid });

  return { ok: true };
});

/** Keeps Firestore tidy when an account is removed from Firebase Auth. */
export const onAccountDeleted = onUserDeleted(async (event) => {
  await db.collection(USERS_COLLECTION).doc(event.data.uid).delete().catch(() => {
    // Profile may already be gone — nothing to do.
  });
});
