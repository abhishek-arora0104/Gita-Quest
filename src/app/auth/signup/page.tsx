import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  return {
    title: locale === "hi" ? t.auth.signupTitle : "Create your account",
    description: t.auth.signupBody,
  };
}

export default async function SignupPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          {t.auth.signupTitle}
        </h1>
        <p className="mt-2 text-ink-soft">
          {t.auth.signupBody}
        </p>
      </div>
      <div className="mt-8">
        <SignupForm locale={locale} />
      </div>
    </div>
  );
}
