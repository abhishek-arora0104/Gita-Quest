# Next Steps — Current Handoff

**Last updated:** 2026-06-30

---

## Completed ✅

### Three-locale content and UI

- English, Hindi, and Hinglish are fully wired at `/en`, `/hi`, and `/hinglish`.
- All 18 chapters exist in all three locales.
- Each chapter has 25 quiz questions with a 10 easy / 10 medium / 5 hard split.
- Locale-aware metadata, sitemap, robots, and language switching are in place.

### Quiz enhancements

- Quiz setup screen with standard/timed modes and difficulty filters.
- Timed quiz countdown with auto-submit and persisted `duration_ms`.
- Difficulty-filtered practice attempts:
  - Score only against attempted question indexes.
  - Do not mark full chapter quiz completion.
  - Do not award full quiz/chapter XP.
- Answer review after submission with localized skipped-answer labels.
- Flashcard revision route per chapter at `/{locale}/chapters/{slug}/flashcards`.
- Flashcard links from chapter pages and quiz results.
- Dashboard shows best timed attempt by score, with duration as tie-break/context.
- Chapter CTA button sizing fixed so quiz/flashcard actions remain compact and single-line.

### Database

- Added migration: `supabase/migrations/20230101000002_quiz_mode_and_duration.sql`
- Adds `user_quiz_attempts.mode` and `user_quiz_attempts.duration_ms`.

---

## Validation ✅

Passed locally:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Note: sandboxed builds can fail when `next/font` cannot fetch Google Fonts. The production build passes when network access is available.

Smoke-tested routes:

- `/en/chapters/arjunas-dilemma/flashcards`
- `/hi/chapters/arjunas-dilemma/flashcards`
- `/hinglish/chapters/arjunas-dilemma/flashcards`
- `/en/chapters/arjunas-dilemma/quiz`
- `/hinglish/chapters/arjunas-dilemma/quiz`

---

## Remaining Operational Steps

1. Apply the latest Supabase migration before production use:

```bash
supabase db push
# or run the SQL in supabase/migrations/20230101000002_quiz_mode_and_duration.sql
```

2. Deploy to Vercel / production.

3. Submit Google OAuth app for verification before public launch.

4. Recommended before launch: human copy pass for Hindi and Hinglish content.
