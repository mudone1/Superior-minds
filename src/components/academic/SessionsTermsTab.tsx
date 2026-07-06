"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { listAcademicSessions, listTerms, getAcademicSettings } from "@/lib/firebase/academic";
import {
  createSession,
  deleteSession,
  createTerm,
  deleteTerm,
  updateAcademicSettings,
  ApiClientError,
} from "@/lib/api/academic";
import type { AcademicSession, AcademicSettings, Term } from "@/types";

export function SessionsTermsTab() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [settings, setSettings] = useState<AcademicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newSessionName, setNewSessionName] = useState("");
  const [addingSession, setAddingSession] = useState(false);

  const [newTermBySession, setNewTermBySession] = useState<Record<string, { name: string; order: string }>>({});
  const [addingTermFor, setAddingTermFor] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [s, t, settingsData] = await Promise.all([
        listAcademicSessions(),
        listTerms(),
        getAcademicSettings(),
      ]);
      setSessions(s);
      setTerms(t);
      setSettings(settingsData);
    } catch {
      setError("Couldn't load sessions and terms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleAddSession() {
    if (!newSessionName.trim()) return;
    setAddingSession(true);
    setError(null);
    try {
      await createSession({ name: newSessionName.trim() });
      setNewSessionName("");
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't add session.");
    } finally {
      setAddingSession(false);
    }
  }

  async function handleDeleteSession(id: string, name: string) {
    if (!window.confirm(`Delete session "${name}"? This can't be undone.`)) return;
    setError(null);
    try {
      await deleteSession(id);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't delete session.");
    }
  }

  async function handleAddTerm(sessionId: string) {
    const draft = newTermBySession[sessionId];
    if (!draft?.name.trim()) return;
    setAddingTermFor(sessionId);
    setError(null);
    try {
      await createTerm({
        sessionId,
        name: draft.name.trim(),
        order: Number(draft.order) || terms.filter((t) => t.sessionId === sessionId).length + 1,
      });
      setNewTermBySession((prev) => ({ ...prev, [sessionId]: { name: "", order: "" } }));
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't add term.");
    } finally {
      setAddingTermFor(null);
    }
  }

  async function handleDeleteTerm(id: string, name: string) {
    if (!window.confirm(`Delete term "${name}"? This can't be undone.`)) return;
    setError(null);
    try {
      await deleteTerm(id);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't delete term.");
    }
  }

  async function handleSetCurrentSession(sessionId: string) {
    setError(null);
    try {
      await updateAcademicSettings({ currentSessionId: sessionId });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't set current session.");
    }
  }

  async function handleSetCurrentTerm(termId: string) {
    setError(null);
    try {
      await updateAcademicSettings({ currentTermId: termId });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't set current term.");
    }
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="py-10">
          <Spinner label="Loading sessions…" />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <CardBody>
          <p className="text-sm font-medium text-ink-700">Currently Active</p>
          <p className="mt-1 font-display text-lg text-ink">
            {settings?.currentSessionName ?? "No session set"}
            {settings?.currentTermName ? ` — ${settings.currentTermName}` : ""}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            This is what the rest of the app (results, attendance, and later phases) will treat as
            &ldquo;now&rdquo;. Use the &ldquo;Set Current&rdquo; buttons below to change it.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
            Add Academic Session
          </h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-56">
              <Input
                label="Session Name"
                placeholder="e.g. 2025/2026"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />
            </div>
            <Button onClick={handleAddSession} isLoading={addingSession} disabled={!newSessionName.trim()}>
              <Plus className="h-4 w-4" />
              Add Session
            </Button>
          </div>
        </CardBody>
      </Card>

      {sessions.length === 0 && (
        <Card>
          <CardBody className="py-10 text-center text-sm text-ink-500">
            No academic sessions yet. Add one above to get started.
          </CardBody>
        </Card>
      )}

      {sessions.map((session) => {
        const sessionTerms = terms
          .filter((t) => t.sessionId === session.id)
          .sort((a, b) => a.order - b.order);
        const isCurrentSession = settings?.currentSessionId === session.id;
        const draft = newTermBySession[session.id] ?? { name: "", order: "" };

        return (
          <Card key={session.id}>
            <CardBody className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-ink">{session.name}</h3>
                  {isCurrentSession && <Badge tone="sage">Current</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  {!isCurrentSession && (
                    <Button variant="outline" size="sm" onClick={() => handleSetCurrentSession(session.id)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Set Current
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSession(session.id, session.name)}
                    className="text-rose hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-md border border-ink-300/20">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-ink-300/10">
                    {sessionTerms.map((term) => {
                      const isCurrentTerm = settings?.currentTermId === term.id;
                      return (
                        <tr key={term.id}>
                          <td className="px-4 py-2.5 font-medium text-ink">{term.name}</td>
                          <td className="px-4 py-2.5">
                            {isCurrentTerm && <Badge tone="sage">Current</Badge>}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex justify-end gap-2">
                              {!isCurrentTerm && (
                                <Button variant="outline" size="sm" onClick={() => handleSetCurrentTerm(term.id)}>
                                  Set Current
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTerm(term.id, term.name)}
                                className="text-rose hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {sessionTerms.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-xs text-ink-500">
                          No terms yet for this session.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="w-48">
                  <Input
                    label="Term Name"
                    placeholder="e.g. First Term"
                    value={draft.name}
                    onChange={(e) =>
                      setNewTermBySession((prev) => ({ ...prev, [session.id]: { ...draft, name: e.target.value } }))
                    }
                  />
                </div>
                <div className="w-24">
                  <Input
                    label="Order"
                    type="number"
                    placeholder={String(sessionTerms.length + 1)}
                    value={draft.order}
                    onChange={(e) =>
                      setNewTermBySession((prev) => ({ ...prev, [session.id]: { ...draft, order: e.target.value } }))
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleAddTerm(session.id)}
                  isLoading={addingTermFor === session.id}
                  disabled={!draft.name.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Add Term
                </Button>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
