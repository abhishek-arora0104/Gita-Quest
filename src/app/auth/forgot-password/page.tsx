import type { Metadata } from "next";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  return {
    title: locale === "hi" ? "पासवर्ड भूल गए" : "Forgot password",
    description: t.auth.forgotBody,
  };
}

export default async function ForgotPasswordPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          {t.auth.forgotTitle}
        </h1>
        <p className="mt-2 text-ink-soft">
          {t.auth.forgotBody}
        </p>
      </div>
      <div className="mt-8">
        <ForgotPasswordForm locale={locale} />
      </div>
    </div>
  );
}
