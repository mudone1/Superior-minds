"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { resetPassword, AuthError } from "@/lib/firebase/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Enter the email associated with your account.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      // Deliberately vague to avoid confirming whether an email exists.
      if (err instanceof AuthError && err.code === "auth/invalid-email") {
        setError("That email address doesn't look right.");
      } else {
        setSent(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <Alert variant="success">
        If an account exists for <strong>{email}</strong>, a password reset link is on its way.
        Check your inbox and spam folder.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@superiorminds.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Button type="submit" isLoading={submitting} fullWidth size="lg">
        Send reset link
      </Button>
    </form>
  );
}
