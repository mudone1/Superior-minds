import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** "dark" sits on light backgrounds, "light" sits on the indigo panel — reserved for future theming, the crest artwork itself is already full-color. */
  variant?: "light" | "dark";
  /** The crest artwork already contains the "Superior Minds Academy" wordmark and ribbon, so this only controls whether a compact text label renders alongside it. */
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-16 w-16",
};

// Lives in /public and is referenced by URL (not a static `import`) since
// Next.js's build-time image import pipeline isn't intended for assets that
// already live in /public — those are meant to be served as-is by URL.
// True pixel size (546x457) is passed to next/image for aspect ratio /
// layout-shift purposes; the Tailwind size classes control the actual
// rendered size.
const LOGO_SRC = "/branding/superior-minds-logo.png";
const LOGO_INTRINSIC_WIDTH = 546;
const LOGO_INTRINSIC_HEIGHT = 457;

/**
 * Superior Minds Academy's crest — a purple shield with a puzzle-piece
 * brain, book, and pen, banded by a "Building Great Minds" ribbon. The
 * wordmark is baked into the artwork, so this component just places the
 * crest at the right size; `showWordmark` only toggles a compact text
 * label alongside it for places where the full crest reads too small.
 */
export function Logo({ className, showWordmark = true, size = "md" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src={LOGO_SRC}
        alt="Superior Minds Academy"
        width={LOGO_INTRINSIC_WIDTH}
        height={LOGO_INTRINSIC_HEIGHT}
        className={cn("shrink-0 object-contain", sizeClasses[size])}
        priority
      />
      {showWordmark && size === "sm" && (
        <span className="font-display text-sm font-semibold leading-none text-ink">
          Superior Minds
          <span className="block font-body text-[9px] font-medium uppercase tracking-[0.2em] text-brass-600">
            Academy
          </span>
        </span>
      )}
    </div>
  );
}
