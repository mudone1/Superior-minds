"use client";

import { useEffect, useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { resetStaffPassword, ManageUserError } from "@/lib/firebase/functions";
import type { AppUser } from "@/types";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: AppUser | null;
}

export function ResetPasswordModal({ open, onClose, user }: ResetPasswordModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setTemporaryPassword(null);
      setCopied(false);
    }
  }, [open]);

  async function handleConfirm() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const { temporaryPassword: pwd } = await resetStaffPassword(user.uid);
      setTemporaryPassword(pwd);
    } catch (err) {
      setError(err instanceof ManageUserError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!temporaryPassword) return;
    await navigator.clipboard.writeText(temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal
      open={open && Boolean(user)}
      onClose={onClose}
      title="Reset Password"
      description={user ? `Generate a new temporary password for ${user.displayName}.` : undefined}
      size="sm"
    >
      {user && (
        <div className="flex flex-col gap-4">
          {error && <Alert variant="error">{error}</Alert>}

          {!temporaryPassword ? (
            <>
              <div className="flex items-start gap-2.5 rounded-md border border-brass/30 bg-brass-50 px-4 py-3 text-sm text-brass-600">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>
                  This immediately invalidates {user.displayName}&apos;s current password. They&apos;ll
                  need the new temporary password to sign in again.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button onClick={handleConfirm} isLoading={submitting} variant="secondary">
                  Generate New Password
                </Button>
              </div>
            </>
          ) : (
            <>
              <Alert variant="success">
                Password reset. Share this with {user.displayName} through a trusted channel — it
                won&apos;t be shown again.
              </Alert>
              <div className="flex items-center gap-2 rounded-md border border-ink-300/60 bg-paper px-3 py-2.5">
                <code className="flex-1 select-all font-mono text-sm text-ink">
                  {temporaryPassword}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-md p-1.5 text-ink-500 hover:bg-ink/5"
                  aria-label="Copy password"
                >
                  {copied ? <Check className="h-4 w-4 text-sage" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Button onClick={onClose} type="button">
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
