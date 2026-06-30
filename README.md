# Gita Quest

> **Understand the Bhagavad Gita in Simple Language**

Gita Quest is a beginner-friendly Bhagavad Gita learning platform. Read simplified chapter summaries, reflect, study flashcards, take standard or timed quizzes, and earn XP / levels / badges / streaks.

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
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_CHAT_MODEL=gemini-3.5-flash
GEMINI_MAX_OUTPUT_TOKENS=4096
CHATBOT_ENABLED=true
```

You'll find these in **Supabase Dashboard → Settings → API**.

### 3. Run the database migrations

Go to **Supabase Dashboard → SQL Editor → New query**, run the files in `supabase/migrations/` in order, and click **Run** for each one.

This creates:
- 5 tables: `profiles`, `user_chapter_progress`, `user_quiz_attempts`, `user_xp_log`, `user_badges`
- Row Level Security policies (owner-only)
- Auto-profile creation trigger on signup
- `updated_at` auto-touch triggers
- Quiz attempt metadata for timed mode (`mode`, `duration_ms`)
- Optional signed-in chatbot history (`user_chat_messages`)

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
│   ├── chapters/      # chapter library + [slug] + [slug]/quiz + [slug]/flashcards
│   └── dashboard/
├── components/
│   ├── auth/          # OAuthButtons, LogoutButton
│   ├── chapter/       # ChapterContent, PracticalExampleList, ReflectionForm
│   ├── gamification/  # XPBar, StreakCounter, BadgeGrid, DailyLoginButton
│   ├── layout/        # SiteShell, Navbar, Footer
│   ├── quiz/          # QuizEngine, QuizResults, QuizReview, QuizModePicker, FlashcardDeck
│   └── ui/            # Button, Card, ProgressBar, Badge, Input
├── lib/
│   ├── auth/          # session helpers (getCurrentUser, requireUser)
│   ├── content/       # chapter data (static TS), schema, index
│   ├── gamification/  # XP, levels, streaks, badges logic
│   ├── supabase/      # client, server, middleware helpers
│   └── utils/         # cn (className combiner)
└── proxy.ts           # locale routing + session refresh + route protection
```

---

## Content

Chapter content lives in `src/lib/content/chapters/` as static TypeScript files, with Hindi and Hinglish variants under `src/lib/content/hi/` and `src/lib/content/hinglish/`. All **18 chapters** are written and registered in all three locales, each with a simplified summary, practical examples, reflection prompts, flashcard source material, and a 25-question quiz.

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

Filtered difficulty quizzes are treated as practice attempts: they score only the attempted questions and do not award full-quiz XP or mark the chapter quiz complete. Full standard/timed quiz attempts continue to drive chapter progress and XP.

---

## Chatbot

Gita Quest includes a floating multilingual Gita helper. It uses Gemini directly for detailed answers in English, Hindi, and Hinglish.

- Requires `GEMINI_API_KEY`.
- Does not use the local chapter knowledge base for answers.
- Uses a larger Gemini output budget and asks Gemini to continue automatically if an answer hits the token limit.
- Returns an error if Gemini is unavailable or `CHATBOT_ENABLED=false`.
- Does not show Vedabase links or bulk-copy/store Vedabase text.
- Stores optional chat history only for signed-in users via `user_chat_messages`.
- Anonymous users keep chat state in the browser session only.

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
