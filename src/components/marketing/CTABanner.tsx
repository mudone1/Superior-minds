import { ArrowRight, Mail } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { MarketingButton } from "./MarketingButton";

export function CTABanner() {
  return (
    <section id="cta" className="relative overflow-hidden bg-royal py-24 dark:bg-royal-900">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(212,175,55,0.4), transparent 40%), radial-gradient(circle at 80% 80%, rgba(212,175,55,0.3), transparent 40%)",
        }}
        aria-hidden="true"
      />
      <FadeIn className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-jakarta text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Give Your Child the Best Start in Life.
        </h2>
        <p className="mt-4 text-lg text-white/75">
          Places for the next term are filling up — reach out today to schedule a visit.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a href="mailto:admissions@superiorminds.edu.ng?subject=School%20Enrollment%20Enquiry">
            <MarketingButton variant="gold" size="lg">
              Apply Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </MarketingButton>
          </a>
          <a href="#footer-contact">
            <MarketingButton
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Contact Us
            </MarketingButton>
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
