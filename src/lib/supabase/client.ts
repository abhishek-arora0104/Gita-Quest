import { createBrowserClient } from "@supabase/ssr";

// Cache the Supabase client in a module-level variable
let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Supabase client for use in Client Components.
 * Reads env vars at call-time so auth state changes reflect.
 */
export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.local.example to .env.local and fill in your Supabase project values.",
    );
  }

  client = createBrowserClient(url, anonKey);
  return client;
}
