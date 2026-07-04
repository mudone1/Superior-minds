import { Logo } from "@/components/layout/Logo";

export const metadata = {
  title: "You're offline — Superior Minds Academy",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-4 text-center">
      <Logo />
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brass-600">
          No Connection
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          You&apos;re offline
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          This page hasn&apos;t been saved for offline use yet. Reconnect to the
          internet and try again.
        </p>
      </div>
    </div>
  );
}
