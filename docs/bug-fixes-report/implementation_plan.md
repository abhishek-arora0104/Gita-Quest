# Fix Plan for Code Analysis Issues

This plan addresses the bugs, architecture, and UX issues identified in the code analysis.

## User Review Required

> [!WARNING]
> **Issue 5: Answer Key Sent to the Client**
> Currently, the entire quiz and answer key are sent to the client to provide instant, optimistic feedback when an answer is selected. Moving validation to the server per question would introduce network latency for every click, harming the snappy user experience.
> **Recommendation:** Accept this trade-off for the MVP. Are you okay with leaving the client-side scoring as-is for a better UX?

## Proposed Changes

---

### Data & Actions

#### [NEW] `supabase/migrations/0002_fixes.sql`
- Add a Postgres trigger on `user_xp_log` that automatically updates `profiles.total_xp` when new XP is inserted.
- This fixes **Issue 8** (memory summation scaling) gracefully.

#### [MODIFY] `src/actions/claimDailyLogin.ts`
- **Issue 1:** Refactor to use an atomic `update` with `.or('daily_login_claimed.neq.today,daily_login_claimed.is.null')`. Only award XP if the update actually returns a row.
- **Issue 2:** Accept a `clientDate: string` parameter to use the user's local timezone instead of server UTC.

#### [MODIFY] `src/actions/markSummaryRead.ts`
- **Issue 8:** Remove the JavaScript `totalXp` summation. Fetch the already-updated `total_xp` from the `profiles` table (updated via our new trigger).
- **Issue 2:** Accept a `clientDate` parameter for streak calculations.

#### [MODIFY] `src/actions/completeQuiz.ts`
- **Issue 4:** Accept `locale: Locale` as a parameter. Use `getChapterByNumberForLocale` so Hindi quizzes are scored against the correct Hindi answer key.
- **Issue 2:** Accept `clientDate: string` for streak updates.

#### [MODIFY] `src/actions/saveReflection.ts`
- **Issue 2:** Accept `clientDate: string`.

#### [MODIFY] `src/lib/auth/session.ts`
- **Issue 7:** Modify `requireUser()` to `redirect("/auth/login")` instead of throwing a raw error.

---

### Gamification & UI

#### [MODIFY] `src/lib/content/schema.ts` & `src/lib/content/index.ts`
- Add `quizQuestionCount: number` to `ChapterSummaryMeta`.
- **Issue 10:** Update `getLibraryList` to populate `quizQuestionCount` so the dashboard doesn't hardcode `/25`.

#### [MODIFY] `src/app/dashboard/page.tsx`
- **Issue 10:** Use `ch.quizQuestionCount` instead of hardcoded `/25`.
- **Issue 11:** Pass `claimed={profile?.daily_login_claimed === today}` down to `DailyLoginButton`.

#### [NEW] `src/app/dashboard/loading.tsx` & `error.tsx`
- **Issue 13:** Add a skeleton loading state for the dashboard and an error boundary to handle network/Supabase timeouts gracefully.

#### [MODIFY] `src/components/gamification/DailyLoginButton.tsx`
- **Issue 11:** Accept an `alreadyClaimed` prop and reflect it accurately on mount. Pass `clientDate`.

#### [MODIFY] `src/components/layout/Navbar.tsx`
- **Issue 12:** Add a mobile menu implementation or adjust the layout to ensure "Chapters" and "About" links are accessible on small screens.

#### [MODIFY] `src/components/quiz/QuizEngine.tsx`
- **Issue 4 & 2:** Pass `locale` and `clientDate` to `completeQuiz`.

#### [MODIFY] `src/components/quiz/QuizResults.tsx`
- **Issue 14:** Clarify `ProgressBar` props by explicitly passing `max={100}` for the percentage.

#### [MODIFY] `src/components/chapter/ChapterActionsClient.tsx` & `ReflectionForm.tsx`
- Pass `clientDate` to their respective server actions.

---

### Core Configuration & SEO

#### [MODIFY] `src/app/auth/callback/route.ts`
- **Issue 3:** Read the `gita-locale` cookie. Prefix the `next` redirect path and the `error` redirect path with the locale to prevent Hindi users from landing on English pages.

#### [MODIFY] `src/lib/supabase/client.ts`
- **Issue 15:** Implement a module-level singleton pattern for `createBrowserClient` to prevent redundant GoTrue listeners.

#### [MODIFY] `src/app/sitemap.ts`
- **Issue 9:** Remove the outer locale loop. Create one entry per page and attach the `alternates.languages` block once.

#### [MODIFY] `src/app/robots.ts`
- **Issue 17:** Add specific disallows/noindex logic, or explicitly document that auth pages shouldn't be indexed. (We will also add `robots: { index: false }` to the confirm/reset pages).

#### [MODIFY] `src/app/layout.tsx` & `tailwind.config` / `globals.css`
- **Issue 16:** Add a Google Font that supports Devanagari (like `Noto Serif Devanagari`) and map it to the `--font-serif-hi` variable. Apply it conditionally based on the `locale`.

#### [MODIFY] `src/app/chapters/[slug]/page.tsx`
- **Issue 18:** Truncate or simplify the `teaches` field in the JSON-LD to prevent payload bloat.

## Verification Plan
1. **Migrations:** Run the Supabase local migration.
2. **Type check:** Run `npx tsc --noEmit` to ensure action signatures match.
3. **Manual UI check:** Verify mobile navbar, Devanagari font rendering, and dashboard loading state.
4. **Logic check:** Validate the daily login button state and check that Hindi quizzes use the right localized key.
