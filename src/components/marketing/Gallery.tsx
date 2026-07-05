"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { FadeIn } from "./FadeIn";

const PHOTOS = [
  {
    src: "/images/marketing/hero-future-doctor.jpg",
    alt: "A pupil dressed as a doctor for career day at a school event",
    span: "row-span-2",
  },
  {
    src: "/images/marketing/students-staircase.jpg",
    alt: "Pupils and staff on the school staircase",
    span: "",
  },
  {
    src: "/images/marketing/nursery-puzzle-play.jpg",
    alt: "Nursery pupils playing with puzzles and building blocks",
    span: "",
  },
  {
    src: "/images/marketing/chess-club.jpg",
    alt: "Pupils learning chess together in a classroom",
    span: "row-span-2",
  },
  {
    src: "/images/marketing/spelling-bee-winner.jpg",
    alt: "A pupil holding a trophy and certificate after winning a spelling bee competition",
    span: "",
  },
];

export function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function close() {
    setActiveIndex(null);
  }
  function next() {
    setActiveIndex((i) => (i === null ? null : (i + 1) % PHOTOS.length));
  }
  function prev() {
    setActiveIndex((i) => (i === null ? null : (i - 1 + PHOTOS.length) % PHOTOS.length));
  }

  return (
    <section id="gallery" className="bg-white py-24 dark:bg-royal-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold-600 dark:text-gold">
            Life at Superior Minds
          </span>
          <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-tight text-royal-900 dark:text-white sm:text-4xl">
            Moments from Our Campus
          </h2>
        </FadeIn>

        <div className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PHOTOS.map((photo, i) => (
            <FadeIn key={photo.src} delay={i * 0.05} className={photo.span}>
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                className="group relative block h-full w-full overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                aria-label={`View larger: ${photo.alt}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-royal-900/0 transition-colors duration-300 group-hover:bg-royal-900/20" />
              </button>
            </FadeIn>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-royal-900/95 p-4 backdrop-blur-sm"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Photo preview"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close preview"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous photo"
              className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-8"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative h-[70vh] w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={PHOTOS[activeIndex]!.src}
                alt={PHOTOS[activeIndex]!.alt}
                fill
                sizes="90vw"
                className="rounded-xl object-contain"
              />
            </motion.div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next photo"
              className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-8"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
