"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
import { dashboardPathForRole } from "@/lib/roles";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Enter both your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/dashboard") ? next : dashboardPathForRole(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@superiorminds.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-[38px] text-ink-500 hover:text-ink"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex items-center justify-end">
        <a href="/forgot-password" className="text-sm font-medium text-indigo hover:underline">
          Forgot password?
        </a>
      </div>

      <Button type="submit" isLoading={submitting} fullWidth size="lg">
        Sign in
      </Button>
    </form>
  );
}
