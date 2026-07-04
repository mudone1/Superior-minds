"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Camera } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { StudentAvatar } from "./StudentAvatar";
import { ParentPicker } from "./ParentPicker";
import { NIGERIAN_STATES, getLgasForState } from "@/lib/data/nigeria";
import { CLASS_LEVELS } from "@/lib/data/classLevels";
import { studentSchema, editStudentSchema } from "@/lib/validation/student";
import { createStudent, updateStudent, ApiClientError } from "@/lib/api/students";
import { uploadStudentPassport } from "@/lib/firebase/storage";
import { GENDERS, BLOOD_GROUPS, GENOTYPES, type Student, type Guardian } from "@/types";

interface StudentFormProps {
  mode: "create" | "edit";
  student?: Student;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function StudentForm({ mode, student }: StudentFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [admissionNumber, setAdmissionNumber] = useState(student?.admissionNumber ?? "");
  const [surname, setSurname] = useState(student?.surname ?? "");
  const [otherNames, setOtherNames] = useState(student?.otherNames ?? "");
  const [gender, setGender] = useState(student?.gender ?? "Male");
  const [dateOfBirth, setDateOfBirth] = useState(student?.dateOfBirth ?? "");
  const [state, setState] = useState(student?.state ?? "");
  const [lga, setLga] = useState(student?.lga ?? "");
  const [address, setAddress] = useState(student?.address ?? "");
  const [bloodGroup, setBloodGroup] = useState(student?.bloodGroup ?? "Unknown");
  const [genotype, setGenotype] = useState(student?.genotype ?? "Unknown");
  const [medicalNotes, setMedicalNotes] = useState(student?.medicalNotes ?? "");
  const [classLevel, setClassLevel] = useState(student?.class ?? CLASS_LEVELS[0] ?? "");
  const [arm, setArm] = useState(student?.arm ?? "");
  const [parent, setParent] = useState<{ uid: string; name: string } | null>(
    student?.parentUid && student?.parentName ? { uid: student.parentUid, name: student.parentName } : null
  );
  const [hasGuardian, setHasGuardian] = useState(Boolean(student?.guardian));
  const [guardian, setGuardian] = useState<Guardian>(
    student?.guardian ?? { name: "", phone: "", relationship: "" }
  );
  const [admissionDate, setAdmissionDate] = useState(
    student?.admissionDate ?? new Date().toISOString().slice(0, 10)
  );

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(student?.passportPhotoURL ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Passport photo must be an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setFormError("Passport photo must be smaller than 5MB.");
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

    const guardianValue = hasGuardian && guardian.name ? guardian : null;

    let photoUploadFailed = false;

    try {
      let id: string;

      if (isEdit && student) {
        const parsed = editStudentSchema.safeParse({
          surname,
          otherNames,
          gender,
          dateOfBirth,
          state,
          lga,
          address,
          bloodGroup,
          genotype,
          medicalNotes: medicalNotes || undefined,
          class: classLevel,
          arm,
          parentUid: parent?.uid ?? null,
          guardian: guardianValue,
          admissionDate,
        });
        if (!parsed.success) {
          setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
          setSubmitting(false);
          return;
        }
        await updateStudent(student.id, parsed.data);
        id = student.id;
      } else {
        const parsed = studentSchema.safeParse({
          admissionNumber,
          surname,
          otherNames,
          gender,
          dateOfBirth,
          state,
          lga,
          address,
          bloodGroup,
          genotype,
          medicalNotes: medicalNotes || undefined,
          class: classLevel,
          arm,
          parentUid: parent?.uid ?? null,
          guardian: guardianValue,
          admissionDate,
        });
        if (!parsed.success) {
          setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
          setSubmitting(false);
          return;
        }
        const result = await createStudent(parsed.data);
        id = result.id;
      }

      if (photoFile) {
        try {
          const photoURL = await uploadStudentPassport(id, photoFile);
          await updateStudent(id, { passportPhotoURL: photoURL });
        } catch (uploadErr) {
          console.error("[StudentForm] passport upload failed", uploadErr);
          photoUploadFailed = true;
        }
      }

      if (photoUploadFailed) {
        router.push(`/dashboard/students/${id}?photoFailed=1`);
      } else {
        router.push(`/dashboard/students/${id}`);
      }
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setFormError(message);
      setSubmitting(false);
    }
  }

  const lgaOptions = getLgasForState(state);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {formError && <Alert variant="error">{formError}</Alert>}

      {/* Passport photo */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <StudentAvatar photoURL={photoPreview} name={`${surname} ${otherNames}` || "?"} size="lg" />
            <div>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-4 w-4" />
                {photoPreview ? "Change passport photo" : "Upload passport photo"}
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
        </CardBody>
      </Card>

      {/* Personal info */}
      <Card>
        <CardBody className="flex flex-col gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Personal Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Admission Number"
              required
              disabled={isEdit}
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              error={errors.admissionNumber}
              hint={isEdit ? "Admission number can't be changed once set." : undefined}
            />
            <Select
              label="Gender"
              required
              value={gender}
              onChange={(e) => setGender(e.target.value as (typeof GENDERS)[number])}
              options={GENDERS.map((g) => ({ value: g, label: g }))}
            />
            <Input
              label="Surname"
              required
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              error={errors.surname}
            />
            <Input
              label="Other Names"
              required
              value={otherNames}
              onChange={(e) => setOtherNames(e.target.value)}
              error={errors.otherNames}
            />
            <Input
              label="Date of Birth"
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              error={errors.dateOfBirth}
            />
            <Input
              label="Admission Date"
              type="date"
              required
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              error={errors.admissionDate}
            />
          </div>
        </CardBody>
      </Card>

      {/* Location */}
      <Card>
        <CardBody className="flex flex-col gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Location
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="State"
              required
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setLga("");
              }}
              options={NIGERIAN_STATES.map((s) => ({ value: s.name, label: s.name }))}
              placeholder="Select state"
              error={errors.state}
            />
            <Select
              label="LGA"
              required
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              options={lgaOptions.map((l) => ({ value: l, label: l }))}
              placeholder={state ? "Select LGA" : "Select a state first"}
              disabled={!state}
              error={errors.lga}
            />
          </div>
          <Input
            label="Address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={errors.address}
          />
        </CardBody>
      </Card>

      {/* Medical */}
      <Card>
        <CardBody className="flex flex-col gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Medical Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Blood Group"
              required
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value as (typeof BLOOD_GROUPS)[number])}
              options={BLOOD_GROUPS.map((b) => ({ value: b, label: b }))}
            />
            <Select
              label="Genotype"
              required
              value={genotype}
              onChange={(e) => setGenotype(e.target.value as (typeof GENOTYPES)[number])}
              options={GENOTYPES.map((g) => ({ value: g, label: g }))}
            />
          </div>
          <Input
            label="Medical Notes"
            value={medicalNotes ?? ""}
            onChange={(e) => setMedicalNotes(e.target.value)}
            placeholder="Allergies, conditions, medications — optional"
          />
        </CardBody>
      </Card>

      {/* Academic */}
      <Card>
        <CardBody className="flex flex-col gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Academic
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Class"
              required
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              options={CLASS_LEVELS.map((c) => ({ value: c, label: c }))}
              error={errors.class}
            />
            <Input
              label="Arm"
              required
              value={arm}
              onChange={(e) => setArm(e.target.value)}
              placeholder="e.g. A, Gold, Diamond"
              error={errors.arm}
            />
          </div>
        </CardBody>
      </Card>

      {/* Parent / Guardian */}
      <Card>
        <CardBody className="flex flex-col gap-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Parent / Guardian
          </h3>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Parent Account</label>
            <ParentPicker value={parent} onChange={setParent} />
            <p className="mt-1 text-xs text-ink-500">
              Optional — link to an existing Parent-role account if one exists.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={hasGuardian}
              onChange={(e) => setHasGuardian(e.target.checked)}
              className="h-4 w-4 rounded border-ink-300"
            />
            Add a guardian contact (for a caregiver without a login account)
          </label>

          {hasGuardian && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Guardian Name"
                value={guardian.name}
                onChange={(e) => setGuardian({ ...guardian, name: e.target.value })}
              />
              <Input
                label="Guardian Phone"
                type="tel"
                value={guardian.phone}
                onChange={(e) => setGuardian({ ...guardian, phone: e.target.value })}
              />
              <Input
                label="Relationship"
                value={guardian.relationship}
                onChange={(e) => setGuardian({ ...guardian, relationship: e.target.value })}
                placeholder="e.g. Grandmother"
              />
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          {isEdit ? "Save Changes" : "Add Student"}
        </Button>
      </div>
    </form>
  );
}
