import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Gita Quest to continue learning.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const locale = await getRequestLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          {t.auth.loginTitle}
        </h1>
        <p className="mt-2 text-ink-soft">
          {t.auth.loginBody}
        </p>
      </div>
      <div className="mt-8">
        <LoginForm redirectTo={redirectTo} locale={locale} />
      </div>
    </div>
  );
}
