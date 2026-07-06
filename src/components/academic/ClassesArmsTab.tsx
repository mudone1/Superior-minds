"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { listSchoolClasses, listClassArms } from "@/lib/firebase/academic";
import { createClass, deleteClass, createArm, deleteArm, ApiClientError } from "@/lib/api/academic";
import type { ClassArm, SchoolClass } from "@/types";

export function ClassesArmsTab() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [arms, setArms] = useState<ClassArm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newClassName, setNewClassName] = useState("");
  const [newClassOrder, setNewClassOrder] = useState("");
  const [addingClass, setAddingClass] = useState(false);

  const [newArmByClass, setNewArmByClass] = useState<Record<string, string>>({});
  const [addingArmFor, setAddingArmFor] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [c, a] = await Promise.all([listSchoolClasses(), listClassArms()]);
      setClasses(c);
      setArms(a);
    } catch {
      setError("Couldn't load classes and arms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleAddClass() {
    if (!newClassName.trim()) return;
    setAddingClass(true);
    setError(null);
    try {
      await createClass({
        name: newClassName.trim(),
        order: Number(newClassOrder) || classes.length + 1,
      });
      setNewClassName("");
      setNewClassOrder("");
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't add class.");
    } finally {
      setAddingClass(false);
    }
  }

  async function handleDeleteClass(id: string, name: string) {
    if (!window.confirm(`Delete class "${name}"? Remove its arms first if it has any.`)) return;
    setError(null);
    try {
      await deleteClass(id);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't delete class.");
    }
  }

  async function handleAddArm(classId: string) {
    const name = newArmByClass[classId];
    if (!name?.trim()) return;
    setAddingArmFor(classId);
    setError(null);
    try {
      await createArm(classId, { name: name.trim() });
      setNewArmByClass((prev) => ({ ...prev, [classId]: "" }));
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't add arm.");
    } finally {
      setAddingArmFor(null);
    }
  }

  async function handleDeleteArm(id: string, name: string) {
    if (!window.confirm(`Delete arm "${name}"? This can't be undone.`)) return;
    setError(null);
    try {
      await deleteArm(id);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't delete arm.");
    }
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="py-10">
          <Spinner label="Loading classes…" />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <Alert variant="error">{error}</Alert>}

      <Alert variant="info">
        Renaming a class here won&apos;t update students already recorded under the old name —
        add a new class instead of renaming one that already has students in it.
      </Alert>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Add Class
          </h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-56">
              <Input
                label="Class Name"
                placeholder="e.g. Primary 4"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
              />
            </div>
            <div className="w-28">
              <Input
                label="Order"
                type="number"
                placeholder={String(classes.length + 1)}
                value={newClassOrder}
                onChange={(e) => setNewClassOrder(e.target.value)}
                hint="Sort position"
              />
            </div>
            <Button onClick={handleAddClass} isLoading={addingClass} disabled={!newClassName.trim()}>
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </div>
        </CardBody>
      </Card>

      {classes.length === 0 && (
        <Card>
          <CardBody className="py-10 text-center text-sm text-ink-500">
            No classes yet. Add one above to get started.
          </CardBody>
        </Card>
      )}

      {classes
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((cls) => {
          const classArms = arms.filter((a) => a.classId === cls.id);
          return (
            <Card key={cls.id}>
              <CardBody className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">{cls.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    className="text-rose hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {classArms.map((arm) => (
                    <span
                      key={arm.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink-300/30 bg-ink/[0.02] py-1 pl-3 pr-1.5 text-sm text-ink-700"
                    >
                      {arm.name}
                      <button
                        type="button"
                        onClick={() => handleDeleteArm(arm.id, arm.name)}
                        aria-label={`Remove ${arm.name}`}
                        className="rounded-full p-1 text-ink-300 hover:bg-rose-50 hover:text-rose"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {classArms.length === 0 && (
                    <p className="text-xs text-ink-500">No arms yet for this class.</p>
                  )}
                </div>

                <div className="flex items-end gap-3">
                  <div className="w-48">
                    <Input
                      label="New Arm"
                      placeholder="e.g. Gold, A, Diamond"
                      value={newArmByClass[cls.id] ?? ""}
                      onChange={(e) => setNewArmByClass((prev) => ({ ...prev, [cls.id]: e.target.value }))}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleAddArm(cls.id)}
                    isLoading={addingArmFor === cls.id}
                    disabled={!newArmByClass[cls.id]?.trim()}
                  >
                    <Plus className="h-4 w-4" />
                    Add Arm
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
    </div>
  );
}
