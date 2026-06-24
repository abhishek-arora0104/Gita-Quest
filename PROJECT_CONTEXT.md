# Gita Quest — Project Context

> Last updated: Review fixes complete; deployment pending
> Date: 2026-06-24

---

## Project Overview

**Gita Quest** is a beginner-friendly Bhagavad Gita learning platform.
Users read simplified chapter summaries, reflect, take quizzes, and earn XP/levels/badges/streaks.

**Tech stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase (Auth + Postgres)
**Design:** Warm spiritual palette (saffron/gold/maroon/cream), Cormorant Garamond + Inter fonts, mobile-first
**Content:** 18 fully written chapters with summaries + 25-question quizzes each
**Scope:** MVP — all gamification, auth, SEO, responsive, accessible. No leaderboards/community/AI/audio.

---

## Phase Tracker

### ✅ Phase A — Foundation (COMPLETE)
**Status:** Done · Type-check passes

- Scaffolded Next.js 16 + React 19 + Tailwind v4
- Installed `@supabase/supabase-js` + `@supabase/ssr`
- **Design system** (`globals.css`): warm spiritual palette via `@theme`, custom prose, animations, ornamental dividers, focus rings
- **Root layout** (`layout.tsx`): Inter + Cormorant Garamond fonts, global metadata, SiteShell wrapper
- **UI primitives:** `Button` (link/button polymorphic), `Card`/`CardHeader`/`CardBody`, `ProgressBar`, `Badge`, `Input`/`Textarea`
- **Layout shell:** `SiteShell`, `Navbar` (with `NavbarClient` for auth state), `Footer`
- **Homepage** (`page.tsx`): hero, how-it-works, features, CTA sections
- **About page** (`about/page.tsx`)
- **Supabase clients:** `lib/supabase/client.ts` (browser), `server.ts` (server), `middleware.ts` (session refresh)
- **Middleware** (`src/middleware.ts`): refreshes session on every request
- **Env example** (`.env.local.example`)
- **Utility:** `lib/utils/cn.ts` (className combiner)

**Files created (Phase A):**
```
src/app/globals.css, layout.tsx, page.tsx
src/app/about/page.tsx
src/middleware.ts
src/components/layout/SiteShell.tsx, Navbar.tsx, NavbarClient.tsx, Footer.tsx
src/components/ui/Button.tsx, Card.tsx, ProgressBar.tsx, Badge.tsx, Input.tsx
src/lib/supabase/client.ts, server.ts, middleware.ts
src/lib/utils/cn.ts
.env.local.example
```

---

### ✅ Phase B — Data & Auth (COMPLETE)
**Status:** Done · Type-check passes

- **Migration** (`supabase/migrations/0001_initial.sql`):
  - `profiles` (auto-created via trigger on `auth.users`)
  - `user_chapter_progress` (per-chapter completion state, PK: user_id + chapter_number)
  - `user_quiz_attempts` (every quiz attempt, JSONB answers)
  - `user_xp_log` (append-only XP ledger)
  - `user_badges` (earned badges, PK: user_id + badge_id)
  - Full RLS: all tables owner-only SELECT/INSERT/UPDATE
  - `handle_new_user()` trigger auto-creates profile
  - `touch_updated_at()` trigger for profiles + progress
- **Auth pages:** `/auth/login` + `/auth/signup` with `LoginForm` + `SignupForm` client components
- **Logout:** server action + `LogoutButton` client component
- **Session helpers:** `lib/auth/session.ts` (`getCurrentUser()`, `requireUser()`)
- **Stub dashboard:** `/dashboard/page.tsx` (placeholder, will be rebuilt in Phase E)

**Files created (Phase B):**
```
supabase/migrations/0001_initial.sql
src/app/auth/login/page.tsx, LoginForm.tsx
src/app/auth/signup/page.tsx, SignupForm.tsx
src/app/dashboard/page.tsx
src/components/auth/LogoutButton.tsx
src/lib/auth/session.ts
src/actions/auth.ts
```

---

### ✅ Phase C — Content (COMPLETE)
**Status:** Done · Type-check passes

- **Content schema** (`lib/content/schema.ts`): TypeScript interfaces for Chapter, QuizQuestion, PracticalExample, etc.
- **3 fully written chapters** (each with summary ~1500–2000 words, 5–10 practical examples, 5–10 key lessons/lessons, reflection questions, 25 quiz questions):
  - Chapter 1: Arjuna's Dilemma (Arjuna Visada Yoga) — `chapters/chapter-01.ts`
  - Chapter 2: The Wisdom of the Soul (Sankhya Yoga) — `chapters/chapter-02.ts`
  - Chapter 6: The Yoga of Meditation (Dhyana Yoga) — `chapters/chapter-06.ts`
- **Content index** (`lib/content/index.ts`): registry with helpers (`getChapterBySlug`, `getLibraryList`, `getNextChapter`, `writtenChapterSlugs`), 15 coming-soon placeholders
- **Chapter library page** (`/chapters/page.tsx`): 18-card grid, available vs coming-soon states, reading time badges
- **Chapter summary page** (`/chapters/[slug]/page.tsx`): full summary with SEO (`generateMetadata`), JSON-LD structured data, breadcrumb, progress display, reflection form, quiz CTA, next-chapter nav
- **Chapter UI components:**
  - `ChapterContent.tsx` — renders intro, story, teachings, examples, daily life lessons, takeaways, reflection
  - `PracticalExampleList.tsx` — grid of contextualized example cards with icons

**Files created (Phase C):**
```
src/lib/content/schema.ts, index.ts
src/lib/content/chapters/chapter-01.ts, chapter-02.ts, chapter-06.ts
src/app/chapters/page.tsx
src/app/chapters/[slug]/page.tsx
src/components/chapter/ChapterContent.tsx, PracticalExampleList.tsx
```

---

### ✅ Phase D — Quiz (COMPLETE)
**Status:** Done · Type-check passes

- **Gamification engine** (built as part of C→D transition):
  - `lib/gamification/xp.ts` — XP rewards, 10 levels with thresholds, `computeLevel()`, `levelProgress()`, `computeQuizScore()`
  - `lib/gamification/streaks.ts` — streak calculation logic, `updateStreak()`, milestone definitions
  - `lib/gamification/badges.ts` — 10 badge definitions, `evaluateBadges()` context evaluator
- **Server actions:**
  - `actions/markSummaryRead.ts` — +50 XP, streak update, badge eval, shared `refreshProfile()` and `evaluateAndAwardBadges()` helpers
  - `actions/saveReflection.ts` — saves/upserts reflection text, keeps streak alive
  - `actions/claimDailyLogin.ts` — +10 XP once/day, streak, badges
  - `actions/completeQuiz.ts` — the critical path: records attempt, upserts progress, awards XP (quiz/perfect/chapter), refreshes profile (xp/level/streak), evaluates badges, returns full result object
- **Quiz page** (`/chapters/[slug]/quiz/page.tsx`): loads chapter, passes questions + answer key to client
- **QuizEngine** (`components/quiz/QuizEngine.tsx`): question-by-question flow, progress bar, difficulty badge, live score tracker, option selection with A/B/C/D labels, immediate feedback with explanation, correct/wrong visual states, next/submit flow, guest vs authenticated paths
- **QuizResults** (`components/quiz/QuizResults.tsx`): score banner (color-coded), XP earned display, level-up animation, new badges grid, streak counter, retake/next-chapter actions, guest signup CTA

**Files created (Phase D):**
```
src/lib/gamification/xp.ts, streaks.ts, badges.ts
src/actions/markSummaryRead.ts, saveReflection.ts, claimDailyLogin.ts, completeQuiz.ts
src/app/chapters/[slug]/quiz/page.tsx
src/components/quiz/QuizEngine.tsx, QuizResults.tsx
```

---

### ✅ Phase E — Dashboard & Gamification UI (COMPLETE)
**Status:** Done · Type-check passes

- **Full dashboard** (`/dashboard/page.tsx`): server component fetching all user state (profile, progress, badges, attempts) and rendering:
  - Welcome header with DailyLoginButton + LogoutButton
  - Stats row: chapters completed, quiz accuracy %, streak counter
  - XP/Level progress bar
  - Chapter progress list (read/quiz status per chapter, linked to chapter pages)
  - Badge grid (10 badges, locked/unlocked states)
- **Gamification display components:**
  - `XPBar.tsx` — level name + number, total XP, progress bar to next level
  - `StreakCounter.tsx` — current streak flame + longest streak trophy
  - `BadgeGrid.tsx` — 5-col grid of all 10 badges with locked overlays
  - `DailyLoginButton.tsx` — client component, claims +10 XP once/day
- **Profile page:** not built yet (can be added post-MVP; dashboard covers the core needs)
- **Auth improvements (added post-Phase E):**
  - Google OAuth — `OAuthButtons.tsx` + `/auth/callback` route handler
  - Password reset — `/auth/forgot-password` + `/auth/reset-password` pages
  - Email verification — `/auth/confirm` page with post-signup flow
  - Protected route middleware — unauthenticated users redirected from `/dashboard`, authenticated users redirected from auth pages

**Files created (Phase E):**
```
src/app/dashboard/page.tsx (rebuilt from stub)
src/components/gamification/XPBar.tsx, StreakCounter.tsx, BadgeGrid.tsx, DailyLoginButton.tsx
src/components/auth/OAuthButtons.tsx
src/app/auth/callback/route.ts
src/app/auth/forgot-password/page.tsx, ForgotPasswordForm.tsx
src/app/auth/reset-password/page.tsx, ResetPasswordForm.tsx
src/app/auth/confirm/page.tsx
```

---

### ✅ Phase F — Polish (COMPLETE)
**Status:** Done · Type-check passes

- **SEO pass:** `sitemap.ts` (homepage, about, chapters, chapter pages), `robots.ts` (disallow auth/dashboard), OG tags on all pages, JSON-LD on chapter pages
- **Accessibility pass:** skip-to-content link, `main` landmark with id, `aria-label` on all nav elements, `role="radiogroup"` on quiz, focus-visible rings in design system
- **README.md** — full setup instructions, env vars, Supabase bootstrap, project structure, gamification rules, scripts
- **CONTENT_GUIDE.md** — tone rules, chapter structure, schema reference, template, 20+ item pre-submission checklist

**Files created/updated (Phase F):**
```
src/app/sitemap.ts (updated — added /about)
src/components/layout/Navbar.tsx (updated — skip-to-content link)
src/components/layout/SiteShell.tsx (updated — main id)
README.md (rewritten)
CONTENT_GUIDE.md (new)
```

---

## Database Schema (Supabase)

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `profiles` | User profile, auto-created | id, username, total_xp, current_level, current_streak, longest_streak, last_active_date, daily_login_claimed |
| `user_chapter_progress` | Per-chapter state | user_id + chapter_number (PK), summary_read, reflection_saved, quiz_completed, best_score, attempts, chapter_completed |
| `user_quiz_attempts` | Quiz history | id, user_id, chapter_number, answers (jsonb), score, total |
| `user_xp_log` | XP ledger | id, user_id, amount, reason, chapter_number |
| `user_badges` | Earned badges | user_id + badge_id (PK), earned_at |

All tables: RLS owner-only. Profile auto-created via trigger on `auth.users`.

---

## Gamification Rules

| Action | XP |
|--------|----|
| Read summary | +50 |
| Complete quiz | +100 |
| Perfect quiz | +200 (replaces +100) |
| Complete chapter | +150 (first time only) |
| Daily login | +10 (once/day) |

**Levels:** Beginner (0) → Seeker (300) → Student (800) → Practitioner (1500) → Disciplined Learner (2500) → Wisdom Explorer (3800) → Yogi (5300) → Gita Scholar (7000) → Spiritual Guide (9000) → Gita Master (12000)

**10 Badges:** First Steps, Chapter Master, Quiz Champion, Century of Wisdom, Gita Explorer, 5-Day Streak, 7-Day Streak, 30-Day Streak, Gita Scholar, Gita Master

---

## Key Architecture Decisions

1. **Content = static TypeScript files** in `lib/content/chapters/` — version-controlled, reviewable, statically rendered for SEO, no DB seeding needed
2. **Supabase = user state only** — profiles, progress, XP, badges, streaks
3. **Quiz completion = single atomic server action** — progress → XP → level → streak → badges
4. **Client-side quiz scoring for speed** — server action re-scores against source of truth for integrity
5. **Shared helpers in markSummaryRead.ts** — `refreshProfile()` and `evaluateAndAwardBadges()` are reused by all actions

---

## Review Fixes — 2026-06-24

- Fixed quiz results navigation by passing the real `chapterNumber` to the results screen instead of deriving it from the slug.
- Fixed login redirects so `/auth/login?redirectTo=...` returns users to the protected path after email/password or Google OAuth login.
- Hardened quiz completion XP so first-time chapter completion XP is gated by a conditional `chapter_completed = false -> true` update.
- Fixed level-up display to compute the level name from the refreshed profile total XP.
- Replaced deprecated `src/middleware.ts` with Next.js 16 `src/proxy.ts`.
- Verified `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass after the fixes.

---

## Next Steps

1. ~~SEO pass~~ ✅
2. ~~Accessibility pass~~ ✅
3. ~~README.md~~ ✅
4. ~~CONTENT_GUIDE.md~~ ✅
5. ~~Write remaining 15 chapters~~ ✅
6. Deploy to Vercel / production
7. Submit Google OAuth app for verification (before public launch)
