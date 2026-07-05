"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds — use for sequencing multiple FadeIns in one section. */
  delay?: number;
  /** Distance (px) the content travels while fading in. */
  distance?: number;
  as?: "div" | "span";
}

/**
 * Fades and slides content in once it scrolls into view. Respects
 * prefers-reduced-motion by skipping the transform entirely — people who've
 * asked their OS for less motion get an instant, still appearance rather
 * than a suppressed-but-still-running animation.
 */
export function FadeIn({ children, className, delay = 0, distance = 24 }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.01 : 0.6, delay, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
