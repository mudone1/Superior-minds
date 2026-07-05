import { Trophy, ShieldCheck, Scale, Lightbulb, Users, Heart, Rocket, HeartHandshake } from "lucide-react";
import { FadeIn } from "./FadeIn";

const VALUES = [
  { icon: Trophy, title: "Academic Excellence" },
  { icon: ShieldCheck, title: "Integrity" },
  { icon: Scale, title: "Discipline" },
  { icon: Lightbulb, title: "Creativity" },
  { icon: Users, title: "Leadership" },
  { icon: Heart, title: "Respect" },
  { icon: Rocket, title: "Innovation" },
  { icon: HeartHandshake, title: "Compassion" },
];

export function CoreValues() {
  return (
    <section className="bg-royal-50/50 py-24 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold-600 dark:text-gold">
            What We Stand For
          </span>
          <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-tight text-royal-900 dark:text-white sm:text-4xl">
            Our Core Values
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {VALUES.map((value, i) => (
            <FadeIn key={value.title} delay={i * 0.05}>
              <div className="group flex h-full flex-col items-center gap-4 rounded-2xl border border-royal/10 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-royal/10 dark:border-white/10 dark:bg-white/5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-royal/5 transition-colors duration-300 group-hover:bg-gold/15 dark:bg-white/10">
                  <value.icon className="h-6 w-6 text-royal transition-colors duration-300 group-hover:text-gold-600 dark:text-white" />
                </div>
                <h3 className="font-jakarta text-sm font-bold text-royal-900 dark:text-white">
                  {value.title}
                </h3>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
