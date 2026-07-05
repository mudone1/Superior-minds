"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { GraduationCap, Users, Smile, Sparkles } from "lucide-react";

const STATS = [
  { icon: GraduationCap, target: 10, suffix: "+", label: "Years of Excellence" },
  { icon: Users, target: 30, suffix: "+", label: "Dedicated Teachers" },
  { icon: Smile, target: 500, suffix: "+", label: "Happy Pupils" },
  { icon: Sparkles, target: 100, suffix: "%", label: "Creative Learning Environment" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 1800, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionValue.set(target);
  }, [inView, motionValue, target]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (v) => setDisplay(Math.round(v)));
    return () => unsubscribe();
  }, [springValue]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative bg-royal py-16 dark:bg-royal-900">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
              <stat.icon className="h-6 w-6 text-gold" aria-hidden="true" />
            </div>
            <div className="mt-4 font-jakarta text-4xl font-extrabold text-white sm:text-5xl">
              <Counter target={stat.target} suffix={stat.suffix} />
            </div>
            <div className="mt-2 text-sm text-white/70">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
