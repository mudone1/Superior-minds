"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { FadeIn } from "./FadeIn";

// Placeholder data — replace with real parent testimonials before launch.
const TESTIMONIALS = [
  {
    quote:
      "Superior Minds Academy has given our daughter a real love for learning. The teachers know her by name, and we always know how she's doing.",
    name: "A Parent",
    role: "Primary 3 Parent",
  },
  {
    quote:
      "The balance of discipline, creativity and academics here is exactly what we wanted for our son. He looks forward to school every morning.",
    name: "A Parent",
    role: "Nursery 2 Parent",
  },
  {
    quote:
      "From the ICT lab to the chess club, our children are challenged in ways we didn't expect from a primary school. Outstanding staff.",
    name: "A Parent",
    role: "Primary 5 Parent",
  },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);

  function next() {
    setIndex((i) => (i + 1) % TESTIMONIALS.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }

  return (
    <section className="bg-royal-50/50 py-24 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center">
          <span className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold-600 dark:text-gold">
            What Parents Say
          </span>
          <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-tight text-royal-900 dark:text-white sm:text-4xl">
            Trusted by Families
          </h2>
        </FadeIn>

        <div className="relative mt-14">
          <Quote className="mx-auto h-10 w-10 text-gold/40" aria-hidden="true" />
          <div className="relative mt-4 min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-center"
              >
                <p className="font-jakarta text-xl font-medium leading-relaxed text-royal-900 dark:text-white sm:text-2xl">
                  &ldquo;{TESTIMONIALS[index]!.quote}&rdquo;
                </p>
                <div className="mt-6 font-jakarta text-sm font-bold text-royal dark:text-gold">
                  {TESTIMONIALS[index]!.name}
                </div>
                <div className="text-xs text-royal-700/60 dark:text-white/50">
                  {TESTIMONIALS[index]!.role}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-royal/15 text-royal hover:bg-royal/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.name + i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-gold" : "w-2 bg-royal/20 dark:bg-white/20"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-royal/15 text-royal hover:bg-royal/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
