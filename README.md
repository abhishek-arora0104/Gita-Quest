# Gita Quest

> **Understand the Bhagavad Gita in Simple Language**

Gita Quest is a beginner-friendly Bhagavad Gita learning platform. Read simplified chapter summaries, reflect, take quizzes, and earn XP / levels / badges / streaks.

**Live demo:** coming soon

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth & DB | Supabase (Auth + Postgres + RLS) |
| Fonts | Inter + Cormorant Garamond (Google Fonts) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or pnpm / yarn)
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & install

```bash
git clone <your-repo-url> gita-quest
cd gita-quest
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You'll find these in **Supabase Dashboard → Settings → API**.

### 3. Run the database migration

Go to **Supabase Dashboard → SQL Editor → New query**, paste the contents of `supabase/migrations/0001_initial.sql`, and click **Run**.

This creates:
- 5 tables: `profiles`, `user_chapter_progress`, `user_quiz_attempts`, `user_xp_log`, `user_badges`
- Row Level Security policies (owner-only)
- Auto-profile creation trigger on signup
- `updated_at` auto-touch triggers

### 4. (Optional) Set up Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → Create a project
2. **APIs & Services → OAuth consent screen** → External, add app name
3. **Credentials → Create OAuth client ID** → Web application
   - Authorized JS origin: `https://<your-project>.supabase.co`
   - Authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
4. **Supabase Dashboard → Authentication → Providers → Google** → paste Client ID & Secret

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── actions/           # Server Actions (quiz, XP, streaks, auth)
├── app/               # Next.js App Router pages
│   ├── about/
│   ├── auth/          # login, signup, forgot-password, reset-password, callback, confirm
│   ├── chapters/      # chapter library + [slug] + [slug]/quiz
│   └── dashboard/
├── components/
│   ├── auth/          # OAuthButtons, LogoutButton
│   ├── chapter/       # ChapterContent, PracticalExampleList, ReflectionForm
│   ├── gamification/  # XPBar, StreakCounter, BadgeGrid, DailyLoginButton
│   ├── layout/        # SiteShell, Navbar, Footer
│   ├── quiz/          # QuizEngine, QuizResults
│   └── ui/            # Button, Card, ProgressBar, Badge, Input
├── lib/
│   ├── auth/          # session helpers (getCurrentUser, requireUser)
│   ├── content/       # chapter data (static TS), schema, index
│   ├── gamification/  # XP, levels, streaks, badges logic
│   ├── supabase/      # client, server, middleware helpers
│   └── utils/         # cn (className combiner)
└── middleware.ts      # session refresh + route protection
```

---

## Content

Chapter content lives in `src/lib/content/chapters/` as static TypeScript files. All **18 chapters** are written and registered, each with a simplified summary, practical examples, reflection prompts, and a 25-question quiz.

See `CONTENT_GUIDE.md` for the structure, tone rules, and template for writing new chapters.

---

## Gamification

| Action | XP |
|--------|-----|
| Read summary | +50 |
| Complete quiz | +100 |
| Perfect quiz | +200 (replaces +100) |
| Complete chapter | +150 (first time) |
| Daily login | +10 (once/day) |

**10 Levels:** Beginner → Seeker → Student → Practitioner → Disciplined Learner → Wisdom Explorer → Yogi → Gita Scholar → Spiritual Guide → Gita Master

**10 Badges:** First Steps, Chapter Master, Quiz Champion, Century of Wisdom, Gita Explorer, 5-Day Streak, 7-Day Streak, 30-Day Streak, Gita Scholar, Gita Master

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting |

---

## License

All chapter summaries and quiz content are original and written for educational purposes.
