# Gita Quest — Code Analysis

> Thorough review of the entire codebase covering security, bugs, performance, architecture, and UX.

---

## 🔴 Critical Issues

### 1. Daily Login Race Condition — Double XP Award
**File:** [claimDailyLogin.ts](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/actions/claimDailyLogin.ts#L20-L43)

The daily login check reads `daily_login_claimed`, then inserts XP and updates the flag in **separate operations** with no lock. Two rapid concurrent requests can both pass the `profile?.daily_login_claimed === today` check and award XP twice.

**Fix:** Use an atomic conditional update:
```sql
UPDATE profiles SET daily_login_claimed = today WHERE id = user.id AND daily_login_claimed IS DISTINCT FROM today
```
Check affected rows to decide whether to award XP.

---

### 2. Streak Calculation Uses Server Time, Not User Timezone
**File:** [streaks.ts](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/lib/gamification/streaks.ts#L14-L16)

`todayISO()` uses `new Date()` which returns **server UTC time** (or whatever the Vercel Edge runtime timezone is). A user in IST (+5:30) doing their activity at 11 PM local time would have their streak evaluated against the UTC date, potentially crediting the wrong day or breaking their streak unfairly.

**Impact:** Users in non-UTC timezones may lose streaks or get double-counted days.

**Fix:** Either pass the user's timezone (from browser) to the server action, or use a more forgiving ±2h window around midnight.

---

### 3. OAuth Callback Missing Locale Awareness
**File:** [callback/route.ts](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/app/auth/callback/route.ts#L13-L42)

- The `next` fallback defaults to `/dashboard` (no locale prefix). This will redirect to a bare path which the proxy will then redirect again — causing an extra hop.
- The error redirect also uses bare `/auth/login?error=auth_callback_failed`, which the proxy will redirect to the default locale. Users on Hindi will land on the English login page.

**Fix:** Read the `gita-locale` cookie from the request and build locale-aware redirect URLs.

---

### 4. `completeQuiz` Uses Non-Locale `getChapterByNumber`
**File:** [completeQuiz.ts](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/actions/completeQuiz.ts#L47)

```ts
const chapter = getChapterByNumber(chapterNumber);
```

This always loads the **English** chapter data. If a Hindi user takes the quiz, the server re-scores their answers against the English answer key. Since Hindi and English quizzes may have different `correctIndex` values per question, this could incorrectly score answers.

> [!CAUTION]
> This is a **data integrity** bug. Hindi quiz scores may be wrong.

**Fix:** Pass the locale to the server action and use `getChapterByNumberForLocale(chapterNumber, locale)`.

---

## 🟠 Security Concerns

### 5. Answer Key Sent to the Client
**File:** [quiz/page.tsx](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/app/chapters/%5Bslug%5D/quiz/page.tsx)

The quiz page passes the full `answerKey` (with `correctIndex` and `explanation`) to the `QuizEngine` client component. A user can open DevTools, inspect React component props, and see all correct answers before answering.

**Impact:** Low for a learning app (self-sabotage), but worth noting.

**Mitigation:** Move to per-question server calls, or accept this trade-off for the UX benefit of instant client-side feedback.

### 6. No Rate Limiting on Server Actions
**Files:** All server actions in [actions/](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/actions)

Server actions like `completeQuiz`, `markSummaryRead`, and `claimDailyLogin` have no rate limiting. A malicious user could spam `completeQuiz` to flood the `user_quiz_attempts` and `user_xp_log` tables.

**Impact:** Medium — could bloat database, though RLS prevents cross-user abuse.

### 7. `requireUser` Throws a Raw Error
**File:** [session.ts](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/lib/auth/session.ts#L19-L25)

`requireUser()` throws `new Error("UNAUTHENTICATED")` — but this is never caught gracefully. If used in a page, it would trigger a Next.js error boundary showing an ugly 500 page instead of redirecting to login.

**Note:** Currently `requireUser()` isn't used anywhere (all pages use `getCurrentUser()` with manual null checks), so this is dormant. Consider removing it or implementing a proper redirect.

---

## 🟡 Bugs & Logic Issues

### 8. `refreshProfile` Reads ALL XP Rows Every Call
**File:** [markSummaryRead.ts](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/actions/markSummaryRead.ts#L74-L78)

```ts
const { data: xpRows } = await supabase
  .from("user_xp_log")
  .select("amount")
  .eq("user_id", userId);
const totalXp = (xpRows ?? []).reduce((s, r) => s + r.amount, 0);
```

This fetches **every XP log row** and sums them in JavaScript. Called on every action (mark read, quiz complete, daily login, save reflection). As users accumulate XP entries, this gets increasingly slow and transfers more data.

**Fix:** Use a Supabase RPC or a SQL aggregate:
```sql
SELECT COALESCE(SUM(amount), 0) FROM user_xp_log WHERE user_id = $1
```

### 9. Sitemap Generates Duplicate Entries
**File:** [sitemap.ts](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/app/sitemap.ts)

The sitemap loops `for (const locale of locales)` and creates entries for each locale, but each entry already includes `alternates.languages` pointing to both locales. This means `/en` and `/hi` for the same path appear as **separate** entries with identical alternates — technically valid but creates 2× the entries a search engine needs to process (e.g., 36 chapter entries instead of 18).

**Impact:** Low — search engines handle it, but it's redundant.

### 10. Dashboard Hard-Codes `/25` for Quiz Score
**File:** [dashboard/page.tsx](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/app/dashboard/page.tsx#L207)

```tsx
{quizzed ? `${t.dashboard.quizDone} ${best}/25` : ...}
```

The `25` is hard-coded. If quiz lengths ever change, this will be wrong.

**Fix:** Use the actual quiz length from the content registry or store `total` alongside `best_score` in the progress table.

### 11. `DailyLoginButton` Doesn't Reflect Pre-Claimed State
**File:** [DailyLoginButton.tsx](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/components/gamification/DailyLoginButton.tsx#L8)

The button always starts as `claimed = false`. If the user already claimed today and refreshes the dashboard, they see the "Claim" button again, click it, and it silently succeeds (setting `claimed = true` with no visual reward). The server side handles idempotency, but the UX is confusing.

**Fix:** Pass `alreadyClaimed` from the dashboard page (which already fetches `daily_login_claimed`) as a prop.

---

## 🔵 Architecture & Performance

### 12. Mobile Navigation Missing Key Links
**File:** [Navbar.tsx](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/components/layout/Navbar.tsx#L55-L59)

The mobile nav only shows the language switcher and auth button. The **Chapters** and **About** links are in the `hidden md:flex` desktop section and are completely invisible on mobile.

> [!IMPORTANT]
> Mobile users have no way to navigate to the Chapters page or About page from the navbar. They can only reach them via the homepage CTA or direct URL.

**Fix:** Add a mobile hamburger menu or show the links in a row on mobile.

### 13. No Loading/Error UI for Dashboard
**File:** [dashboard/page.tsx](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/app/dashboard/page.tsx)

The dashboard makes 4 parallel Supabase queries but has no `loading.tsx` or `error.tsx` boundaries. If any query is slow (cold start, network issues), the user sees a blank white page until all resolve. A Supabase outage would show the default Next.js error page.

### 14. `ProgressBar` Component Missing `max` Prop Handling
**File:** [QuizResults.tsx](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/components/quiz/QuizResults.tsx#L61-L65)

```tsx
<ProgressBar value={pct} tone={...} />
```

`pct` is a percentage (0-100), but earlier in `QuizEngine`, `ProgressBar` is used as `value={current + 1} max={questions.length}`. It's unclear if `ProgressBar` treats `value` as a raw amount (needing `max`) or a percentage. This could cause the results progress bar to display incorrectly if it expects a max prop.

### 15. Client-Side Browser Client Is Not a Singleton
**File:** [client.ts](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/lib/supabase/client.ts)

`createClient()` creates a **new** Supabase browser client every call. While `@supabase/ssr` may internally de-duplicate, the [Supabase docs recommend](https://supabase.com/docs/guides/auth/server-side/nextjs) creating a single instance. `NavbarClient` calls it in `useEffect` — this is fine — but if multiple components call `createClient()`, you could have redundant GoTrue listeners.

---

## 🟢 Minor / Polish

### 16. `Cormorant_Garamond` Font Not Loading Hindi Subset
**File:** [layout.tsx](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/app/layout.tsx#L14-L19)

```ts
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  ...
});
```

Only the `latin` subset is loaded. Hindi pages using `font-serif` (Cormorant Garamond) will fall back to the browser's default serif for Devanagari characters. This may result in mismatched font styles on Hindi pages.

**Fix:** Add `"devanagari"` to the subsets, or use a different font for Hindi serif text (e.g., Noto Serif Devanagari).

### 17. No `robots` / `noindex` on `/auth/confirm` and `/auth/reset-password`
**File:** [robots.ts](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/app/robots.ts)

Only `/auth/` (trailing slash) is disallowed. Since Supabase sends email links to `/auth/confirm?...` and `/auth/reset-password?...`, these *should* be caught by the `/auth/` rule. However, confirm and reset-password pages don't have per-page `noindex` meta tags as a second layer (unlike quiz pages).

### 18. JSON-LD `teaches` Field May Be Too Large
**File:** [chapters/[slug]/page.tsx](file:///Users/abhishekarora/Documents/Bhagavad%20Gita/gita-quest/src/app/chapters/%5Bslug%5D/page.tsx#L110)

```ts
teaches: chapter.keyLessons,
```

If `keyLessons` is a large array of strings, this JSON-LD block could get quite large (injected into every chapter page). Not a functional issue, but could add unnecessary page weight.

---

## Summary Table

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 1 | 🔴 Critical | Race Condition | Daily login double XP via concurrent requests |
| 2 | 🔴 Critical | Logic Bug | Streak uses server UTC, not user timezone |
| 3 | 🔴 Critical | i18n Bug | OAuth callback ignores locale, sends to English |
| 4 | 🔴 Critical | Data Integrity | Quiz scoring uses English answer key for Hindi users |
| 5 | 🟠 Security | Info Leak | Full answer key sent to client in quiz |
| 6 | 🟠 Security | Rate Limit | No rate limiting on server actions |
| 7 | 🟠 Security | Error Handling | `requireUser()` throws raw error |
| 8 | 🟡 Performance | Database | `refreshProfile` loads all XP rows into memory |
| 9 | 🟡 SEO | Redundancy | Sitemap has 2× entries (one per locale per page) |
| 10 | 🟡 Logic | Hard-code | Dashboard hard-codes quiz total as `/25` |
| 11 | 🟡 UX | State | Daily login button doesn't show pre-claimed state |
| 12 | 🔵 UX | Navigation | Mobile navbar missing Chapters/About links |
| 13 | 🔵 UX | Loading | Dashboard has no loading/error boundaries |
| 14 | 🔵 Logic | Component | ProgressBar value/max semantics unclear |
| 15 | 🔵 Architecture | Singleton | Browser Supabase client not singleton |
| 16 | 🟢 i18n | Fonts | Cormorant Garamond missing Devanagari subset |
| 17 | 🟢 SEO | Indexing | Auth pages lack per-page noindex |
| 18 | 🟢 SEO | Page Weight | JSON-LD `teaches` could be large |

---

## What's Done Well ✅

- **RLS is solid** — all tables have owner-only policies, and the migration is clean.
- **Quiz XP gating** — the atomic `chapter_completed = false → true` update prevents duplicate chapter completion XP. Well done.
- **Locale architecture** — the proxy + header + cookie approach is clean and avoids route duplication.
- **Server actions** are properly `"use server"` annotated and validate auth before any mutation.
- **SEO** — hreflang alternates, JSON-LD, canonical URLs, OG tags are all present and correct.
- **Accessibility** — skip-to-content link, aria-labels, radio group roles in quiz, focus-visible rings.
- **Code quality** — clean TypeScript, good separation of concerns, well-documented context file.
