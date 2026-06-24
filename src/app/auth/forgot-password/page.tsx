import type { Metadata } from "next";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Gita Quest password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          Forgot your password?
        </h1>
        <p className="mt-2 text-ink-soft">
          Enter your email and we'll send you a link to reset it.
        </p>
      </div>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
