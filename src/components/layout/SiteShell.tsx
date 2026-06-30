import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function SiteShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <>
      <Navbar locale={locale} />
      <main id="main-content" className="flex-1">{children}</main>
      <ChatbotWidget locale={locale} />
      <Footer locale={locale} t={t} />
    </>
  );
}
