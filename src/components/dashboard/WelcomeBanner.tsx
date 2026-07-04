import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS, type SessionUser } from "@/types";

interface WelcomeBannerProps {
  user: SessionUser;
  blurb: string;
}

export function WelcomeBanner({ user, blurb }: WelcomeBannerProps) {
  const firstName = user.displayName.split(" ")[0] || user.displayName;
  return (
    <div className="rounded-xl border border-ink-300/30 bg-white p-6 sm:p-8">
      <Badge tone="indigo">{ROLE_LABELS[user.role]}</Badge>
      <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
        Welcome back, {firstName}
      </h2>
      <p className="mt-1 max-w-xl text-sm text-ink-500">{blurb}</p>
    </div>
  );
}
