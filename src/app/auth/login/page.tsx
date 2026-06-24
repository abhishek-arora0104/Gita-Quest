import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Gita Quest to continue learning.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          Welcome back
        </h1>
        <p className="mt-2 text-ink-soft">
          Log in to continue your journey through the Gita.
        </p>
      </div>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
