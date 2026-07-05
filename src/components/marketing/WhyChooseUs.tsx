import {
  ShieldCheck,
  GraduationCap,
  Laptop2,
  Users2,
  Palette,
  Cpu,
  HeartHandshake,
  MessagesSquare,
} from "lucide-react";
import { FadeIn } from "./FadeIn";

const REASONS = [
  { icon: ShieldCheck, title: "Safe Learning Environment", description: "A secure, supervised campus where every child is looked after." },
  { icon: GraduationCap, title: "Qualified Teachers", description: "Experienced educators trained in modern, child-centered methods." },
  { icon: Laptop2, title: "Modern Teaching Methods", description: "Curricula that blend proven pedagogy with contemporary tools." },
  { icon: Users2, title: "Small Classroom Attention", description: "Class sizes that keep every pupil seen and supported." },
  { icon: Palette, title: "Creative Activities", description: "Art, music and play woven into everyday learning." },
  { icon: Cpu, title: "Technology Integration", description: "ICT skills built in from an early age, not bolted on later." },
  { icon: HeartHandshake, title: "Strong Moral Values", description: "Character and integrity taught alongside every subject." },
  { icon: MessagesSquare, title: "Excellent Parent Communication", description: "You always know how your child is doing — no guessing." },
];

export function WhyChooseUs() {
  return (
    <section className="bg-white py-24 dark:bg-royal-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold-600 dark:text-gold">
            The Difference
          </span>
          <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-tight text-royal-900 dark:text-white sm:text-4xl">
            Why Parents Choose Us
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, i) => (
            <FadeIn key={reason.title} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-royal/10 p-6 transition-all duration-300 hover:border-gold/40 hover:shadow-xl hover:shadow-royal/5 dark:border-white/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-royal to-royal-600">
                  <reason.icon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-jakarta text-base font-bold text-royal-900 dark:text-white">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-royal-700/70 dark:text-white/60">
                  {reason.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
