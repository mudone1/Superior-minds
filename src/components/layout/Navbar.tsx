"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

const links = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-300/20 bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.home} aria-label="Superior Minds Academy home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-500 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href={ROUTES.login}>
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-ink md:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-300/20 bg-paper px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-1.5 text-sm font-medium text-ink-500"
              >
                {link.label}
              </a>
            ))}
            <Link href={ROUTES.login} onClick={() => setOpen(false)}>
              <Button variant="primary" size="sm" fullWidth>
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
