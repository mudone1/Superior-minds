"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, ArrowRight } from "lucide-react";
import { MarketingButton } from "./MarketingButton";
import { ROUTES } from "@/lib/constants";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Gallery", href: "#gallery" },
  { label: "Facilities", href: "#facilities" },
  { label: "Admissions", href: "#admissions" },
];

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export function Navbar({ isDark, onToggleDark }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-white/70 shadow-sm backdrop-blur-xl dark:bg-royal-900/70"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="#top" className="flex items-center gap-2.5" aria-label="Superior Minds Academy — home">
          <Image
            src="/branding/superior-minds-logo.png"
            alt=""
            width={40}
            height={34}
            className="h-9 w-auto"
            priority
          />
          <span
            className={`font-jakarta text-base font-bold tracking-tight transition-colors ${
              scrolled || mobileOpen ? "text-royal dark:text-white" : "text-royal dark:text-white"
            }`}
          >
            Superior Minds Academy
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-jakarta text-sm font-medium text-royal-700 transition-colors hover:text-gold-600 dark:text-white/80 dark:hover:text-gold"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-royal/15 text-royal transition-colors hover:bg-royal/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link href={ROUTES.login}>
            <MarketingButton variant="outline" size="md">
              Staff &amp; Parent Login
            </MarketingButton>
          </Link>
          <a href="#admissions">
            <MarketingButton variant="gold" size="md">
              Enroll Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </MarketingButton>
          </a>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-royal dark:text-white lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-royal/10 bg-white/95 backdrop-blur-xl dark:bg-royal-900/95 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-jakarta text-sm font-medium text-royal-700 hover:bg-royal/5 dark:text-white/80 dark:hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-royal/10 pt-3 dark:border-white/10">
                <button
                  type="button"
                  onClick={onToggleDark}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left font-jakarta text-sm font-medium text-royal-700 hover:bg-royal/5 dark:text-white/80 dark:hover:bg-white/10"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? "Light mode" : "Dark mode"}
                </button>
                <Link href={ROUTES.login} onClick={() => setMobileOpen(false)}>
                  <MarketingButton variant="outline" size="md" className="w-full">
                    Staff &amp; Parent Login
                  </MarketingButton>
                </Link>
                <a href="#admissions" onClick={() => setMobileOpen(false)}>
                  <MarketingButton variant="gold" size="md" className="w-full">
                    Enroll Now
                  </MarketingButton>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
