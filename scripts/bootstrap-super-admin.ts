/**
 * Bootstraps the very first Super Admin account.
 *
 * Every other account in the system is created by a Super Admin or
 * Administrator through the app (see functions/src/index.ts →
 * createStaffAccount). But the *first* Super Admin has to come from
 * somewhere — that's this script.
 *
 * Usage (from the project root, with .env.local populated):
 *   npx tsx scripts/bootstrap-super-admin.ts "admin@superiorminds.edu" "Ada Lovelace" "ChangeMe123!"
 */
import { config } from "dotenv";
import { resolve } from "path";
import { cert, initializeApp } from "firebase-admin/app";

// Next.js convention is `.env.local`, but plain `dotenv/config` only
// auto-loads a file literally named `.env` — so this script has to point
// at `.env.local` explicitly or the FIREBASE_ADMIN_* vars never load.
config({ path: resolve(process.cwd(), ".env.local") });
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

async function main() {
  const [, , email, displayName, password] = process.argv;

  if (!email || !displayName || !password) {
    console.error(
      'Usage: npx tsx scripts/bootstrap-super-admin.ts "<email>" "<display name>" "<password>"'
    );
    process.exit(1);
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Missing FIREBASE_ADMIN_* env vars. Populate .env.local from .env.local.example first."
    );
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const auth = getAuth();
  const db = getFirestore();

  const userRecord = await auth.createUser({
    email,
    displayName,
    password,
    emailVerified: true,
  });

  await auth.setCustomUserClaims(userRecord.uid, { role: "super-admin" });

  const now = FieldValue.serverTimestamp();
  await db.collection("users").doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    displayName,
    role: "super-admin",
    status: "active",
    photoURL: null,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`✅ Super Admin created: ${email} (uid: ${userRecord.uid})`);
  console.log("You can now sign in at /login with this email and password.");
}

main().catch((err) => {
  console.error("Failed to bootstrap Super Admin:", err);
  process.exit(1);
});