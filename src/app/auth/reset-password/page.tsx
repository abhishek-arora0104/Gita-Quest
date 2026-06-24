import type { Metadata } from "next";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  return {
    title: locale === "hi" ? "पासवर्ड रीसेट करें" : "Reset password",
    description: t.auth.resetBody,
    robots: { index: false },
  };
}

export default async function ResetPasswordPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          {t.auth.resetTitle}
        </h1>
        <p className="mt-2 text-ink-soft">
          {t.auth.resetBody}
        </p>
      </div>
      <div className="mt-8">
        <ResetPasswordForm locale={locale} />
      </div>
    </div>
  );
}
