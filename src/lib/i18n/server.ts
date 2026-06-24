import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

export async function getRequestLocale(): Promise<Locale> {
  const headerLocale = (await headers()).get("x-gita-locale");
  return isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
}

