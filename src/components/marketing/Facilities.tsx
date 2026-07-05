import { Monitor, Library, Cpu, Trees, Bus, BookOpenCheck } from "lucide-react";
import { FadeIn } from "./FadeIn";

const FACILITIES = [
  { icon: Monitor, title: "Smart Classrooms" },
  { icon: Library, title: "Library" },
  { icon: Cpu, title: "ICT Lab" },
  { icon: Trees, title: "Playground" },
  { icon: Bus, title: "School Bus" },
  { icon: BookOpenCheck, title: "Learning Resources" },
];

export function Facilities() {
  return (
    <section id="facilities" className="bg-white py-24 dark:bg-royal-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold-600 dark:text-gold">
            Our Campus
          </span>
          <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-tight text-royal-900 dark:text-white sm:text-4xl">
            Facilities Built for Learning
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITIES.map((facility, i) => (
            <FadeIn key={facility.title} delay={i * 0.05}>
              <div className="flex items-center gap-4 rounded-2xl border border-royal/10 bg-royal-50/60 p-6 transition-all duration-300 hover:border-gold/40 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-royal/10 dark:bg-white/10">
                  <facility.icon className="h-5 w-5 text-royal dark:text-gold" aria-hidden="true" />
                </div>
                <h3 className="font-jakarta text-base font-bold text-royal-900 dark:text-white">
                  {facility.title}
                </h3>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
