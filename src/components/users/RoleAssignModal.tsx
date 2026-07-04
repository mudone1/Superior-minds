"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { UserAvatar } from "./UserAvatar";
import { setUserRole, ManageUserError } from "@/lib/firebase/functions";
import { ADMIN_LEVEL_ROLES, ROLES, ROLE_LABELS, type AppUser, type UserRole } from "@/types";

interface RoleAssignModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: AppUser | null;
  currentUserRole: UserRole;
}

export function RoleAssignModal({ open, onClose, onSaved, user, currentUserRole }: RoleAssignModalProps) {
  const canAssignAdminRoles = currentUserRole === "super-admin";
  const [role, setRole] = useState<UserRole>("teacher");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Re-seed the selected role whenever the modal opens for a (possibly
  // different) user, so switching targets never carries a stale selection.
  useEffect(() => {
    if (open && user) {
      setRole(user.role);
      setError(null);
    }
  }, [open, user]);

  async function handleSubmit() {
    if (!user) return;
    setError(null);
    setSubmitting(true);
    try {
      await setUserRole(user.uid, role);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ManageUserError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const roleOptions = ROLES.filter(
    (r) => canAssignAdminRoles || !(ADMIN_LEVEL_ROLES as UserRole[]).includes(r)
  ).map((r) => ({ value: r, label: ROLE_LABELS[r] }));

  return (
    <Modal
      open={open && Boolean(user)}
      onClose={onClose}
      title="Assign Role"
      description={user ? `Change ${user.displayName}'s role and access level.` : undefined}
      size="sm"
    >
      {user && (
        <div className="flex flex-col gap-4">
          {error && <Alert variant="error">{error}</Alert>}
          <div className="flex items-center gap-3">
            <UserAvatar photoURL={user.photoURL} displayName={user.displayName} />
            <div>
              <p className="text-sm font-medium text-ink">{user.displayName}</p>
              <p className="text-xs text-ink-500">{user.email}</p>
            </div>
          </div>
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={roleOptions}
            hint={
              !canAssignAdminRoles
                ? "Only Super Admin can assign Administrator or Super Admin roles."
                : "Changing a role updates the account's dashboard access immediately."
            }
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={submitting} disabled={role === user.role}>
              Save Role
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
