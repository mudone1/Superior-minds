"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { listUsers } from "@/lib/firebase/users";
import { UserAvatar } from "@/components/users";
import type { AppUser } from "@/types";

interface ParentPickerProps {
  value: { uid: string; name: string } | null;
  onChange: (value: { uid: string; name: string } | null) => void;
}

export function ParentPicker({ value, onChange }: ParentPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AppUser[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      listUsers({ role: "parent", search: query, pageSize: 6 })
        .then((res) => setResults(res.users))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-ink-300/60 bg-paper px-3 py-2.5">
        <UserAvatar photoURL={null} displayName={value.name} size="sm" />
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">{value.name}</p>
          <p className="text-xs text-ink-500">Linked parent account</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-md p-1.5 text-ink-500 hover:bg-ink/5"
          aria-label="Remove linked parent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search parent by name or email…"
          className="h-11 w-full rounded-md border border-ink-300/60 bg-white pl-9 pr-3 text-sm text-ink placeholder:text-ink-300 transition-colors focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20"
        />
      </div>
      {open && query.trim() && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-ink-300/20 bg-white py-1 shadow-panel">
          {loading && <p className="px-3 py-2 text-sm text-ink-500">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-ink-500">No matching parent accounts.</p>
          )}
          {!loading &&
            results.map((u) => (
              <button
                key={u.uid}
                type="button"
                onClick={() => {
                  onChange({ uid: u.uid, name: u.displayName });
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-ink/5"
              >
                <UserAvatar photoURL={u.photoURL} displayName={u.displayName} size="sm" />
                <div>
                  <p className="text-sm font-medium text-ink">{u.displayName}</p>
                  <p className="text-xs text-ink-500">{u.email}</p>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
