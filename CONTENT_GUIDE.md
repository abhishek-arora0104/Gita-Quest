# Content Guide — Gita Quest

> How to write new chapter content for Gita Quest.

This guide defines the structure, tone, and quality checklist for all chapter content. Every chapter lives as a static TypeScript file in `src/lib/content/chapters/`.

---

## File Naming

```
chapter-XX.ts    (e.g. chapter-03.ts, chapter-14.ts)
```

Each file default-exports a `Chapter` object matching the schema in `src/lib/content/schema.ts`.

---

## Tone & Style Rules

1. **Plain English.** A 12-year-old should comfortably understand every sentence.
2. **No untranslated Sanskrit** without immediate explanation. Example: "This is called *Nishkama Karma* — doing your duty without expecting rewards."
3. **Active voice.** "Krishna teaches Arjuna" not "Arjuna is taught by Krishna."
4. **Relatable examples.** Use school, career, relationships, sports, social media, and daily life.
5. **Conversational, not academic.** Imagine explaining the chapter to a curious friend.
6. **Respectful.** Treat the text as sacred — simplify but never trivialize.
7. **No external citations.** All content must be original.

---

## Chapter Structure

Every chapter must include all of these fields:

### Metadata

| Field | Description | Example |
|-------|-------------|---------|
| `number` | Chapter number (1–18) | `3` |
| `slug` | URL slug | `"the-yoga-of-action"` |
| `title` | English title | `"The Yoga of Action"` |
| `sanskritName` | Original Sanskrit name | `"Karma Yoga"` |
| `subtitle` | One-line theme | `"Why action matters more than results"` |
| `readingTimeMins` | Estimated reading time | `12` |
| `wordCount` | Approximate word count of summary | `1800` |

### Content Sections

| Section | Target | Notes |
|---------|--------|-------|
| `intro` | 2–3 paragraphs | Set the scene, explain why this chapter matters |
| `storyOverview` | 3–5 paragraphs | What happens in the chapter, told simply |
| `mainTeachings` | 3–6 items | Each with `heading` and `body` (1–2 paragraphs) |
| `practicalExamples` | 5–10 items | Each with `context` (from `ExampleContext` type) and `text` |
| `lessonsForDailyLife` | 5–10 bullets | Actionable one-liners |
| `keyTakeaways` | 5–10 bullets | Crisp, memorable summaries |
| `keyLessons` | 5–10 bullets | Distinct from takeaways — focus on principles |
| `reflectionQuestions` | 3–5 questions | Open-ended, personal |

### SEO

```typescript
seo: {
  metaTitle: "Bhagavad Gita Chapter 3 Summary — The Yoga of Action (Karma Yoga)",
  metaDescription: "Simplified summary of Bhagavad Gita Chapter 3...",
  keywords: ["Bhagavad Gita Chapter 3", "Karma Yoga", ...],
}
```

- `metaTitle`: include "Bhagavad Gita Chapter X Summary" + subtitle
- `metaDescription`: 150–160 chars, compelling, includes key terms
- `keywords`: 5–8 relevant search terms

### Quiz (25 Questions)

| Difficulty | Count | Notes |
|-----------|-------|-------|
| `easy` | 10 | Recall-based, direct from the text |
| `medium` | 10 | Application and understanding |
| `hard` | 5 | Inference, comparison, deeper reasoning |

Each question:

```typescript
{
  id: "ch03-q01",               // format: chXX-qNN
  difficulty: "easy",
  question: "What does Krishna tell Arjuna about action?",
  options: ["A", "B", "C", "D"],  // exactly 4, similar length
  correctIndex: 2,                // 0-indexed
  explanation: "Krishna explains that..."  // 1-2 sentences
}
```

**Quiz rules:**
- Questions must come from the chapter content (no external knowledge required)
- Wrong options must be plausible but clearly wrong
- Explanations should teach, not just say "the answer is C"
- Keep options roughly similar in length to avoid giving away the answer
- Question IDs must be unique across all chapters

---

## Template

```typescript
import type { Chapter } from "../schema";

const chapterXX: Chapter = {
  number: XX,
  slug: "slug-here",
  title: "Title Here",
  sanskritName: "Sanskrit Name",
  subtitle: "One-line theme",
  readingTimeMins: 12,
  wordCount: 1800,

  intro: `...`,
  storyOverview: `...`,

  mainTeachings: [
    { heading: "...", body: "..." },
  ],

  practicalExamples: [
    { context: "School", text: "..." },
    { context: "Career", text: "..." },
  ],

  lessonsForDailyLife: ["...", "..."],
  keyTakeaways: ["...", "..."],
  keyLessons: ["...", "..."],
  reflectionQuestions: ["...", "..."],

  seo: {
    metaTitle: "Bhagavad Gita Chapter XX Summary — ...",
    metaDescription: "...",
    keywords: ["..."],
  },

  quiz: [
    // 10 easy, 10 medium, 5 hard
    {
      id: "chXX-q01",
      difficulty: "easy",
      question: "...",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      explanation: "...",
    },
    // ...24 more
  ],
};

export default chapterXX;
```

---

## Checklist (Before Submitting a New Chapter)

- [ ] File is named `chapter-XX.ts` and placed in `src/lib/content/chapters/`
- [ ] All `Chapter` schema fields are filled — no empty strings or placeholders
- [ ] `number` matches the file name
- [ ] `slug` is kebab-case and unique
- [ ] `intro` is 2–3 paragraphs, sets the scene
- [ ] `storyOverview` is 3–5 paragraphs, tells the chapter story simply
- [ ] `mainTeachings` has 3–6 entries with heading + body
- [ ] `practicalExamples` has 5–10 entries with varied contexts
- [ ] `lessonsForDailyLife` has 5–10 actionable bullets
- [ ] `keyTakeaways` has 5–10 memorable bullets
- [ ] `keyLessons` has 5–10 principle-focused bullets
- [ ] `reflectionQuestions` has 3–5 open-ended questions
- [ ] SEO: `metaTitle` includes "Bhagavad Gita Chapter X Summary"
- [ ] SEO: `metaDescription` is 150–160 characters
- [ ] SEO: `keywords` has 5–8 relevant terms
- [ ] Quiz: exactly 25 questions (10 easy, 10 medium, 5 hard)
- [ ] Quiz: all `id` values follow `chXX-qNN` format
- [ ] Quiz: every `explanation` teaches, not just states the answer
- [ ] Quiz: options are plausible and similar in length
- [ ] Word count is 1500–2000 words total
- [ ] Reading time is accurate (divide word count by ~150)
- [ ] Chapter imported and registered in `src/lib/content/index.ts`
- [ ] `npx tsc --noEmit` passes with no errors
