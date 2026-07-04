import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { FullPageSpinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Sign in — Superior Minds Academy",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with the email and password issued by your administrator."
      footer={
        <p>
          Trouble signing in?{" "}
          <a href="/forgot-password" className="font-medium text-indigo hover:underline">
            Reset your password
          </a>
          .
        </p>
      }
    >
      <Suspense fallback={<FullPageSpinner />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
