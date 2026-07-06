"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { listSubjects } from "@/lib/firebase/academic";
import { createSubject, deleteSubject, ApiClientError } from "@/lib/api/academic";
import type { Subject } from "@/types";

export function SubjectsTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSubjects(await listSubjects());
    } catch {
      setError("Couldn't load subjects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!name.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await createSubject({ name: name.trim(), code: code.trim() || null });
      setName("");
      setCode("");
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't add subject.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string, subjectName: string) {
    if (!window.confirm(`Delete subject "${subjectName}"? This can't be undone.`)) return;
    setError(null);
    try {
      await deleteSubject(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't delete subject.");
    }
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="py-10">
          <Spinner label="Loading subjects…" />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <CardBody className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Add Subject
          </h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-56">
              <Input
                label="Subject Name"
                placeholder="e.g. Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="w-28">
              <Input
                label="Code"
                placeholder="e.g. MTH"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                hint="Optional"
              />
            </div>
            <Button onClick={handleAdd} isLoading={adding} disabled={!name.trim()}>
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        {subjects.length === 0 ? (
          <div className="py-10 text-center text-sm text-ink-500">
            No subjects yet. Add one above to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-300/20 text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-6 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-300/10">
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-3 font-medium text-ink">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-ink-500">{s.code ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="text-rose hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
