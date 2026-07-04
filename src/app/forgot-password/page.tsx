import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password — Superior Minds Academy",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account email and we'll send you a link to choose a new password."
      footer={
        <p>
          Remembered it after all?{" "}
          <a href="/login" className="font-medium text-indigo hover:underline">
            Back to sign in
          </a>
          .
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
