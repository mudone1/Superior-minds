import Image from "next/image";
import { Baby, Clock, Sun, Cpu, type LucideIcon } from "lucide-react";
import { FadeIn } from "./FadeIn";

type Program =
  | { kind: "photo"; title: string; description: string; image: string }
  | { kind: "icon"; title: string; description: string; icon: LucideIcon };

const PROGRAMS: Program[] = [
  {
    kind: "photo",
    title: "Nursery",
    description: "Play-based early learning that builds curiosity, language and social skills.",
    image: "/images/marketing/nursery-puzzle-play.jpg",
  },
  {
    kind: "photo",
    title: "Primary",
    description: "A rigorous academic core paired with character and leadership development.",
    image: "/images/marketing/students-staircase.jpg",
  },
  {
    kind: "photo",
    title: "Extracurricular Activities",
    description: "Chess, sports, arts and clubs that build confidence beyond the classroom.",
    image: "/images/marketing/chess-club.jpg",
  },
  { kind: "icon", title: "After School Activities", description: "Supervised, enriching activities for pupils staying beyond closing hours.", icon: Clock },
  { kind: "icon", title: "Summer Coaching", description: "Holiday programs that keep young minds engaged and growing.", icon: Sun },
  { kind: "icon", title: "ICT Education", description: "Hands-on computing skills taught from the earliest years.", icon: Cpu },
  { kind: "icon", title: "Creche", description: "Gentle, attentive early care for our youngest learners.", icon: Baby },
];

export function Programs() {
  return (
    <section id="programs" className="bg-royal-50/50 py-24 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold-600 dark:text-gold">
            Our Programs
          </span>
          <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-tight text-royal-900 dark:text-white sm:text-4xl">
            A Path for Every Age
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((program, i) => (
            <FadeIn key={program.title} delay={i * 0.05}>
              <div className="group h-full overflow-hidden rounded-3xl border border-royal/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-royal/10 dark:border-white/10 dark:bg-white/5">
                {program.kind === "photo" ? (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={program.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-royal-900/50 to-transparent" />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-royal-50 to-gold-50 dark:from-white/5 dark:to-white/10">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md dark:bg-white/10">
                      <program.icon className="h-7 w-7 text-royal dark:text-gold" aria-hidden="true" />
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-jakarta text-lg font-bold text-royal-900 dark:text-white">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-royal-700/70 dark:text-white/60">
                    {program.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
