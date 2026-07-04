import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { ROUTES } from "@/lib/constants";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-4 text-center">
      <Logo />
      <ShieldAlert className="h-10 w-10 text-rose" aria-hidden="true" />
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Access restricted</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          Your account doesn&apos;t have permission to view that page, or has been suspended.
          Contact your administrator if you believe this is a mistake.
        </p>
      </div>
      <Link href={ROUTES.login}>
        <Button variant="outline">Back to sign in</Button>
      </Link>
    </div>
  );
}
