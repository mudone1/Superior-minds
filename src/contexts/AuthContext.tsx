"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { signIn as firebaseSignIn, signOut as firebaseSignOut } from "@/lib/firebase/auth";
import type { SessionUser } from "@/types";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  /** Signs in with Firebase Auth, exchanges the ID token for a session cookie, and returns the signed-in user (so callers can redirect by role). */
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => Promise<void>;
  /** Re-pulls the session from the server, useful after a profile edit. */
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchSession(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/session", { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as SessionUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const session = await fetchSession();
    setUser(session);
  }, []);

  useEffect(() => {
    // Establish initial state from the httpOnly session cookie (source of
    // truth for role/status — never trust client-only Firebase Auth state
    // for authorization decisions).
    refresh().finally(() => setLoading(false));

    // Keep the client SDK's auth state in sync too, mainly so we notice
    // if the Firebase session itself expires or is revoked elsewhere.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string): Promise<SessionUser> => {
    const credential = await firebaseSignIn(email, password);
    const idToken = await credential.user.getIdToken();

    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      await firebaseSignOut();
      throw new Error(body.error ?? "Unable to sign in.");
    }

    const session = await fetchSession();
    if (!session) throw new Error("Signed in, but no profile was found.");
    setUser(session);
    return session;
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([firebaseSignOut(), fetch("/api/auth/session", { method: "DELETE" })]);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
