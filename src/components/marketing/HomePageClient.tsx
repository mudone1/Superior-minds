"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { Stats } from "@/components/marketing/Stats";
import { About } from "@/components/marketing/About";
import { CoreValues } from "@/components/marketing/CoreValues";
import { WhyChooseUs } from "@/components/marketing/WhyChooseUs";
import { Programs } from "@/components/marketing/Programs";
import { Gallery } from "@/components/marketing/Gallery";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Facilities } from "@/components/marketing/Facilities";
import { Admissions } from "@/components/marketing/Admissions";
import { CTABanner } from "@/components/marketing/CTABanner";
import { Footer } from "@/components/marketing/Footer";
import { BackToTop } from "@/components/marketing/BackToTop";

const DARK_MODE_STORAGE_KEY = "sma-marketing-theme";

export function HomePageClient() {
  const [isDark, setIsDark] = useState(false);

  // Restore the visitor's last theme choice on mount. Scoped to this page
  // only — the authenticated dashboard doesn't use dark mode.
  useEffect(() => {
    const stored = window.localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (stored === "dark") setIsDark(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DARK_MODE_STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-white font-body dark:bg-royal-900">
        <Navbar isDark={isDark} onToggleDark={() => setIsDark((v) => !v)} />
        <main>
          <Hero />
          <Stats />
          <About />
          <CoreValues />
          <WhyChooseUs />
          <Programs />
          <Gallery />
          <Testimonials />
          <Facilities />
          <Admissions />
          <CTABanner />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </div>
  );
}
