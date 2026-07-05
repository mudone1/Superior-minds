"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { MarketingButton } from "./MarketingButton";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/marketing/hero-future-doctor.jpg"
          alt="A Superior Minds Academy pupil, dressed as a doctor for career day, smiling confidently at an outdoor school event"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-royal-900/90 via-royal-900/50 to-royal-900/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-royal-900/40 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col px-4 pt-28 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 font-jakarta text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            Minna, Niger State, Nigeria
          </span>

          <h1 className="mt-6 max-w-3xl font-jakarta text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Shaping Bright Minds for{" "}
            <span className="bg-gradient-to-r from-gold-100 via-gold to-gold-400 bg-clip-text text-transparent">
              Tomorrow
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            Where excellence begins, character grows, and every child is inspired to achieve
            greatness.
          </p>

          <div className="mb-24 mt-10 flex flex-wrap gap-4">
            <a href="#admissions">
              <MarketingButton variant="gold" size="lg">
                Enroll Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </MarketingButton>
            </a>
            <a href="#admissions">
              <MarketingButton variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                Book a School Tour
              </MarketingButton>
            </a>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-9 w-6 rounded-full border-2 border-white/40 p-1">
          <div className="h-2 w-1 rounded-full bg-white/70" />
        </div>
      </div>
    </section>
  );
}
