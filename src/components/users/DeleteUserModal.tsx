"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { deleteStaffAccount, ManageUserError } from "@/lib/firebase/functions";
import type { AppUser } from "@/types";

interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  user: AppUser | null;
}

export function DeleteUserModal({ open, onClose, onDeleted, user }: DeleteUserModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteStaffAccount(user.uid);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof ManageUserError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open && Boolean(user)} onClose={onClose} title="Delete User" size="sm">
      {user && (
        <div className="flex flex-col gap-4">
          {error && <Alert variant="error">{error}</Alert>}
          <div className="flex items-start gap-2.5 rounded-md border border-rose/30 bg-rose-50 px-4 py-3 text-sm text-rose">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              This permanently deletes <strong>{user.displayName}</strong>&apos;s ({user.email}) login
              and profile. This can&apos;t be undone — consider suspending the account instead if you
              just need to block access temporarily.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={handleConfirm} isLoading={submitting} variant="danger">
              Delete Permanently
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
