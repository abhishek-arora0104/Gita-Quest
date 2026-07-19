import { allChapters } from "@/lib/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function GET() {
  const chapterLines = allChapters
    .map(
      (c) =>
        `- [Chapter ${c.number}: ${c.title}](${siteUrl}/en/chapters/${c.slug}): ${c.subtitle}`,
    )
    .join("\n");

  const body = `# Gita Quest

> Gita Quest is a beginner-friendly platform that explains the Bhagavad Gita in simple English, Hindi, and Hinglish — each of the 18 chapters as a plain-language lesson, followed by a quiz, flashcards, and progress tracking.

Summaries are original, written from source material for a general audience with no prior background in Sanskrit or Indian philosophy assumed.

## Chapters

${chapterLines}

## Other pages

- [About](${siteUrl}/en/about): who Gita Quest is for and how the summaries are written
- [Chapter index](${siteUrl}/en/chapters): all 18 chapters in one place

## Languages

Every chapter and the pages above are also available in Hindi (/hi/...) and Hinglish, romanized Hindi (/hinglish/...).
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
