import Image from "next/image";
import { FadeIn } from "./FadeIn";

export function About() {
  return (
    <section id="about" className="bg-white py-24 dark:bg-royal-900">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <FadeIn>
          <span className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold-600 dark:text-gold">
            Welcome
          </span>
          <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-tight text-royal-900 dark:text-white sm:text-4xl lg:text-5xl">
            Welcome to Superior Minds Academy
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-royal-700/80 dark:text-white/70">
            Superior Minds Academy is committed to providing quality nursery and primary
            education in a safe, nurturing and stimulating environment. We combine academic
            excellence, character development, creativity, leadership and modern teaching
            methods to prepare every child for lifelong success.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-royal/10 bg-royal-50 p-6 dark:border-white/10 dark:bg-white/5">
              <h3 className="font-jakarta text-lg font-bold text-royal-900 dark:text-white">
                Our Mission
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-royal-700/70 dark:text-white/60">
                To nurture confident, disciplined, innovative and academically excellent
                learners through quality education, strong moral values and creative learning
                experiences.
              </p>
            </div>
            <div className="rounded-2xl border border-gold/20 bg-gold-50 p-6 dark:border-white/10 dark:bg-white/5">
              <h3 className="font-jakarta text-lg font-bold text-royal-900 dark:text-white">
                Our Vision
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-royal-700/70 dark:text-white/60">
                To become one of Nigeria&apos;s leading basic education institutions recognized
                for excellence, innovation and character development.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-royal/20">
            <Image
              src="/images/marketing/students-staircase.jpg"
              alt="Superior Minds Academy pupils and staff pausing together on the school's staircase"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-5 shadow-xl sm:block dark:bg-royal-700">
            <div className="font-jakarta text-2xl font-extrabold text-royal dark:text-gold">
              A+
            </div>
            <div className="text-xs text-royal-700/60 dark:text-white/60">
              Parent satisfaction rating
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
