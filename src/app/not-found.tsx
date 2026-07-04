import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-4 text-center">
      <Logo />
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brass-600">
          Record Not Found
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          This page isn&apos;t on file
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
The page you&apos;re looking for doesn&apos;t exist or may have moved.        </p>
      </div>
      <Link href={ROUTES.home}>
        <Button>Return home</Button>
      </Link>
    </div>
  );
}
