import Link from "next/link";
import {
  GraduationCap,
  Users,
  ShieldCheck,
  BookOpenCheck,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

const roleCards = [
  {
    title: "Super Admin",
    description: "Oversees every campus, every account, and system-wide configuration.",
    icon: ShieldCheck,
  },
  {
    title: "Administrator",
    description: "Manages staff, students, and the school's day-to-day operations.",
    icon: Users,
  },
  {
    title: "Administrative Staff",
    description: "Handles admissions, records, and front-office coordination.",
    icon: BookOpenCheck,
  },
  {
    title: "Teacher",
    description: "Runs classes, records grades, and tracks student progress.",
    icon: GraduationCap,
  },
  {
    title: "Parent",
    description: "Follows a child's attendance, grades, and fee statements.",
    icon: Users,
  },
];

const stats = [
  { label: "Roll No.", value: "001", detail: "Founding record of this ledger" },
  { label: "Roles Supported", value: "05", detail: "Super Admin to Parent" },
  { label: "Uptime Target", value: "99.9%", detail: "For a school that never pauses" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-ink-300/20">
          <div className="absolute inset-0 bg-ledger-lines opacity-30" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <span className="inline-flex items-center rounded-full border border-brass-100 bg-brass-50 px-3 py-1 font-mono text-xs uppercase tracking-widest text-brass-600">
                Record No. 001 — Enrollment Ledger
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                One ledger. Every role.
                <span className="italic text-indigo"> Every record kept true.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-500">
                Superior Minds Academy runs its admissions, staff, classes, and family
                communication from a single, role-aware system — so the person who needs a
                record can find it, and no one else can.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={ROUTES.login}>
                  <Button size="lg">
                    Sign in to your dashboard
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <a href="#programs">
                  <Button size="lg" variant="outline">
                    Explore programs
                  </Button>
                </a>
              </div>

              <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-ink-300/20 pt-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
                      {stat.label}
                    </dt>
                    <dd className="font-display text-2xl font-semibold text-ink">
                      {stat.value}
                    </dd>
                    <dd className="text-xs text-ink-500">{stat.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-6 rounded-2xl border border-brass-100 bg-white shadow-panel">
                <div className="flex items-center justify-between border-b border-ink-300/20 px-6 py-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-ink-500">
                    Student Ledger — Term 2
                  </span>
                  <span className="font-mono text-xs text-brass-600">Verified</span>
                </div>
                <div className="space-y-4 p-6">
                  {["Attendance", "Grades", "Fee Balance"].map((row, i) => (
                    <div key={row} className="flex items-center justify-between">
                      <span className="text-sm text-ink-500">{row}</span>
                      <span
                        className={`font-mono text-sm font-medium ${
                          i === 2 ? "text-brass-600" : "text-sage-600"
                        }`}
                      >
                        {i === 0 ? "96%" : i === 1 ? "A−" : "$0.00"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Built like a school's own record book
            </h2>
            <p className="mt-4 text-ink-500">
              Every account belongs to exactly one role, and every role opens straight to the
              dashboard built for it. Nothing to configure, nothing to guess — sign in, and the
              system already knows what you're here to do.
            </p>
          </div>
        </section>

        {/* Programs / Roles */}
        <section id="programs" className="border-t border-ink-300/20 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-semibold text-ink">
              A dashboard for every seat at the table
            </h2>
            <p className="mt-3 max-w-xl text-ink-500">
              Five roles, five focused workspaces — each scoped to exactly what that person is
              responsible for.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {roleCards.map((role) => (
                <div
                  key={role.title}
                  className="rounded-xl border border-ink-300/30 p-6 transition-shadow hover:shadow-card"
                >
                  <role.icon className="h-6 w-6 text-brass-600" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                    {role.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">
                Already have an account?
              </h2>
              <p className="mt-1 text-indigo-100">
                Sign in to pick up exactly where your dashboard left off.
              </p>
            </div>
            <Link href={ROUTES.login}>
              <Button size="lg" variant="secondary">
                Sign in
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
