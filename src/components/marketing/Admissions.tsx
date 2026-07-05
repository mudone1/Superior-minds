import { CalendarCheck, Users, FileCheck, GraduationCap, ArrowRight } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { MarketingButton } from "./MarketingButton";

const STEPS = [
  { icon: CalendarCheck, title: "Schedule a Visit", description: "Book a convenient time to tour our campus." },
  { icon: Users, title: "Meet Our Team", description: "Speak with our teachers and administrators." },
  { icon: FileCheck, title: "Apply", description: "Complete a simple, guided application." },
  { icon: GraduationCap, title: "Begin Learning", description: "Welcome your child to Superior Minds Academy." },
];

export function Admissions() {
  return (
    <section id="admissions" className="bg-royal-50/50 py-24 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold-600 dark:text-gold">
            Admissions
          </span>
          <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-tight text-royal-900 dark:text-white sm:text-4xl">
            Four Simple Steps
          </h2>
        </FadeIn>

        <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-royal/20 to-transparent lg:block"
            aria-hidden="true"
          />
          {STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.1}>
              <div className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-royal to-royal-600 shadow-lg shadow-royal/20">
                  <step.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold font-jakarta text-xs font-bold text-royal-900">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-jakarta text-base font-bold text-royal-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-royal-700/70 dark:text-white/60">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-16 flex justify-center">
          <a href="#cta">
            <MarketingButton variant="gold" size="lg">
              Start Your Application
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </MarketingButton>
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
