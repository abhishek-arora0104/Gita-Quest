import type { Metadata } from "next";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password for your Gita Quest account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          Set a new password
        </h1>
        <p className="mt-2 text-ink-soft">
          Choose a strong password for your account.
        </p>
      </div>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
