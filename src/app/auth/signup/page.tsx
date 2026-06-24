import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Sign up for Gita Quest and begin your journey through the Gita.",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          Begin your journey
        </h1>
        <p className="mt-2 text-ink-soft">
          Create a free account to track your progress and earn rewards.
        </p>
      </div>
      <div className="mt-8">
        <SignupForm />
      </div>
    </div>
  );
}
