"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, Dices } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { UserAvatar } from "./UserAvatar";
import { createUserSchema, editUserSchema, suggestTemporaryPassword } from "@/lib/validation/user";
import { createStaffAccount, updateStaffAccount, ManageUserError } from "@/lib/firebase/functions";
import { uploadAvatar } from "@/lib/firebase/storage";
import {
  ACCOUNT_STATUSES,
  ADMIN_LEVEL_ROLES,
  ROLES,
  ROLE_LABELS,
  STATUS_LABELS,
  type AccountStatus,
  type AppUser,
  type UserRole,
} from "@/types";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** The signed-in admin's own role — an Administrator (not Super Admin) can't create or edit Administrator/Super Admin accounts. */
  currentUserRole: UserRole;
  /** Present for edit mode; absent for create mode. */
  user?: AppUser | null;
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export function UserFormModal({ open, onClose, onSaved, currentUserRole, user }: UserFormModalProps) {
  const isEdit = Boolean(user);
  const canAssignAdminRoles = currentUserRole === "super-admin";

  const roleOptions = ROLES.filter(
    (r) => canAssignAdminRoles || !(ADMIN_LEVEL_ROLES as UserRole[]).includes(r)
  ).map((r) => ({ value: r, label: ROLE_LABELS[r] }));

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "teacher");
  const [status, setStatus] = useState<AccountStatus>(user?.status ?? "active");
  const [temporaryPassword, setTemporaryPassword] = useState(suggestTemporaryPassword());
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-seed every field whenever the modal opens — this is one persistent
  // component instance reused for both Add and Edit, and for whichever
  // user's row was last clicked, so state must be refreshed on each open
  // rather than only on first mount.
  useEffect(() => {
    if (!open) return;
    setDisplayName(user?.displayName ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
    setRole(user?.role ?? "teacher");
    setStatus(user?.status ?? "active");
    setTemporaryPassword(suggestTemporaryPassword());
    setPhotoFile(null);
    setPhotoPreview(user?.photoURL ?? null);
    setErrors({});
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  function resetAndClose() {
    setErrors({});
    setFormError(null);
    setPhotoFile(null);
    onClose();
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Profile picture must be an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setFormError("Profile picture must be smaller than 5MB.");
      return;
    }
    setFormError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setErrors({});
    setSubmitting(true);

    let photoUploadFailed = false;

    try {
      if (isEdit && user) {
        const parsed = editUserSchema.safeParse({ displayName, phone });
        if (!parsed.success) {
          setErrors(Object.fromEntries(
            parsed.error.issues.map((i) => [String(i.path[0]), i.message])
          ));
          setSubmitting(false);
          return;
        }

        let photoURL = user.photoURL ?? null;
        if (photoFile) {
          try {
            photoURL = await uploadAvatar(user.uid, photoFile);
          } catch (uploadErr) {
            console.error("[UserFormModal] avatar upload failed", uploadErr);
            photoUploadFailed = true;
          }
        }

        await updateStaffAccount({
          uid: user.uid,
          displayName: parsed.data.displayName,
          phone: parsed.data.phone || null,
          status,
          photoURL,
        });
      } else {
        const parsed = createUserSchema.safeParse({
          displayName,
          email,
          phone,
          role,
          temporaryPassword,
        });
        if (!parsed.success) {
          setErrors(Object.fromEntries(
            parsed.error.issues.map((i) => [String(i.path[0]), i.message])
          ));
          setSubmitting(false);
          return;
        }

        const { uid } = await createStaffAccount({
          displayName: parsed.data.displayName,
          email: parsed.data.email,
          phone: parsed.data.phone || undefined,
          role: parsed.data.role,
          temporaryPassword: parsed.data.temporaryPassword,
        });

        if (photoFile) {
          try {
            const photoURL = await uploadAvatar(uid, photoFile);
            await updateStaffAccount({ uid, photoURL });
          } catch (uploadErr) {
            console.error("[UserFormModal] avatar upload failed", uploadErr);
            photoUploadFailed = true;
          }
        }
      }

      onSaved();
      if (photoUploadFailed) {
        // The account itself saved fine — only the photo didn't. Let the
        // admin know without blocking or discarding the rest of the work.
        setFormError(
          "Account saved, but the profile picture couldn't be uploaded (Firebase Storage isn't set up on this project yet). Everything else was saved."
        );
        setSubmitting(false);
        return;
      }
      resetAndClose();
    } catch (err) {
      const message = err instanceof ManageUserError ? err.message : "Something went wrong. Please try again.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title={isEdit ? "Edit User" : "Add User"}
      description={
        isEdit
          ? "Update this account's profile details and status."
          : "Provision a new login for a staff member or parent."
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && <Alert variant="error">{formError}</Alert>}

        <div className="flex items-center gap-4">
          <UserAvatar photoURL={photoPreview} displayName={displayName || "?"} size="lg" />
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              {photoPreview ? "Change photo" : "Upload photo"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <p className="mt-1 text-xs text-ink-500">
              JPG or PNG, up to 5MB. Requires Firebase Storage to be set up on this project.
            </p>
          </div>
        </div>

        <Input
          label="Full Name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
        />

        <Input
          label="Email"
          type="email"
          required
          disabled={isEdit}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          hint={isEdit ? "Email can't be changed once an account is created." : undefined}
        />

        <Input
          label="Phone Number"
          type="tel"
          value={phone ?? ""}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          placeholder="+234 800 000 0000"
        />

        {!isEdit && (
          <Select
            label="Role"
            required
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={roleOptions}
            hint={
              !canAssignAdminRoles
                ? "Only Super Admin can create Administrator or Super Admin accounts."
                : undefined
            }
          />
        )}

        {isEdit && (
          <Select
            label="Status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value as AccountStatus)}
            options={ACCOUNT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
            hint="Suspended accounts can't sign in."
          />
        )}

        {!isEdit && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Temporary Password"
                required
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                error={errors.temporaryPassword}
                hint="Share this with the user through a trusted channel — have them change it on first sign-in."
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setTemporaryPassword(suggestTemporaryPassword())}
              aria-label="Generate a new temporary password"
            >
              <Dices className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={submitting}>
            {isEdit ? "Save Changes" : "Create Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
